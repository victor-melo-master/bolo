# `postgres/` — Configuración de PostgreSQL y pgAdmin

Directorio con los archivos de configuración para el contenedor de **PostgreSQL 18 + PostGIS** y la herramienta de administración **pgAdmin 4**.

## Archivos

| Archivo | Propósito |
|---|---|
| `Dockerfile` | Imagen personalizada de PostgreSQL 18 con PostGIS 3 |
| `pg_hba.conf` | Políticas de autenticación de clientes (solo SCRAM-SHA-256) |
| `pgadmin-servers.json` | Pre-configuración de la conexión a la BD en pgAdmin |
| `pgpass` | Archivo de contraseña para pgAdmin (dev, no commiteable) |
| `PROYECTO.md` | Notas del proyecto (pre-existente) |

## `Dockerfile` — Imagen PostgreSQL + PostGIS

- **Base**: `postgres:18`
- **PostGIS**: instala `postgresql-18-postgis-3` y scripts
- **Seguridad**: copia `pg_hba.conf` endurecido
- **Multi-stage**: no (es imagen final, no hay build intermedio)

## `pg_hba.conf` — Autenticación endurecida

Política de acceso mínima y segura:

| Tipo | Dirección | Método |
|---|---|---|
| Local (Unix socket) | — | `scram-sha-256` |
| IPv4 | `172.16.0.0/12` (red interna Docker) | `scram-sha-256` |
| IPv6 | `::1/128` | `scram-sha-256` |
| Cualquier otra | `0.0.0.0/0` | `reject` |

No se permite `md5` ni `trust`. Todas las conexiones externas al rango Docker son rechazadas explícitamente.

## `pgadmin-servers.json` — Conexión preconfigurada

Configura automáticamente pgAdmin al iniciar:

```json
{
  "Servers": {
    "1": {
      "Name": "BOLO – Postgres 18",
      "Host": "postgres",
      "Port": 5432,
      "MaintenanceDB": "bolo",
      "Username": "bolo_admin",
      "SSLMode": "prefer",
      "PassFile": "/pgadmin4/pgpass"
    }
  }
}
```

## `pgpass` — Contraseña para pgAdmin

Formato estándar: `hostname:port:database:username:password`

```
postgres:5432:*:bolo_admin:mi_super_password_postgres_123
```

> ⚠️ Este archivo es para desarrollo. La contraseña real se inyecta como Docker Secret.

## Integración con Docker Compose

En `docker-compose.yml`:

- **postgres**: usa el `Dockerfile`, monta `init.sql`, `pg_hba.conf` y `pgpass`. Solo expone puerto `5432` en `127.0.0.1` (loopback). Conectado a la red `db_net`
- **pgadmin**: perfil `tools` (solo con `docker compose --profile tools up`). Lee `pgadmin-servers.json` y la contraseña desde el secret `pgadmin_password`. Conectado a `db_net`

### Redes

```
postgres ←→ db_net ←→ API (NestJS)
    ↑
pgadmin (solo con --profile tools)
```

PostgreSQL **no tiene acceso** a `public_net`, `api_net` ni `cache_net` (principio de mínimo privilegio).
