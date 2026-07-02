# AGENTS — PostgreSQL 18 + PostGIS

## Propósito
Base de datos principal del sistema. Almacena usuarios, viajes, billeteras, tarifas y todo el historial. Solo accesible desde `db_net`.

## Stack
PostgreSQL 18 · PostGIS 3 · pgcrypto · UUID v7 nativo · SCRAM-SHA-256

## Despliegue
```yaml
postgres:
  build:
    context: ./postgres
    dockerfile: Dockerfile
  environment:
    POSTGRES_DB:              bolo
    POSTGRES_USER:            bolo_admin
    POSTGRES_PASSWORD_FILE:   /run/secrets/pg_password
    POSTGRES_HOST_AUTH_METHOD: scram-sha-256
  secrets:
    - pg_password
  volumes:
    - postgres_data:/var/lib/postgresql/18/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/01_init.sql:ro
    - ./postgres/pg_hba.conf:/etc/postgresql/pg_hba.conf:ro
  networks:
    - db_net
```

## Autenticación (pg_hba.conf)
```conf
local   all   all               scram-sha-256
host    all   all   172.16.0.0/12  scram-sha-256
host    all   all   ::1/128        scram-sha-256
host    all   all   0.0.0.0/0      reject
```
Solo conexiones desde la red Docker. No hay `trust` ni `md5`.

## Variables de entorno
| Variable | Default | Nota |
|----------|---------|------|
| POSTGRES_DB | bolo | Nombre BD |
| POSTGRES_USER | bolo_admin | Usuario admin |
| POSTGRES_PASSWORD_FILE | /run/secrets/pg_password | Contraseña desde secret |
| POSTGRES_HOST_AUTH_METHOD | scram-sha-256 | Forzar autenticación |

## Secretos
| Secreto | Origen |
|---------|--------|
| `pg_password` | `secrets/pg_password.txt` |
| `pgadmin_password` | `secrets/pgadmin_password.txt` (solo tools profile) |

## Límites
| Recurso | Límite |
|---------|--------|
| CPU | 1.0 core |
| Memoria | 512 MB |

## Servicios que acceden
| Servicio | Red | Propósito |
|----------|-----|-----------|
| API (NestJS) | db_net | Operaciones de negocio vía TypeORM |
| Middleware (Go) | db_net | Fallback de sesiones JWT (pgx) |
| pgAdmin | db_net | UI admin (solo `--profile tools`) |

## Esquemas
| Schema | Tablas | Módulo |
|--------|--------|--------|
| auth | passengers, admins, associations, sessions, driver_requests | Auth |
| ops | routes, vehicles, assigned_routes | Operations |
| fin | exchange_rates, coop_fares, wallets, transactions, rates_config, saga_states | Financial |
| trip | trips, payments, gps_history | Trip |
| audit | audit_log | Audit |

## Dockerfile
```dockerfile
FROM postgres:18
RUN apt-get update && apt-get install -y \
    postgresql-18-postgis-3 \
    postgresql-18-postgis-3-scripts
COPY pg_hba.conf /etc/postgresql/pg_hba.conf
```

## Comandos útiles
```bash
make shell-db
# o: docker compose exec postgres psql -U bolo_admin -d bolo
\dn          # listar esquemas
\dt auth.*   # listar tablas de auth
```
