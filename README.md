# BOLO MVP — Plataforma de Transporte

Sistema integral de gestión de transporte de pasajeros: cooperativas, conductores, rutas, viajes con tracking GPS, billetera digital y pagos. Arquitectura basada en microservicios con redes segmentadas por principio de mínimo privilegio.

## Stack General

| Servicio    | Lenguaje     | Framework        | Base de Datos     |
|-------------|--------------|------------------|-------------------|
| API         | Node.js 24   | NestJS 11        | PostgreSQL 18     |
| Middleware   | Go 1.25      | Fiber v2         | Redis 7           |
| Frontend    | TypeScript 6 | React 19 + Vite 8| —                 |
| Base Datos  | —            | —                | PostgreSQL 18 + PostGIS 3 |
| Cache       | —            | —                | Redis 7 Alpine    |

---

## Inicio Rápido

### Prerrequisitos

- Docker + Docker Compose (con soporte para Docker BuildKit)
- `openssl` instalado en el host (para generar secretos)

### Levantar el Stack

```bash
# 1. Genera secretos aleatorios y construye las imágenes
make init

# 2. Levanta todos los servicios en segundo plano
make up

# 3. Verifica el estado
make ps

# 4. (Opcional) Incluye pgAdmin
make tools
```

### Acceso a los Servicios

| Servicio    | URL                           | Credenciales                          |
|-------------|-------------------------------|---------------------------------------|
| Frontend    | http://localhost:5173         | —                                     |
| Middleware  | http://localhost:8080         | —                                     |
| API         | _no expuesta al host_         | Solo accesible desde middleware       |
| PostgreSQL  | `localhost:5432`              | `bolo_admin` / _secret_               |
| Redis       | `localhost:6379`              | _secret_                              |
| pgAdmin     | http://localhost:5050         | `admin@bolo.com` / _secret_           |

> 📖 **Documentación de flujos:**
> - [`FLUJOS_MIDDLEWARE.md`](./FLUJOS_MIDDLEWARE.md) — proxy, validación JWT, rate limiting, honeypot
> - [`FLUJOS_REDIS.md`](./FLUJOS_REDIS.md) — caché, sesiones, despliegue y valores de Redis
> - [`FLUJOS_POSTGRES.md`](./FLUJOS_POSTGRES.md) — esquema, init.sql, despliegue y valores de PostgreSQL

Los secretos se generan en `secrets/*.txt`. Para ver las contraseñas:
```bash
cat secrets/pg_password.txt
cat secrets/pgadmin_password.txt
```

---

## Arquitectura del Proyecto

```
projectBolo/
├── .env                     # Variables de entorno NO sensibles
├── .gitignore               # Ignora node_modules, secrets, dist, etc.
├── Makefile                 # Comandos de gestión (init, up, down, logs, etc.)
├── docker-compose.yml       # Orquestación completa (357 líneas)
├── README.md                # Este archivo
│
├── postgres/                # PostgreSQL 18 + PostGIS 3
│   ├── Dockerfile           # Imagen con PostGIS y pg_hba.conf endurecido
│   ├── pg_hba.conf          # Solo SCRAM-SHA-256, solo redes Docker
│   └── pgadmin-servers.json # Pre-configuración de pgAdmin
│
├── database/
│   └── init.sql             # Schema completo (725 líneas, 14 tablas, ~35 índices)
│
├── redis/
│   ├── docker-entrypoint.sh # Inyecta contraseña desde Docker Secret
│   └── redis.conf           # Configuración endurecida (comandos peligrosos off)
│
├── secrets/
│   ├── init-secrets.sh      # Generador de secretos con openssl
│   ├── pg_password.txt
│   ├── redis_password.txt
│   ├── jwt_secret.txt
│   ├── qr_hmac_secret.txt
│   └── pgadmin_password.txt
│
├── middleware/               # Go Fiber — API Gateway
│   ├── main.go              # Punto de entrada (healthcheck + rutas base)
│   ├── Dockerfile           # Multi-stage: development (Air) → production (scratch)
│   ├── go.mod / go.sum      # Dependencias Go (Fiber v2, fasthttp)
│   └── .air.toml            # Hot-reload con Air
│
├── api/                     # NestJS 11 — Lógica de negocio
│   ├── src/                 # Código fuente (main.ts, módulos, servicios)
│   ├── test/                # Tests e2e (Jest + Supertest)
│   ├── Dockerfile           # Multi-stage: development → build → production
│   ├── package.json         # NestJS, Jest, ESLint, TypeScript
│   ├── tsconfig.json        # TypeScript configuración
│   └── nest-cli.json        # CLI de NestJS
│
└── frontend/                # React 19 + Vite 8
    ├── src/                 # Componentes, hooks, páginas
    ├── Dockerfile           # Multi-stage: development (HMR) → build → production (Nginx)
    ├── package.json         # React, Vite, TypeScript, ESLint
    ├── vite.config.ts       # Configuración de Vite
    ├── nginx.conf           # Servidor estático con SPA routing
    └── tsconfig*.json       # TypeScript configuraciones
```

---

## Servicios en Detalle

### postgres/ — PostgreSQL 18 + PostGIS

Base de datos principal con soporte geoespacial. Esquema multi-dominio con 5 esquemas lógicos (auth, ops, fin, trip, audit), 14 tablas y ~35 índices optimizados.

- **Autenticación:** Solo SCRAM-SHA-256, conexiones solo desde `172.16.0.0/12`
- **UUID v7:** Nativo en PG18 (ordenable temporalmente, mejor rendimiento de índices)
- **Seguridad:** Red interna (`db_net`), puerto solo en loopback, límite 1 CPU / 512 MB RAM
- **Inicialización:** `database/init.sql` se ejecuta automáticamente al crear el contenedor
- **Seeders:** Super Admin (`admin123`), tarifario inicial, tasa de cambio VES, asociación de ejemplo
- **Tablas inmutables:** `fin.transactions` y `audit.audit_log` con triggers que bloquean UPDATE/DELETE

### redis/ — Redis 7 Alpine

Caché distribuido para sesiones, rate-limiting y datos temporales.

- **Autenticación:** Requirepass inyectado por `docker-entrypoint.sh` desde Docker Secret
- **Comandos bloqueados:** FLUSHALL, FLUSHDB, DEBUG, SLAVEOF deshabilitados; CONFIG ofuscado
- **Persistencia:** RDB cada 5 min (activo), AOF desactivado en desarrollo
- **Memoria:** 100 MB máximo con política LRU (`allkeys-lru`)
- **Red:** `cache_net` (internal), solo API y middleware acceden
- **Límites:** 0.5 CPU, 128 MB RAM, 100 conexiones máximas

### middleware/ — Go Fiber (API Gateway)

Proxy de seguridad y punto de entrada único. Todo el tráfico externo pasa por aquí.

- **Framework:** Fiber v2 (fasthttp) — significativamente más rápido que net/http
- **Hot-reload:** Air en desarrollo (recompila al detectar cambios `.go`)
- **Imagen producción:** Scratch (~5 MB), usuario `nobody` (UID 65534)
- **Binario:** Compilación estática (`CGO_ENABLED=0`), sin debug symbols, sin rutas locales
- **Redes triple:** `public_net` (frontend), `cache_net` (Redis), `api_net` (API)
- **Funcionalidades actuales:** Endpoints `/` y `/health` (placeholder)
- **Pendiente:** Validación JWT, rate-limiting, proxy reverso, HMAC QR, CORS, métricas

### api/ — NestJS 11 (Monolito)

Núcleo de la lógica de negocio: usuarios, autenticación, rutas, viajes, billetera, pagos.

- **Runtime:** Node.js 24 Alpine con dumb-init (manejo de señales PID 1)
- **Framework:** NestJS 11 con Express (controladores, módulos, servicios, guards, pipes)
- **DB:** PostgreSQL 18 + PostGIS vía drivers nativos
- **Cache:** Redis 7 para sesiones y rate-limiting
- **Tests:** Jest (unitarios) + Supertest (e2e)
- **Imagen producción:** Alpine, usuario `bolo:bolo`, solo `dist/` y dependencias producción
- **Seguridad:** Sin puerto expuesto al host, solo `expose` interno en `api_net`
- **Secretos:** Leídos de archivos (`/run/secrets/*`), nunca de variables de entorno

### frontend/ — React 19 + Vite 8

Panel de administración web para gestión del sistema de transporte.

- **Framework:** React 19 con TypeScript 6
- **Bundler:** Vite 8 con HMR (cambios reflejados al instante)
- **Producción:** Build estático servido por Nginx 1.27 Alpine
- **SPA routing:** `nginx.conf` con `try_files` para React Router
- **Red:** Solo `public_net` — no tiene acceso directo a API, Redis ni PostgreSQL
- **Variables:** `VITE_API_URL` (middleware) y `VITE_ENVIRONMENT` (inyectadas en build)

---

## Arquitectura de Redes

```
Internet / Host
      │
      ▼
 [public_net] (bridge)
  ┌─────────┐    ┌──────────┐
  │frontend │    │middleware│
  └─────────┘    └────┬─────┘
                      │ [api_net] (internal: true)
                      ▼
                  ┌───────┐
                  │  api  │
                  └───┬───┘
          ┌───────────┴──────────┐
     [db_net]              [cache_net]
     (internal: true)      (internal: true)
          │                     │
     ┌────────┐            ┌───────┐
     │postgres│            │ redis │
     └────────┘            └───────┘
```

| Red          | Tipo     | Acceso                                    |
|--------------|----------|-------------------------------------------|
| `public_net` | bridge   | Frontend ↔ Middleware (tráfico externo)   |
| `api_net`    | internal | Middleware → API (proxy reverso)           |
| `db_net`     | internal | API ↔ PostgreSQL, pgAdmin ↔ PostgreSQL    |
| `cache_net`  | internal | API ↔ Redis, Middleware ↔ Redis           |

**Principios:**
- PostgreSQL y Redis **nunca** están en `public_net` ni `api_net`
- La API **no expone puerto al host** en producción
- Todas las redes internas tienen `internal: true` (sin salida a internet)
- Cada servicio solo tiene acceso a las redes que necesita (mínimo privilegio)

---

## Docker Compose — Configuración General

El archivo `docker-compose.yml` define defaults reutilizables con anclajes YAML:

```yaml
x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

x-restart: &default-restart
  restart: unless-stopped

x-healthcheck-defaults: &hc-defaults
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

Todos los servicios heredan estas configuraciones base.

### Orden de Arranque Garantizado

```
postgres (healthy) ──→ api (healthy) ──→ middleware (healthy) ──→ frontend
redis (healthy)    ──→ api
                   ──→ middleware
```

Cada servicio usa `depends_on` con `condition: service_healthy`.

### Perfiles

| Perfil   | Activa              | Comando                     |
|----------|---------------------|-----------------------------|
| —        | Stack base          | `docker compose up -d`      |
| `tools`  | + pgAdmin           | `docker compose --profile tools up -d` |

---

## Multi-stage Builds

Cada Dockerfile implementa stages separados para desarrollo y producción:

| Servicio    | Stage Development         | Stage Production               |
|-------------|---------------------------|--------------------------------|
| API         | `nest start --watch`      | `node dist/main.js` (Alpine)   |
| Middleware  | Air (hot-reload Go)       | Binario estático (Scratch)     |
| Frontend    | Vite HMR (`:5173`)        | Nginx sirviendo `dist/`        |
| PostgreSQL  | —                         | `postgres:18` + PostGIS        |
| Redis       | —                         | `redis:7-alpine` + entrypoint  |

En desarrollo, el `docker-compose.yml` usa `target: development` para todos los servicios.

---

## Gestión de Secretos

### En Desarrollo

Los secretos se generan con `make init` y se almacenan en `secrets/*.txt`:

```
secrets/
├── init-secrets.sh          # Script generador (openssl rand -hex)
├── pg_password.txt          # 20 bytes hex → contraseña PostgreSQL
├── redis_password.txt       # 20 bytes hex → contraseña Redis
├── jwt_secret.txt           # 32 bytes hex → clave JWT
├── qr_hmac_secret.txt       # 32 bytes hex → clave HMAC QR
└── pgadmin_password.txt     # 16 bytes hex → contraseña pgAdmin
```

- Cada archivo se crea con `chmod 600`
- Si ya existe, **no se sobrescribe** (idempotente)
- Se montan como Docker Secrets en `/run/secrets/` dentro de cada contenedor
- Las aplicaciones los leen mediante variables `*_FILE` (ej: `DB_PASSWORD_FILE=/run/secrets/pg_password`)

### En Producción

Reemplazar los archivos locales por:

1. **Docker Swarm Secrets:** `docker secret create pg_password -`
2. **HashiCorp Vault:** Sidecar que escribe en `/run/secrets/`
3. **AWS Secrets Manager / Azure Key Vault:** SDK o agente de sincronización

Actualizar `docker-compose.yml` cambiando `file:` por `external: true`.

---

## Variables de Entorno

### Archivo `.env` (no sensible)

```ini
# Base de datos
POSTGRES_DB=bolo
POSTGRES_USER=bolo_admin

# pgAdmin
PGADMIN_EMAIL=admin@bolo.com

# Puertos (solo bind en 127.0.0.1)
API_PORT=3000
MIDDLEWARE_PORT=8080
FRONTEND_PORT=5173

# Entorno de ejecución
NODE_ENV=development
LOG_LEVEL=info
```

Los secretos **nunca** están en `.env`. Siempre en archivos separados dentro de `secrets/`.

---

## Healthchecks

Todos los servicios tienen healthchecks con configuración uniforme:

| Servicio    | Comando de Healthcheck                          |
|-------------|-------------------------------------------------|
| PostgreSQL  | `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}` |
| Redis       | `redis-cli ping \| grep -q PONG`                |
| API         | `curl -f http://localhost:3000/ \|\| exit 1`    |
| Middleware  | `curl -f http://localhost:8080/health \|\| exit 1` |
| Frontend    | `curl -f http://localhost:5173 \|\| exit 1`     |

Configuración común: intervalo 10s, timeout 5s, 5 reintentos, periodo inicial 30s.

---

## Límites de Recursos

| Servicio    | CPU  | Memoria |
|-------------|------|---------|
| PostgreSQL  | 1.0  | 512 MB  |
| Redis       | 0.5  | 128 MB  |
| API         | 1.0  | 512 MB  |
| Middleware  | 0.5  | 128 MB  |
| Frontend    | 0.5  | 256 MB  |

Define en `docker-compose.yml` bajo `deploy.resources.limits`.

---

## Volúmenes Persistentes

| Volumen                  | Contenido                          | Servicio(s)         |
|--------------------------|------------------------------------|---------------------|
| `postgres_data`          | Datos de PostgreSQL                | postgres            |
| `redis_data`             | Snapshots RDB de Redis             | redis               |
| `pgadmin_data`           | Configuración de pgAdmin           | pgadmin             |
| `middleware_cache`       | Caché de módulos Go (`go/pkg/mod`) | middleware          |
| `api_node_modules`       | Dependencias Node.js               | api                 |
| `frontend_node_modules`  | Dependencias Node.js               | frontend            |

Los volúmenes de `node_modules` evitan conflictos entre el sistema host y el contenedor (especialmente en macOS/Windows).

---

## Base de Datos — Resumen del Schema

### Esquemas (5)

| Esquema | Microservicio          | Propósito                          |
|---------|------------------------|-------------------------------------|
| `auth`  | Auth & Users           | Usuarios, roles, asociaciones, KYC  |
| `ops`   | Fleet & Operations     | Rutas, vehículos, asignaciones      |
| `fin`   | Wallet & Financial     | Billeteras, pagos, comisiones, tasas, sagas |
| `trip`  | Trip Execution         | Viajes, pagos, historial GPS        |
| `audit` | Auditoría Global       | Logs inmutables de acciones sensibles |

### Tablas Principales (14)

| Tabla                    | Esquema | Registros clave                       |
|--------------------------|---------|---------------------------------------|
| `users`                  | auth    | Login por teléfono, rol, QR, bcrypt   |
| `associations`           | auth    | Cooperativas, RIF, admin asignado      |
| `driver_requests`        | auth    | KYC de conductores, documentos, status |
| `routes`                 | ops     | Rutas por asociación, tarifario        |
| `vehicles`               | ops     | Placa, modelo, capacidad               |
| `assigned_routes`        | ops     | Asignación diaria conductor→ruta       |
| `exchange_rates`         | fin     | Tasas de cambio diarias (BCV)          |
| `coop_fares`             | fin     | Tarifarios por cooperativa (centavos)  |
| `wallets`                | fin     | Billetera con OCC (version)            |
| `transactions`           | fin     | Historial inmutable de movimientos     |
| `saga_states`            | fin     | Estado de sagas transaccionales        |
| `trips`                  | trip    | Viaje con geolocalización, tarifa      |
| `payments`               | trip    | Pago asociado al viaje (1:1)           |
| `gps_history`            | trip    | Tracking GPS (~1 punto/segundo)        |
| `audit_log`              | audit   | Logs inmutables de auditoría           |

### Tipos ENUM (10)

`user_role`, `user_category`, `driver_request_status`, `trip_status`, `transaction_type`, `transaction_status`, `payment_method`, `payment_status`, `saga_status`

### Seguridad en BD

- **Inmutabilidad:** `transactions` y `audit_log` no permiten UPDATE/DELETE
- **Precisión:** Todos los montos en centavos (`BIGINT`), sin floats
- **UUID v7:** Ordenable temporalmente, mejor rendimiento de índices que UUID v4
- **OCC:** `wallets.version` para control de concurrencia optimista
- **Geoespacial:** `GEOGRAPHY(Point, 4326)` con índices GIST

---

## Makefile — Comandos Completos

| Comando          | Descripción                                         |
|------------------|-----------------------------------------------------|
| `make init`      | Genera secretos + construye imágenes                |
| `make up`        | Levanta todos los servicios                         |
| `make down`      | Detiene servicios (conserva volúmenes)              |
| `make restart`   | Reinicia todos los servicios                        |
| `make logs`      | Sigue logs de todos los servicios                   |
| `make ps`        | Estado de los contenedores                          |
| `make shell-api` | Shell interactivo en el contenedor API              |
| `make shell-db`  | psql directo en PostgreSQL                          |
| `make tools`     | Levanta stack + pgAdmin                             |
| `make clean`     | Borra contenedores e imágenes (conserva volúmenes)  |
| `make nuke`      | ⚠️ Borra TODO incluidos volúmenes (detiene 5s)     |

---

## Notas de Seguridad Generales

1. **Redes segmentadas:** 4 redes separadas por función. Las internas tienen `internal: true` (sin salida a internet).
2. **Docker Secrets:** Contraseñas y claves montadas como archivos, nunca en variables de entorno.
3. **Autenticación BD:** Solo SCRAM-SHA-256, conexiones restringidas a `172.16.0.0/12`.
4. **Usuarios no root:** Todos los contenedores de producción corren con usuario sin privilegios.
5. **Imágenes mínimas:** Scratch para Go (~5 MB), Alpine para Node.js.
6. **dumb-init:** Los contenedores Node usan dumb-init como PID 1 para manejo correcto de señales.
7. **Healthchecks:** Todos los servicios verifican su estado periódicamente.
8. **Límites de recursos:** CPU y memoria acotados para evitar fugas.
9. **Redis endurecido:** Comandos peligrosos deshabilitados/renombrados, autenticación obligatoria.
10. **pg_hba.conf:** Rechaza cualquier conexión que no sea SCRAM-SHA-256 desde red Docker.
