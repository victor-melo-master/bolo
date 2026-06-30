# `database/` — Esquema y semilla de la base de datos

Contiene la definición completa del esquema de **PostgreSQL 18 + PostGIS** para el MVP de BOLO.

## Archivos

| Archivo | Propósito |
|---|---|
| `init.sql` | Script DDL completo: extensiones, esquemas, tipos ENUM, tablas, índices, triggers y datos iniciales |
| `PROYECTO.md` | Notas del proyecto (pre-existente) |

## `init.sql` — Esquema completo (690 líneas)

El script está diseñado para ejecutarse en el `docker-entrypoint-initdb.d/` de PostgreSQL. Es **idempotente** (usa `IF NOT EXISTS`, `ON CONFLICT DO NOTHING` y `DROP TRIGGER IF EXISTS`).

### Orden de ejecución

```
1. Extensiones           pgcrypto, postgis
2. Esquemas              auth, ops, fin, trip, audit
3. Tipos ENUM            admin_role, passenger_category, driver_request_status,
                         trip_status, transaction_type, transaction_status,
                         payment_method, payment_status, saga_status
4. Funciones             update_updated_at_column(), prevent_modifications()
5. Tablas                (ver detalle abajo)
6. Índices               63 índices de rendimiento
7. Triggers              inmutabilidad y updated_at automático
8. Seeders               super_admin por defecto, billetera, tarifas, asociación
```

### Esquemas (separación por microservicio)

| Esquema | Microservicio | Tablas |
|---|---|---|
| `auth` | Auth & Users | `passengers`, `admins`, `associations`, `driver_requests`, `sessions` |
| `ops` | Fleet & Operations | `routes`, `vehicles`, `assigned_routes` |
| `fin` | Wallet & Financial | `exchange_rates`, `coop_fares`, `wallets`, `transactions`, `rates_config`, `saga_states` |
| `trip` | Trip Execution | `trips`, `payments`, `gps_history` |
| `audit` | Auditoría | `audit_log` |

### Tablas principales

| Tabla | Esquema | Propósito |
|---|---|---|
| `passengers` | auth | Usuarios pasajeros. Login por teléfono, categoría tarifaria, soft delete |
| `admins` | auth | Administradores y conductores. Roles: `driver`, `association_admin`, `super_admin`. Incluye `qr_code` y `qr_key` para generación de QR |
| `associations` | auth | Cooperativas de transporte. RIF venezolano, relación con admin |
| `sessions` | auth | Sesiones JWT por dispositivo y tipo de usuario (rotación de claves) |
| `routes` | ops | Rutas de transporte asociadas a un tarifario (`coop_fare_id`) |
| `vehicles` | ops | Vehículos registrados por asociación |
| `assigned_routes` | ops | Asignación diaria conductor → ruta + vehículo |
| `exchange_rates` | fin | Tasas de cambio diarias (BCV) |
| `coop_fares` | fin | Tarifarios por asociación con recargos por categoría |
| `wallets` | fin | Billeteras con OCC (`version`) y crédito de emergencia |
| `transactions` | fin | Historial inmutable de movimientos (todos los UPDATE/DELETE están bloqueados por trigger) |
| `rates_config` | fin | Comisiones y tarifas base globales |
| `saga_states` | fin | Estado de sagas transaccionales distribuidas |
| `trips` | trip | Viajes con geolocalización PostGIS y auditoría financiera |
| `payments` | trip | Pagos asociados a viajes (relación 1:1) |
| `gps_history` | trip | Historial GPS en tiempo real durante el viaje |
| `audit_log` | audit | Log de acciones sensibles (inmutable) |

### Triggers

- **`trg_immutable_transactions`** — Bloquea UPDATE/DELETE en `fin.transactions`
- **`trg_immutable_audit`** — Bloquea UPDATE/DELETE en `audit.audit_log`
- **`set_updated_at`** — Actualiza automáticamente `updated_at` en todas las tablas que tengan la columna

### Seeders

El script inserta datos iniciales para desarrollo:

1. **Super Admin** por defecto: `+584121234567` / `admin@bolo.com` / contraseña `admin123`
2. **Billetera** del Super Admin (saldo 0)
3. **Configuración de comisiones**: 10% (`1000` = 10.00%), tarifa base $1.50 USD
4. **Tasa de cambio** inicial: 36.50 VES/USD
5. **Asociación de ejemplo**: "Cooperativa Bolivariana" (RIF: J-12345678-9)
6. **Tarifario**: $1.50 USD base, descuento estudiante (-50), tercera edad (-30)

## Relación con el resto del proyecto

```
docker-compose.yml  →  monta ./database/init.sql en /docker-entrypoint-initdb.d/
                            │
                      postgres:18 + PostGIS
                            │
                      API (NestJS)  →  consulta las tablas por esquema
                            │
                      Middleware (Go Fiber)  →  proxy de seguridad
                            │
                      Frontend (React)  →  consume la API a través del middleware
```
