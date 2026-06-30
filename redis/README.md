# `redis/` — Configuración de Redis 7

Directorio con los archivos de configuración para el contenedor **Redis 7 Alpine** del proyecto BOLO.

## Archivos

| Archivo | Propósito |
|---|---|
| `redis.conf` | Configuración de seguridad, persistencia y rendimiento |
| `docker-entrypoint.sh` | Script de arranque que inyecta la contraseña desde Docker Secrets |
| `PROYECTO.md` | Notas del proyecto (pre-existente) |

## `redis.conf` — Configuración del servidor

### Seguridad

| Directiva | Valor | Descripción |
|---|---|---|
| `bind` | `0.0.0.0` | Escucha en todas las interfaces (controlado por red Docker) |
| `protected-mode` | `yes` | Solo acepta conexiones desde loopback o con contraseña |
| `requirepass` | (dinámico) | Se inyecta en tiempo de arranque desde el entrypoint |
| `rename-command FLUSHALL` | `""` | Deshabilitado completamente |
| `rename-command FLUSHDB` | `""` | Deshabilitado completamente |
| `rename-command CONFIG` | `"BOLO_CONFIG_9f3a2b"` | Ofuscado (nombre con hash) |
| `rename-command DEBUG` | `""` | Deshabilitado completamente |
| `rename-command SLAVEOF` | `""` | Deshabilitado completamente |

### Persistencia

| Directiva | Valor | Descripción |
|---|---|---|
| `save 300 1` | Snapshot RDB cada 5 min si ≥ 1 cambio | Persistencia mínima para desarrollo |
| `save 60 100` | Snapshot cada 60 s si ≥ 100 cambios | |
| `dbfilename` | `dump.rdb` | Archivo de snapshot |
| `dir` | `/data` | Directorio de datos (montado como volumen) |
| `appendonly` | `no` | AOF desactivado en desarrollo (activar en producción) |

### Memoria y conexiones

| Directiva | Valor | Descripción |
|---|---|---|
| `maxmemory` | `100mb` | Límite máximo de memoria |
| `maxmemory-policy` | `allkeys-lru` | Elimina las claves menos usadas al alcanzar el límite |
| `maxclients` | `100` | Límite de conexiones simultáneas |
| `tcp-keepalive` | `300` | Keepalive de conexiones TCP |

### Logging

- `loglevel notice`
- `logfile ""` (salida a stdout para `docker logs`)

## `docker-entrypoint.sh` — Arranque con secretos

Script de inicio que:

1. Lee la contraseña desde `/run/secrets/redis_password` (Docker Secret)
2. Si el archivo no existe, muestra error y termina con código 1
3. Inicia `redis-server` con la configuración y la contraseña vía `--requirepass`

```sh
exec redis-server /usr/local/etc/redis/redis.conf \
  --requirepass "$REDIS_PASSWORD"
```

## Integración con Docker Compose

- **Imagen**: `redis:7-alpine`
- **Comando**: `redis-server /usr/local/etc/redis/redis.conf`
- **Puerto**: `127.0.0.1:6379:6379` (solo loopback)
- **Volúmenes**: `redis_data:/data` (persistencia), `./redis/redis.conf:ro`
- **Secret**: `redis_password`
- **Healthcheck**: `redis-cli ping | grep -q PONG`
- **Red**: `cache_net`

### Redes

```
redis ←→ cache_net ←→ API (NestJS)
                  ←→ Middleware (Go Fiber)
```

Redis **no tiene acceso** a `public_net`, `db_net` ni `api_net`.
