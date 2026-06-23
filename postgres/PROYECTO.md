# Postgres — PostgreSQL 18 + PostGIS

## Descripción General

Servicio de base de datos principal de BOLO. Corre **PostgreSQL 18** con **PostGIS 3** para soporte geoespacial completo (datos de tipo `GEOGRAPHY`, índices GIST, funciones de distancia como `ST_Distance`). Incluye soporte nativo para **UUID v7** (ordenables temporalmente) como función del core de la base de datos, sin necesidad de extensiones adicionales.

La configuración de autenticación está endurecida: solo se permite **SCRAM-SHA-256** (sin md5, sin trust), y las conexiones están restringidas exclusivamente a las redes internas de Docker.

## Estructura de Archivos

```
postgres/
├── Dockerfile                  # Imagen basada en postgres:18 con PostGIS
├── pg_hba.conf                 # Política de autenticación (SCRAM-SHA-256, solo Docker)
└── pgadmin-servers.json        # Pre-configuración de conexión para pgAdmin
```

## Stack Tecnológico

| Componente    | Versión   | Propósito                          |
|---------------|-----------|-------------------------------------|
| PostgreSQL    | 18        | Motor de base de datos relacional   |
| PostGIS       | 3         | Extensiones geoespaciales           |
| pgcrypto      | —         | Hashing bcrypt para contraseñas     |
| pgAdmin       | latest    | UI de administración (perfil tools) |

## Dockerfile

```dockerfile
FROM postgres:18

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        postgresql-18-postgis-3 \
        postgresql-18-postgis-3-scripts \
    && rm -rf /var/lib/apt/lists/*

COPY pg_hba.conf /etc/postgresql/pg_hba.conf
RUN ldconfig
```

La imagen base oficial `postgres:18` ya incluye `pg_hba.conf` y el mecanismo de `docker-entrypoint-initdb.d`. El Dockerfile simplemente añade PostGIS y una configuración de autenticación personalizada.

## Despliegue — Paso a Paso

### En Desarrollo

```bash
# PostgreSQL se levanta automáticamente como parte del stack
make up

# Conexión directa desde el host (loopback)
psql -h localhost -p 5432 -U bolo_admin -d bolo

# Conexión desde el shell del contenedor
make shell-db
# Equivalente a:
# docker compose exec postgres psql -U bolo_admin -d bolo
```

### pgAdmin (herramienta opcional)

```bash
# Levantar PostgreSQL + pgAdmin
make tools
# Abrir http://localhost:5050
# Email: admin@bolo.com (de PGADMIN_EMAIL en .env)
# Contraseña: la generada en secrets/pgadmin_password.txt
```

pgAdmin se pre-configura automáticamente para conectar al servidor `postgres:5432` mediante `pgadmin-servers.json`.

### Inicialización de la Base de Datos

En la primera ejecución, el script `database/init.sql` se ejecuta automáticamente (montado como `docker-entrypoint-initdb.d/01_init.sql`). Crea:

1. Extensiones (pgcrypto, postgis)
2. 5 esquemas (auth, ops, fin, trip, audit)
3. 10 tipos ENUM
4. 3 funciones auxiliares
5. 14 tablas
6. ~35 índices
7. 3 triggers
8. 6 registros semilla (admin por defecto, tarifario inicial, etc.)

## Variables de Entorno

| Variable               | Requerida | Default       | Descripción                              |
|------------------------|-----------|---------------|------------------------------------------|
| POSTGRES_DB            | Sí        | —             | Nombre de la base de datos (`bolo`)      |
| POSTGRES_USER          | Sí        | —             | Usuario administrador (`bolo_admin`)     |
| POSTGRES_PASSWORD_FILE | Sí        | —             | Ruta al secret con la contraseña         |
| POSTGRES_HOST_AUTH_METHOD | —      | scram-sha-256 | Método de autenticación                  |
| POSTGRES_INITDB_ARGS   | —          | —             | Args de inicialización (forzar SCRAM)    |

## Configuración de Autenticación (pg_hba.conf)

```conf
# Conexiones locales (dentro del contenedor)
local   all   all   scram-sha-256

# IPv4: solo desde la red interna de Docker (172.16.0.0/12)
host    all   all   172.16.0.0/12   scram-sha-256

# IPv6 loopback
host    all   all   ::1/128         scram-sha-256

# Rechaza cualquier otra conexión
host    all   all   0.0.0.0/0       reject
```

**Puntos clave:**
- Solo `scram-sha-256` (el método más seguro de PostgreSQL)
- Conexiones remotas solo desde el rango Docker (`172.16.0.0/12`)
- Todo lo demás se rechaza explícitamente
- No hay usuarios sin contraseña

## Configuración de pgAdmin (servers.json)

```json
{
  "Servers": {
    "1": {
      "Name": "BOLO – Postgres 18",
      "Host": "postgres",
      "Port": 5432,
      "MaintenanceDB": "bolo",
      "Username": "bolo_admin",
      "SSLMode": "prefer"
    }
  }
}
```

## Redes

| Red      | Tipo     | Acceso                        |
|----------|----------|-------------------------------|
| `db_net` | internal | API y pgAdmin pueden conectar |

`db_net` tiene `internal: true`, lo que significa que **no tiene salida a internet**. PostgreSQL está completamente aislado.

## Puertos

| Puerto | Bind             | Acceso                    |
|--------|------------------|---------------------------|
| 5432   | 127.0.0.1:5432   | Solo loopback del host    |

## Healthcheck

```yaml
test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
interval: 10s
timeout: 5s
retries: 5
start_period: 30s
```

## Límites de Recursos

| Recurso | Límite |
|---------|--------|
| CPU     | 1.0 core |
| Memoria | 512 MB |

## Volúmenes Persistentes

| Volumen          | Mount point                      | Propósito                  |
|------------------|----------------------------------|----------------------------|
| `postgres_data`  | `/var/lib/postgresql/18/data`    | Datos de la base de datos  |

## Notas de Seguridad

1. **Red interna**: PostgreSQL solo es accesible desde `db_net`. No tiene exposición a internet.
2. **Autenticación forzada**: SCRAM-SHA-256 es el único método permitido. No hay `trust` ni `md5`.
3. **Contraseña por secret**: La contraseña se lee de `/run/secrets/pg_password`, no de variables de entorno.
4. **Puerto en loopback**: El mapeo `127.0.0.1:5432:5432` asegura que solo el host local puede conectarse.
5. **Usuario no root**: El contenedor corre PostgreSQL con el usuario `postgres` (no root).
6. **Límite de recursos**: 1 CPU, 512 MB RAM evitan que un leak consuma el host.
7. **pgAdmin opcional**: Solo se activa con `--profile tools`, nunca en producción.
