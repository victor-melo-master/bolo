# 🐘 POSTGRESQL 18 + PostGIS — BASE DE DATOS (BOLO)

> PostgreSQL es el **almacén permanente** del sistema. Guarda usuarios, viajes, billeteras, tarifas y todo el historial.
> Corre **PostgreSQL 18** con **PostGIS 3** para datos geoespaciales y **pgcrypto** para hashing bcrypt.

---

## 📌 Arquitectura General

```
                     ┌──────────────────────────────────┐
                     │       PostgreSQL 18 + PostGIS     │
                     │                                  │
                     │  ┌──────┐ ┌──────┐ ┌──────┐    │
                     │  │ auth │ │ ops  │ │ fin  │    │
                     │  │      │ │      │ │      │    │
                     │  │ 5 tbls│ │ 3 tbls│ │ 6 tbls│   │
                     │  └──────┘ └──────┘ └──────┘    │
                     │  ┌──────┐ ┌──────┐             │
                     │  │ trip │ │audit│             │
                     │  │      │ │      │             │
                     │  │ 3 tbls│ │ 1 tbl │            │
                     │  └──────┘ └──────┘             │
                     │                                  │
                     │  5 esquemas · 18 tablas · 63 índices│
                     └──────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              db_net (internal)    cache_net (internal)
                    │                   │
               API (NestJS)        Middleware (Go Fiber)
                    │                   │
               pgAdmin (tools)     (fallback sesiones)
```

---

## 🚀 Flujo de Despliegue

### 1. Lo que necesita para arrancar

```
PostgreSQL 18 + PostGIS
│
├── 🐋 Dockerfile          → postgres:18 + PostGIS 3
├── 📄 pg_hba.conf         → SCRAM-SHA-256, solo red Docker
├── 📜 database/init.sql   → Schema completo (DDL + seeders)
│   (montado en /docker-entrypoint-initdb.d/01_init.sql)
│
├── 🔐 pg_password         → Docker Secret en /run/secrets/
├── 💾 postgres_data       → Volumen persistente en /var/lib/postgresql/18/data
├── 🌐 db_net              → Red interna (API + pgAdmin)
│
└── ⚙️ Variables de entorno:
    ├── POSTGRES_DB        = bolo
    ├── POSTGRES_USER      = bolo_admin
    └── POSTGRES_PASSWORD_FILE = /run/secrets/pg_password
```

### 2. Cómo se levanta (Docker Compose)

```yaml
postgres:
  build:
    context: ./postgres
    dockerfile: Dockerfile
  container_name: bolo_postgres
  environment:
    POSTGRES_DB:              ${POSTGRES_DB}
    POSTGRES_USER:            ${POSTGRES_USER}
    POSTGRES_PASSWORD_FILE:   /run/secrets/pg_password
    POSTGRES_HOST_AUTH_METHOD: scram-sha-256
    POSTGRES_INITDB_ARGS:     "--auth-host=scram-sha-256 --auth-local=scram-sha-256"
  secrets:
    - pg_password
  ports:
    - "127.0.0.1:5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/18/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/01_init.sql:ro
    - ./postgres/pg_hba.conf:/etc/postgresql/pg_hba.conf:ro
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
  networks:
    - db_net
```

### 3. Orden de arranque

```
postgres (healthy) ──► API (healthy) ──► middleware (healthy) ──► frontend
                                          │
                                    redis (healthy)
```

PostgreSQL es el **primer servicio** que debe estar saludable. Sin BD, nada funciona.

---

## ⚙️ Valores de Configuración

### Secretos

| Secreto          | Origen                      | Cómo se inyecta                              |
| ---------------- | --------------------------- | -------------------------------------------- |
| `pg_password`    | `secrets/pg_password.txt`   | `POSTGRES_PASSWORD_FILE=/run/secrets/pg_password` |
| `pgadmin_password` | `secrets/pgadmin_password.txt` | `PGADMIN_DEFAULT_PASSWORD_FILE=/run/secrets/pgadmin_password` |

En desarrollo se generan con `make init` → `openssl rand -hex 20`.

### Variables de entorno (.env)

| Variable                  | Default         | ¿Qué hace?                                   |
| ------------------------- | --------------- | -------------------------------------------- |
| `POSTGRES_DB`             | `bolo`          | Nombre de la base de datos                   |
| `POSTGRES_USER`           | `bolo_admin`    | Usuario administrador                        |
| `POSTGRES_HOST_AUTH_METHOD` | `scram-sha-256` | Solo autenticación con contraseña            |
| `POSTGRES_INITDB_ARGS`    | —               | Fuerza SCRAM desde la inicialización         |
| `PGADMIN_EMAIL`           | `admin@bolo.com` | Email del admin de pgAdmin                  |

### pg_hba.conf — autenticación

```conf
# Conexiones locales (dentro del contenedor)
local   all   all   scram-sha-256

# IPv4: solo desde la red Docker (172.16.0.0/12)
host    all   all   172.16.0.0/12   scram-sha-256

# IPv6 loopback
host    all   all   ::1/128         scram-sha-256

# TODO lo demás → RECHAZADO
host    all   all   0.0.0.0/0       reject
```

**Seguridad:**
- ✅ Solo `scram-sha-256` (el método más seguro de PostgreSQL)
- ✅ No hay `md5` ni `trust`
- ✅ Conexiones solo desde la red Docker
- ✅ Todo lo externo se rechaza explícitamente

---

## 📜 init.sql — El Esquema Completo

El archivo `database/init.sql` (~680 líneas) define **todo** el esquema. Se monta en `/docker-entrypoint-initdb.d/01_init.sql` y se ejecuta automáticamente la primera vez que arranca PostgreSQL.

### Orden de ejecución (importante: tiene dependencias)

```
init.sql
│
├── 1. Extensiones         pgcrypto, postgis
│
├── 2. Esquemas            auth, ops, fin, trip, audit
│
├── 3. Tipos ENUM (9)      admin_role, passenger_category, driver_request_status,
│                          trip_status, transaction_type, transaction_status,
│                          payment_method, payment_status, saga_status
│
├── 4. Funciones           update_updated_at_column(), prevent_modifications()
│
├── 5. Tablas (18)         passengers, admins, associations, sessions,
│   ┌── auth ──────────►   driver_requests
│   ├── fin  ──────────►   exchange_rates, coop_fares, wallets, transactions,
│   │                      rates_config, saga_states
│   ├── ops  ──────────►   routes, vehicles, assigned_routes
│   ├── trip ──────────►   trips, payments, gps_history
│   └── audit ─────────►   audit_log
│
├── 6. FK circulares       admins → associations, associations → admins
│
├── 7. Índices (63)        compuestos, parciales, espaciales GIST, cubrientes
│
├── 8. Triggers            inmutabilidad (transactions, audit_log)
│                          + updated_at automático en todas las tablas
│
└── 9. Seeders             super_admin, billetera, comisiones,
                           tasa de cambio, asociación, tarifario
```

### ¿Por qué este orden?

```
Extensión ──► Esquema ──► ENUM ──► Función ──► Tabla ──► FK ──► Índice ──► Trigger ──► Seed
   │            │          │         │           │        │       │           │          │
   ▼            ▼          ▼         ▼           ▼        ▼       ▼           ▼          ▼
postgis     auth.*      auth.     función    tabla      ALTER   CREATE      CREATE     INSERT
pgcrypto    fin.*       admin_role  trigger  referecia  TABLE   INDEX       TRIGGER   INTO
            ...         ...         ...      ENUM       FK      ...         ...       ...
```

### Seeders — datos iniciales

| Seeder                    | Valores                                           | Propósito                             |
| ------------------------- | ------------------------------------------------- | ------------------------------------- |
| 👤 Super Admin            | `+584121234567` / `admin@bolo.com` / `admin123`   | Primer usuario del sistema            |
| 💰 Billetera Super Admin  | Balance: $0.00 USD                                | Billetera del admin                   |
| ⚙️ Comisiones globales    | 10% comisión, $1.50 tarifa base                   | Config inicial de rates_config        |
| 💱 Tasa de cambio inicial | 36.50 VES/USD                                     | Tasa BCV de referencia                |
| 🏢 Asociación ejemplo     | "Cooperativa Bolivariana", RIF J-12345678-9       | Cooperativa de prueba                 |
| 📋 Tarifario ejemplo      | $1.50 base, -50¢ estudiantes, -30¢ tercera edad   | Tarifario asociado a la cooperativa   |

---

## 🔒 Tablas Inmutables

Dos tablas **no se pueden modificar ni eliminar**. Cualquier intento de UPDATE o DELETE lanza una excepción:

```
fin.transactions
  ├── historial de MOVIMIENTOS de billetera
  ├── ⛔ UPDATE → EXCEPTION
  └── ⛔ DELETE → EXCEPTION

audit.audit_log
  ├── registro de ACCIONES SENSIBLES del sistema
  ├── ⛔ UPDATE → EXCEPTION
  └── ⛔ DELETE → EXCEPTION
```

**¿Cómo se corrige un error?** Se crea un nuevo registro tipo `'adjustment'` o `'refund'`.

---

## 🌐 Redes

```
db_net (internal: true)
│
├── postgres:5432  ◄──►  API (NestJS)
│                         │   Operaciones normales de negocio
│                         │
├── postgres:5432  ◄──►  Middleware (Go Fiber)
│                         │   Fallback de sesiones JWT
│                         │
└── postgres:5432  ◄──►  pgAdmin (solo con --profile tools)
                            Interfaz gráfica de administración
```

**Reglas:**
- PostgreSQL **solo** está en `db_net`
- No tiene acceso a `public_net`, `api_net` ni `cache_net`
- API, Middleware y pgAdmin pueden conectarse a PostgreSQL

---

## 🗺️ Datos Geoespaciales (PostGIS)

El sistema usa `GEOGRAPHY(Point, 4326)` (WGS84) para ubicaciones:

| Tabla             | Columna         | Índice      | ¿Para qué?                        |
| ----------------- | --------------- | ----------- | --------------------------------- |
| `trip.trips`      | `origin_geom`   | GIST        | Origen del viaje                  |
| `trip.trips`      | `dest_geom`     | GIST        | Destino del viaje                 |
| `trip.gps_history`| `location`      | GIST        | Tracking en tiempo real           |

**Consultas geoespaciales posibles:**
```sql
-- Conductores cerca de un punto (radio 500m)
SELECT * FROM trip.trips
WHERE ST_DWithin(origin_geom, ST_MakePoint(-66.9, 10.5)::geography, 500);
```

---

## 🧮 Precisión Monetaria

| Concepto          | Tipo    | Ejemplo         | Equivalente    |
| ----------------- | ------- | --------------- | -------------- |
| `base_amount_usd` | BIGINT  | `150`           | $1.50 USD      |
| `balance`         | BIGINT  | `5000`          | $50.00 USD     |
| `commission_percentage` | BIGINT | `1000`   | 10.00%         |
| `rate`            | NUMERIC(19,6) | `36.500000` | 36.50 VES/USD |

**Regla: todos los montos en centavos, nunca floats.**

---

## 💻 Comandos útiles

```bash
# Conexión directa desde el host
psql -h localhost -p 5432 -U bolo_admin -d bolo

# Shell dentro del contenedor
make shell-db
# Equivalente:
# docker compose exec postgres psql -U bolo_admin -d bolo

# Listar esquemas
\dn

# Listar tablas de un esquema
\dt auth.*

# Ver seeders ejecutados
SELECT * FROM auth.admins;
SELECT * FROM fin.exchange_rates;

# Verificar índices
\di auth.*

# Ver estado de conexiones
SELECT * FROM pg_stat_activity;
```

---

## 📁 Archivos del servicio

| Archivo                        | Propósito                                        |
| ------------------------------ | ------------------------------------------------ |
| `postgres/Dockerfile`          | Imagen PostgreSQL 18 + PostGIS                   |
| `postgres/pg_hba.conf`         | Autenticación: solo SCRAM-SHA-256                |
| `postgres/pgadmin-servers.json`| Pre-configuración de pgAdmin                     |
| `postgres/PROYECTO.md`         | Documentación técnica pre-existente              |
| `postgres/README.md`           | README del servicio PostgreSQL                   |
| `database/init.sql`            | Schema completo (extensiones → tablas → seeders) |
| `database/PROYECTO.md`         | Documentación técnica del schema                 |
| `database/README.md`           | README del schema                                |
| `secrets/pg_password.txt`      | Contraseña de PostgreSQL (generada por make init)|
| `secrets/pgadmin_password.txt` | Contraseña de pgAdmin                            |
