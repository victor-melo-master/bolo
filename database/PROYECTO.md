# database — Inicialización de Base de Datos

## Descripción General

Script SQL único (`init.sql`) que define el esquema completo de la base de datos de BOLO, cubriendo tanto el MVP como la Fase 2. Se ejecuta automáticamente al crear el contenedor de PostgreSQL por primera vez, montado como `docker-entrypoint-initdb.d/01_init.sql`.

El diseño sigue una arquitectura multi-esquema con separación lógica por dominio (microservicios), tipos ENUM para estados finitos, funciones auxiliares con PL/pgSQL, triggers de inmutabilidad y auditoría, índices optimizados (compuestos, parciales, espaciales GIST, cubrientes) y seeders para datos iniciales. Los UUIDs v7 (ordenables temporalmente) se generan con la función nativa de PostgreSQL 18.

## Archivo

```
database/
└── init.sql              # Script completo (725 líneas)
```

## Estructura del Script

El script se divide en 9 secciones que deben ejecutarse en orden estricto debido a las dependencias entre objetos:

### 1. Extensiones

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- crypt() y gen_salt() para bcrypt
CREATE EXTENSION IF NOT EXISTS postgis;       -- GEOGRAPHY, GIST, ST_Distance
```

- **pgcrypto**: Hashing de contraseñas con bcrypt (`crypt()` + `gen_salt('bf', 10)`)
- **PostGIS**: Tipos geoespaciales (`GEOGRAPHY`, `GEOMETRY`), índices GIST, funciones de distancia

### 2. Esquemas (5 dominios)

| Esquema | Microservicio          | Propósito                          |
|---------|------------------------|-------------------------------------|
| `auth`  | Auth & Users           | Usuarios, roles, asociaciones, KYC  |
| `ops`   | Fleet & Operations     | Rutas, vehículos, asignaciones      |
| `fin`   | Wallet & Financial     | Billeteras, pagos, comisiones, tasas, sagas |
| `trip`  | Trip Execution         | Viajes, pagos asociados, historial GPS |
| `audit` | Auditoría Global       | Logs inmutables de acciones sensibles |

### 3. Tipos ENUM (10)

| ENUM                          | Esquema | Valores                                              |
|-------------------------------|---------|------------------------------------------------------|
| `auth.user_role`              | auth    | `passenger`, `driver`, `association_admin`, `super_admin` |
| `auth.user_category`          | auth    | `normal`, `student`, `elderly`                       |
| `auth.driver_request_status`  | auth    | `pending`, `approved`, `rejected`                   |
| `trip.trip_status`            | trip    | `requested`, `active`, `completed`, `cancelled`, `pending_credit` |
| `fin.transaction_type`        | fin     | `deposit`, `withdrawal`, `refund`, `commission`, `adjustment` |
| `fin.transaction_status`      | fin     | `pending`, `completed`, `failed`                     |
| `fin.payment_method`          | fin     | `wallet`, `card`, `sms`                              |
| `fin.payment_status`          | fin     | `pending`, `processing`, `completed`, `failed`, `refunded` |
| `fin.saga_status`             | fin     | `pending`, `in_progress`, `completed`, `failed`, `compensating`, `compensated` |

### 4. Funciones Auxiliares (3)

| Función                           | Propósito                                                                 |
|-----------------------------------|---------------------------------------------------------------------------|
| `update_updated_at_column()`      | Trigger function: asigna `NOW()` a `updated_at` en cada UPDATE            |
| `prevent_modifications()`         | Trigger function: lanza excepción si se intenta UPDATE o DELETE en tablas inmutables |
| `uuidv7()` (comentada, PG <18)    | Generación de UUID v7 en PL/pgSQL (solo si PostgreSQL < 18)              |

La función `uuidv7()` nativa de PostgreSQL 18 está disponible sin necesidad de extensiones. Para versiones anteriores, descomentar la implementación PL/pgSQL.

### 5. Tablas (14)

#### auth (3 tablas)

| Tabla              | Propósito                                              | Columnas clave                        |
|--------------------|--------------------------------------------------------|---------------------------------------|
| `auth.users`       | Usuarios del sistema (login por teléfono)              | `phone`, `password_hash`, `role`, `qr_code` |
| `auth.associations`| Cooperativas de transporte                             | `name`, `rif`, `admin_id`             |
| `auth.driver_requests` | Solicitudes KYC de conductores                     | `driver_id`, `association_id`, `status` |

#### fin (6 tablas)

| Tabla                 | Propósito                                             | Columnas clave                        |
|------------------------|--------------------------------------------------------|---------------------------------------|
| `fin.exchange_rates`   | Tasas de cambio diarias (BCV)                         | `currency`, `rate`, `effective_date`  |
| `fin.coop_fares`       | Tarifarios de cada cooperativa                         | `association_id`, `base_amount_usd` (centavos), `exchange_rate_id` |
| `fin.wallets`          | Billeteras de usuarios                                 | `user_id`, `balance`, `debt_balance`, `version` (OCC) |
| `fin.transactions`     | Historial inmutable de movimientos                     | `wallet_id`, `type`, `amount`, `status` |
| `fin.rates_config`     | Configuración global de comisiones y tarifas base      | `commission_percentage`, `base_fare_usd` |
| `fin.saga_states`      | Estado de sagas transaccionales (patrón SAGA)          | `transaction_id`, `current_step`, `status` |

#### ops (3 tablas)

| Tabla                 | Propósito                                             | Columnas clave                        |
|------------------------|--------------------------------------------------------|---------------------------------------|
| `ops.routes`           | Rutas de transporte por asociación                     | `association_id`, `coop_fare_id`      |
| `ops.vehicles`         | Vehículos registrados                                  | `association_id`, `plate`, `capacity` |
| `ops.assigned_routes`  | Asignación diaria conductor → ruta + vehículo          | `driver_id`, `route_id`, `vehicle_id`, `is_active` |

#### trip (3 tablas)

| Tabla                 | Propósito                                             | Columnas clave                        |
|------------------------|--------------------------------------------------------|---------------------------------------|
| `trip.trips`           | Registro de cada viaje                                 | `passenger_id`, `driver_id`, `origin_geom` (GEOGRAPHY), `status`, `fare` |
| `trip.payments`        | Pago asociado a un viaje (1:1)                         | `trip_id`, `amount`, `method`, `status` |
| `trip.gps_history`     | Historial GPS del viaje (~1 punto/segundo)             | `trip_id`, `location` (GEOGRAPHY), `speed`, `recorded_at` |

#### audit (1 tabla)

| Tabla             | Propósito                                             |
|-------------------|--------------------------------------------------------|
| `audit.audit_log` | Logs inmutables de acciones sensibles                  |

### 6. Índices (~35)

El script crea ~35 índices cuidadosamente diseñados:

- **Compuestos**: `idx_trips_passenger_status` cubre la consulta "viajes activos del pasajero X"
- **Parciales**: `idx_active_drivers` solo indexa conductores activos (menos espacio, más velocidad)
- **Espaciales GIST**: `idx_trips_origin_geom`, `idx_gps_location` para búsquedas geoespaciales
- **Cubrientes (INCLUDE)**: `idx_wallets_user_balance` permite index-only scans para OCC
- **Únicos**: `idx_exchange_rates_unique` evita duplicados por moneda+fecha

### 7. Triggers (3)

| Trigger                    | Tabla(s)                   | Comportamiento                                     |
|----------------------------|----------------------------|----------------------------------------------------|
| `trg_immutable_transactions` | `fin.transactions`       | Bloquea UPDATE/DELETE (correcciones = nuevo registro tipo 'adjustment') |
| `trg_immutable_audit`        | `audit.audit_log`        | Bloquea UPDATE/DELETE (logs inmutables por diseño) |
| `set_updated_at`             | Todas con columna `updated_at` | Asigna `NOW()` automáticamente en cada UPDATE   |

### 8. TimescaleDB (opcional)

El script incluye instrucciones comentadas para convertir `trip.gps_history` en hypertable de TimescaleDB, particionada por `recorded_at` con chunks de 1 día. Mejora drásticamente consultas de rango temporal y permite compresión automática.

### 9. Seeders (6 registros iniciales)

| Seeder                          | Propósito                                      |
|---------------------------------|------------------------------------------------|
| Super Admin                     | `+584121234567` / `admin123` (cambiar en prod) |
| Billetera del Super Admin       | Saldo 0 USD                                    |
| Config inicial de comisiones    | 10% comisión, $1.50 tarifa base                |
| Tasa de cambio inicial          | 36.50 VES/USD                                  |
| Asociación de ejemplo           | "Cooperativa Bolivariana", RIF J-12345678-9    |
| Tarifario de ejemplo            | $1.50 base, -50¢ estudiantes, -30¢ tercera edad|

## Requisitos de Despliegue

- **PostgreSQL 18+** con soporte nativo de `uuidv7()`
- **PostGIS 3** instalado (extensión geoespacial)
- Si se usa PostgreSQL < 18, descomentar la función `uuidv7()` personalizada (líneas 128-146)

## Notas Técnicas Importantes

1. **Inmutabilidad**: `fin.transactions` y `audit.audit_log` no pueden modificarse ni eliminarse. Cualquier corrección financiera se hace con un nuevo registro tipo `'adjustment'` o `'refund'`.
2. **Precisión monetaria**: Todos los montos se almacenan en **centavos** como `BIGINT` (ej: 150 = $1.50). Nunca se usan `FLOAT`/`NUMERIC` para cantidades de dinero.
3. **UUID v7**: Los UUIDs ordenables mejoran el rendimiento de índices B-tree frente a UUID v4 (aleatorios). Las inserciones son secuenciales en lugar de dispersas.
4. **OCC (Optimistic Concurrency Control)**: La columna `version` en `fin.wallets` se incrementa en cada UPDATE para detectar conflictos de escritura concurrente.
5. **Geoespacial**: Las columnas `origin_geom` y `location` usan `GEOGRAPHY(Point, 4326)` (WGS84) para cálculos de distancia reales en metros.
6. **Idempotencia**: Todos los seeders usan `ON CONFLICT DO NOTHING` para ser re-ejecutables sin duplicar datos.
