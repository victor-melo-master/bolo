# 🗄️ REDIS — CACHÉ DISTRIBUIDO (BOLO)

> Redis es el **almacén temporal** del sistema: sesiones, rate-limiting, claves JWT.
> Corre **Redis 7 Alpine** con autenticación obligatoria y comandos peligrosos bloqueados.

---

## 📌 ¿Qué guarda Redis?

| Dato                  | Clave ejemplo                        | TTL   | Quién lo usa        |
| --------------------- | ------------------------------------ | ----- | ------------------- |
| 🔑 Clave de firma JWT | `session_key:{sessionId}`            | 24h   | Middleware → API    |
| 🚦 Rate-limit counter | `rate_limit:{ip}`                    | 1min  | Middleware          |
| 📦 Caché de consultas | `cache:{entity}:{id}`                | var   | API                 |

```
              ┌──────────────────────────────────────┐
              │           REDIS 7 ALPINE              │
              │                                      │
              │  ┌──────────┐  ┌──────────────────┐ │
              │  │ Sesiones │  │  Rate-limit IPs   │ │
              │  │ JWT keys │  │  (contadores)     │ │
              │  └──────────┘  └──────────────────┘ │
              │  ┌──────────────────────────────────┐│
              │  │  Caché general (datos temporales) ││
              │  └──────────────────────────────────┘│
              │                                      │
              │  maxmemory: 100 MB  LRU eviction     │
              └──────────────────────────────────────┘
```

---

## 🚀 Flujo de Despliegue

### 1. Lo que necesita para arrancar

```
Redis 7 Alpine
│
├── 📄 redis.conf        → Configuración (seguridad, persistencia)
├── 🔐 redis_password    → Docker Secret en /run/secrets/
├── 💾 redis_data        → Volumen persistente en /data (RDB snapshots)
└── 🌐 cache_net         → Red interna (solo API + Middleware)
```

### 2. Cómo se levanta (Docker Compose)

```yaml
redis:
  image: redis:7-alpine
  container_name: bolo_redis
  command: >
    sh -c 'exec redis-server /usr/local/etc/redis/redis.conf
    --requirepass "$(cat /run/secrets/redis_password)"'
  secrets:
    - redis_password
  ports:
    - "127.0.0.1:6379:6379"
  volumes:
    - redis_data:/data
    - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
  healthcheck:
    test: ["CMD-SHELL", "redis-cli -a $(cat /run/secrets/redis_password) ping | grep -q PONG"]
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 128M
  networks:
    - cache_net
```

### 3. Orden de arranque

```
postgres (healthy) ──┐
                     ├──► api (healthy) ────► middleware (healthy) ──► frontend
redis (healthy) ─────┘        │
                              └──► middleware (healthy)
```

Redis debe estar **saludable** antes que API y Middleware.

---

## ⚙️ Valores de Configuración

### Secretos

| Secreto                | Origen              | Cómo se inyecta                              |
| ---------------------- | ------------------- | -------------------------------------------- |
| `redis_password`       | `secrets/redis_password.txt` | `--requirepass "$(cat /run/secrets/redis_password)"` |

En desarrollo se genera con `make init` → `openssl rand -hex 20`.

### Variables de entorno

Redis **no usa** variables de entorno. La contraseña se lee directo del archivo secreto.

### redis.conf — parámetros clave

| Parámetro              | Valor            | ¿Por qué?                                          |
| ---------------------- | ---------------- | -------------------------------------------------- |
| `bind`                 | `0.0.0.0`        | Escucha en todas las interfaces (controlado por red Docker) |
| `protected-mode`       | `yes`            | Solo acepta conexiones con contraseña               |
| `port`                 | `6379`           | Puerto estándar                                    |
| `tcp-keepalive`        | `300`            | Mantiene conexiones activas cada 5 minutos         |
| `rename-command FLUSHALL` | `""`          | 🚫 Deshabilitado (no se puede borrar todo)         |
| `rename-command FLUSHDB`  | `""`          | 🚫 Deshabilitado                                   |
| `rename-command CONFIG`   | `"BOLO_CONFIG_9f3a2b"` | 🔒 Ofuscado (no se puede reconfigurar en caliente) |
| `rename-command DEBUG`    | `""`          | 🚫 Deshabilitado                                   |
| `rename-command SLAVEOF`  | `""`          | 🚫 Deshabilitado                                   |
| `save 300 1`           | Snapshot RDB     | Cada 5 min si ≥ 1 cambio                           |
| `save 60 100`          | Snapshot RDB     | Cada 60 s si ≥ 100 cambios                         |
| `appendonly`           | `no`             | AOF desactivado en desarrollo                      |
| `maxmemory`            | `100mb`          | Límite máximo de memoria                           |
| `maxmemory-policy`     | `allkeys-lru`    | Elimina las claves menos usadas al llenarse        |
| `maxclients`           | `100`            | Máximo de conexiones simultáneas                   |
| `loglevel`             | `notice`         | Eventos importantes                                |
| `logfile`              | `""`             | Salida a stdout (visible con `docker logs`)        |

---

## 🌐 Redes

```
cache_net (internal: true)
│
├── redis:6379  ◄──►  API (NestJS)
│                     │   Usa: sesiones, caché
│                     │
└── redis:6379  ◄──►  Middleware (Go Fiber)
                        Usa: rate-limiting, claves JWT
```

**Reglas:**
- Redis **solo** está en `cache_net`
- No tiene acceso a `public_net`, `db_net` ni `api_net`
- API y Middleware pueden conectarse a Redis, pero no al revés

---

## 🔐 Autenticación

```
Flujo de conexión:
                    ┌──────────────────────┐
Cliente ──► AUTH   │  Redis                │
(password)  ──►    │  ¿Coincide?           │
                    │  ├─ Sí → comandos OK │
                    │  └─ No → NOAUTH      │
                    └──────────────────────┘
```

La contraseña se inyecta en tiempo de arranque vía `--requirepass`. No está hardcodeada en el archivo de configuración.

---

## 📦 Persistencia

```
            ┌──────────────┐
            │  Redis 7     │
            │              │
            │  dump.rdb ◄──┤ RDB snapshot cada 5 min
            │              │
            └──────┬───────┘
                   │
            ┌──────▼───────┐
            │  redis_data   │  Volumen Docker persistente
            │  (/data)     │
            └──────────────┘
```

- **RDB**: Snapshots periódicos. Suficiente para desarrollo.
- **AOF**: Desactivado. En producción, cambiar `appendonly yes` para durabilidad transaccional.
- **Volumen**: `redis_data` → montado en `/data`

---

## 💻 Comandos útiles

```bash
# Verificar que Redis está vivo
docker compose exec redis \
  redis-cli -a "$(cat /run/secrets/redis_password)" ping
# → PONG

# Ver todas las claves
docker compose exec redis \
  redis-cli -a "$(cat /run/secrets/redis_password)" KEYS '*'

# Monitorear comandos en tiempo real
docker compose exec redis \
  redis-cli -a "$(cat /run/secrets/redis_password)" MONITOR

# Ver info de memoria
docker compose exec redis \
  redis-cli -a "$(cat /run/secrets/redis_password)" INFO memory

# Ver logs del contenedor
docker compose logs redis
```

---

## 📊 Límites de recursos

| Recurso | Límite | Consecuencia si se excede         |
| ------- | ------ | --------------------------------- |
| Memoria | 128 MB | Contenedor OOM kill (Docker)      |
| CPU     | 0.5    | Throttling (no kill)             |
| Claves  | ~100MB | Redis LRU elimina las menos usadas|

---

## ✅ Healthcheck

```yaml
test: ["CMD-SHELL", "redis-cli -a $(cat /run/secrets/redis_password) ping | grep -q PONG"]
interval: 10s
timeout: 5s
retries: 5
start_period: 30s
```

El healthcheck lee la misma contraseña del secreto para verificar que Redis responde.

---

## 🔄 Flujo de Rate-limiting (ejemplo)

```
Petición HTTP entrante
      │
      ▼
Middleware incrementa contador en Redis:
  INCR rate_limit:192.168.1.100
  EXPIRE rate_limit:192.168.1.100 60
      │
      ▼
¿Contador > 5?
      ├── No → pasa al siguiente middleware
      └── Sí → responde 429 Too Many Requests
```

---

## 🔄 Flujo de Validación JWT (con Redis)

```
Middleware recibe token
      │
      ▼
Extrae sessionId del JWT
      │
      ▼
Busca clave en Redis:
  GET session_key:{sessionId}
      │
      ├── Encontrada → verifica firma JWT
      │
      └── No encontrada → consulta PostgreSQL
                          → guarda en Redis (caché)
                          → verifica firma JWT
```

---

## ▶️ Despliegue paso a paso

### En desarrollo

```bash
# Redis arranca automáticamente con el stack
make up

# Verificar estado
make ps

# Ver logs de Redis
docker compose logs redis

# Shell dentro del contenedor
docker compose exec redis sh
```

### En producción

1. **Cambiar a AOF**: `appendonly yes` en `redis.conf`
2. **Ajustar `maxmemory`** según RAM disponible
3. **Evaluar replicación** (Redis Sentinel / Cluster) si se necesita alta disponibilidad
4. **Cambiar `loglevel`** a `warning` para reducir logs
5. **Reemplazar secreto local** por Docker Swarm Secrets / Vault

---

## 📁 Archivos del servicio

| Archivo                               | Propósito                                   |
| ------------------------------------- | ------------------------------------------- |
| `redis/redis.conf`                    | Configuración de seguridad y persistencia   |
| `redis/docker-entrypoint.sh`          | Script de arranque (inyecta contraseña)    |
| `redis/PROYECTO.md`                   | Documentación técnica pre-existente         |
| `redis/README.md`                     | README del servicio Redis                   |
| `secrets/redis_password.txt`          | Contraseña (generada por `make init`)       |
