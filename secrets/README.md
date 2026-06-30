# `secrets/` — Gestión de secretos para desarrollo

Directorio que contiene los archivos de secretos generados para el entorno de desarrollo local. **NUNCA commitees este directorio** — debe estar en `.gitignore`.

## Archivos

| Archivo | Contenido | Propósito | Tamaño |
|---|---|---|---|
| `init-secrets.sh` | Script generador | Crea todos los archivos de secretos con `openssl rand -hex` | — |
| `pg_password.txt` | Contraseña de PostgreSQL | Usada por: postgres, API, pgAdmin | 20 bytes hex |
| `redis_password.txt` | Contraseña de Redis | Usada por: redis, API, middleware | 20 bytes hex |
| `jwt_secret.txt` | Secreto de firma JWT | Usado por: API, middleware | 32 bytes hex |
| `qr_hmac_secret.txt` | Secreto HMAC para QR | Usado por: API (firma de códigos QR de conductores) | 32 bytes hex |
| `pgadmin_password.txt` | Contraseña de pgAdmin | Usada por: pgAdmin | 16 bytes hex |
| `PROYECTO.md` | Notas del proyecto | — | — |

## `init-secrets.sh` — Script de inicialización

Genera todos los secretos usando `openssl rand -hex <N>` donde N es el número de bytes:

| Secreto | Bytes | Ejemplo de salida |
|---|---|---|
| `pg_password` | 20 | `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0` |
| `redis_password` | 20 | (40 caracteres hex) |
| `jwt_secret` | 32 | (64 caracteres hex) |
| `qr_hmac_secret` | 32 | (64 caracteres hex) |
| `pgadmin_password` | 16 | (32 caracteres hex) |

**Comportamiento:**
- Si un archivo ya existe, no lo sobreescribe (solo muestra un aviso)
- Asigna permisos `600` (solo lectura para el propietario)
- Verifica que `openssl` esté instalado

**Uso:**
```bash
cd projectBolo && bash secrets/init-secrets.sh
```

## Integración con Docker Compose

En `docker-compose.yml`, los secretos se definen como Docker Secrets locales:

```yaml
secrets:
  pg_password:
    file: ./secrets/pg_password.txt
  redis_password:
    file: ./secrets/redis_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  qr_hmac_secret:
    file: ./secrets/qr_hmac_secret.txt
  pgadmin_password:
    file: ./secrets/pgadmin_password.txt
```

Cada servicio monta los secretos que necesita en `/run/secrets/<nombre>`:

| Servicio | Secretos montados |
|---|---|
| `postgres` | `pg_password` |
| `redis` | `redis_password` |
| `pgadmin` | `pgadmin_password` |
| `middleware` | `jwt_secret`, `qr_hmac_secret`, `redis_password` |
| `api` | `pg_password`, `redis_password`, `jwt_secret`, `qr_hmac_secret` |

## Flujo de inicialización completo

```bash
make init
# 1. Ejecuta secrets/init-secrets.sh → genera todos los .txt
# 2. Ejecuta docker compose build --parallel
# 3. Listo para: make up
```

## Seguridad

- Los archivos tienen permisos `600` (solo el propietario puede leerlos)
- Los contenedores leen los secretos desde `/run/secrets/` (no desde variables de entorno)
- El script `docker-entrypoint.sh` de Redis lee su contraseña directamente del archivo secreto
- En **producción**, reemplazar estos archivos por Docker Swarm Secrets, HashiCorp Vault o AWS Secrets Manager
