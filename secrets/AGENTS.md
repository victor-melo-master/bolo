# AGENTS — Secrets

## Propósito
Almacenamiento local de secretos para desarrollo. En producción se reemplaza por Docker Swarm Secrets, Vault o AWS Secrets Manager.

## Archivos generados por `make init`

| Archivo | Bytes | Propósito | Usado por |
|---------|-------|-----------|-----------|
| `pg_password.txt` | 20 hex | Contraseña PostgreSQL | postgres, api, middleware |
| `redis_password.txt` | 20 hex | Contraseña Redis | redis, api, middleware |
| `jwt_secret.txt` | 32 hex | Clave JWT (respaldo) | api |
| `qr_hmac_secret.txt` | 32 hex | Clave HMAC QR | api (futuro) |
| `pgadmin_password.txt` | 16 hex | Contraseña pgAdmin | pgadmin |

## Generación
```bash
./secrets/init-secrets.sh
# Usa: openssl rand -hex {n}
# Crea archivos con chmod 600
# No sobrescribe si ya existen (idempotente)
```

## Montaje en contenedores
Los archivos se montan como Docker Secrets en `/run/secrets/`:
```yaml
secrets:
  pg_password:
    file: ./secrets/pg_password.txt
```

Las apps los leen mediante variables `*_FILE`:
```
DB_PASSWORD_FILE=/run/secrets/pg_password
REDIS_PASSWORD_FILE=/run/secrets/redis_password
JWT_SECRET_FILE=/run/secrets/jwt_secret
```

## Seguridad
- `chmod 600` — solo el owner puede leer
- `./secrets/` está en `.gitignore` — nunca se commitean
- En producción: reemplazar con Docker Swarm Secrets, Vault, AWS SM, Azure KV
- El script `init-secrets.sh` necesita `openssl` instalado

## Regenerar
```bash
rm secrets/*.txt
make init   # regenera todos los secretos
```
⚠️ Esto invalida sesiones JWT activas y contraseñas existentes.
