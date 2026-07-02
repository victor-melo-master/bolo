# AGENTS — Redis 7 Alpine

## Propósito
Caché distribuido para sesiones JWT, rate-limiting y datos temporales. Accesible solo desde API y Middleware.

## Stack
Redis 7 Alpine · docker-entrypoint.sh · redis.conf

## Despliegue
```yaml
redis:
  image: redis:7-alpine
  command: >
    sh -c 'exec redis-server /usr/local/etc/redis/redis.conf
    --requirepass "$(cat /run/secrets/redis_password)"'
  secrets:
    - redis_password
  volumes:
    - redis_data:/data
    - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
  networks:
    - cache_net
```

## Configuración clave (redis.conf)
| Parámetro | Valor | Nota |
|-----------|-------|------|
| `protected-mode` | yes | Solo con contraseña |
| `rename-command FLUSHALL` | "" | Deshabilitado |
| `rename-command FLUSHDB` | "" | Deshabilitado |
| `rename-command CONFIG` | "BOLO_CONFIG_9f3a2b" | Ofuscado |
| `rename-command DEBUG` | "" | Deshabilitado |
| `rename-command SLAVEOF` | "" | Deshabilitado |
| `save 300 1` | RDB | Snapshot cada 5 min |
| `appendonly` | no | AOF off en dev |
| `maxmemory` | 100mb | LRU eviction |
| `maxclients` | 100 | Conexiones máximas |

## Secretos
| Secreto | Origen |
|---------|--------|
| `redis_password` | `secrets/redis_password.txt` (generado por `make init`) |

## Healthcheck
```bash
redis-cli -a $(cat /run/secrets/redis_password) ping | grep -q PONG
```

## Límites
| Recurso | Límite |
|---------|--------|
| CPU | 0.5 core |
| Memoria | 128 MB |

## Uso desde API y Middleware
- **API** (NestJS): ioredis → sesiones, caché general
- **Middleware** (Go): go-redis → rate-limit counters, caché de claves JWT

## Comandos útiles
```bash
docker compose exec redis redis-cli -a "$(cat /run/secrets/redis_password)" KEYS '*'
docker compose exec redis redis-cli -a "$(cat /run/secrets/redis_password)" MONITOR
docker compose logs redis
```
