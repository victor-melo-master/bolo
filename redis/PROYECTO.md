# Redis — Almacenamiento en Caché

## Descripción General

Servicio de caché y almacenamiento de sesiones para BOLO. Corre **Redis 7 Alpine** con una configuración endurecida: autenticación obligatoria mediante Docker Secret, comandos peligrosos deshabilitados o renombrados, persistencia RDB moderada, límite de memoria con política LRU, y red interna aislada.

Sirve como almacenamiento rápido para sesiones de usuario, tokens JWT invalidados, rate-limiting counters, y datos temporales de la API y el middleware.

## Estructura de Archivos

```
redis/
├── docker-entrypoint.sh    # Script de entrada: carga contraseña del secret e inicia Redis
└── redis.conf              # Configuración completa de Redis
```

## Stack Tecnológico

| Componente | Versión    | Propósito                        |
|------------|------------|----------------------------------|
| Redis      | 7 Alpine   | Servidor de caché en memoria     |
| Alpine     | —          | Base de imagen mínima            |

## Archivo docker-entrypoint.sh

```bash
#!/usr/bin/env sh
set -e

SECRET_FILE="/run/secrets/redis_password"

if [ ! -f "$SECRET_FILE" ]; then
  echo "[ERROR] Secret redis_password no encontrado en $SECRET_FILE"
  exit 1
fi

REDIS_PASSWORD="$(cat "$SECRET_FILE")"

exec redis-server /usr/local/etc/redis/redis.conf \
  --requirepass "$REDIS_PASSWORD"
```

**Propósito**: Redis no soporta nativamente Docker Secrets. Este script lee el secret de `/run/secrets/redis_password` y lo inyecta como `--requirepass` al arrancar el servidor. Sin este script, Redis arrancaría sin autenticación.

## Archivo redis.conf (configuración completa)

### Autenticación

La contraseña se inyecta dinámicamente (no está hardcodeada en el archivo). `requirepass` se pasa como argumento de línea de comandos desde `docker-entrypoint.sh`.

### Red

```conf
bind 0.0.0.0              # Escucha en todas las interfaces (seguro porque la red es interna)
protected-mode yes         # Solo permite conexiones si hay requirepass configurado
port 6379                  # Puerto estándar
tcp-backlog 128            # Cola de conexiones pendientes
tcp-keepalive 300          # Keepalive cada 5 minutos
```

### Comandos Peligrosos Deshabilitados

```conf
rename-command FLUSHALL   ""           # Deshabilitado completamente
rename-command FLUSHDB    ""           # Deshabilitado completamente
rename-command DEBUG      ""           # Deshabilitado completamente
rename-command SLAVEOF    ""           # Deshabilitado completamente
rename-command CONFIG     "BOLO_CONFIG_9f3a2b"  # Ofuscado (solo accesible con el nombre renombrado)
```

Estos comandos son peligrosos en producción porque permiten borrar toda la base de datos, depurar el servidor, cambiar la configuración en caliente, o alterar la replicación.

### Persistencia

```conf
save 300 1                 # Snapshot RDB cada 5 min si hay al menos 1 cambio
save 60 100                # Snapshot RDB cada 60 seg si hay al menos 100 cambios
dbfilename dump.rdb        # Nombre del archivo de snapshot
dir /data                  # Directorio de persistencia (montado como volumen)
appendonly no              # AOF desactivado en desarrollo (activar en producción)
```

- **RDB**: Snapshots periódicos. Suficiente para desarrollo con pérdida de datos mínima.
- **AOF**: Desactivado. En producción, activar `appendonly yes` para durabilidad transaccional.

### Memoria

```conf
maxmemory 100mb            # Límite máximo de memoria
maxmemory-policy allkeys-lru  # Política de expulsión: elimina las claves menos usadas
```

Cuando Redis alcanza 100 MB, elimina automáticamente las claves menos accedidas (LRU). Esto evita que el caché consuma toda la memoria del sistema.

### Logging

```conf
loglevel notice            # Nivel de log: notice (eventos importantes)
logfile ""                 # Salida a stdout (visible con docker logs)
```

### Límite de Conexiones

```conf
maxclients 100             # Máximo de conexiones concurrentes
```

## Despliegue — Paso a Paso

### En Desarrollo

```bash
# Redis se levanta automáticamente como parte del stack
make up

# Verificar que Redis está operativo
docker compose exec redis redis-cli -a "$(cat secrets/redis_password.txt)" ping
# Respuesta esperada: PONG
```

### En Desarrollo Local (sin Docker)

```bash
cd redis
chmod +x docker-entrypoint.sh
# Requiere tener Redis 7 instalado localmente
# El entrypoint.sh espera que exista /run/secrets/redis_password
```

### En Producción

```bash
docker build -t bolo-redis:latest .
# O simplemente usar la imagen oficial:
# redis:7-alpine con la configuración montada
```

## Variables de Entorno

No se usan variables de entorno directas. La contraseña se carga desde el Docker Secret montado en `/run/secrets/redis_password`.

## Dependencias entre Servicios

```
redis (healthy) ──→ api
redis (healthy) ──→ middleware
```

Tanto la API como el middleware esperan a que Redis esté saludable.

## Redes

| Red         | Tipo     | Acceso                        |
|-------------|----------|-------------------------------|
| `cache_net` | internal | API y Middleware pueden conectar |

`cache_net` tiene `internal: true`, sin salida a internet.

## Puertos

| Puerto | Bind             | Acceso                  |
|--------|------------------|-------------------------|
| 6379   | 127.0.0.1:6379   | Solo loopback del host  |

## Healthcheck

```yaml
test: ["CMD-SHELL", "redis-cli ping | grep -q PONG"]
interval: 10s
timeout: 5s
retries: 5
start_period: 30s
```

Nota: El healthcheck usa `redis-cli ping` sin autenticación porque se ejecuta dentro del contenedor (conexión local por Unix socket o loopback sin requirepass).

## Límites de Recursos

| Recurso | Límite |
|---------|--------|
| CPU     | 0.5 core |
| Memoria | 128 MB  |

## Volúmenes Persistentes

| Volumen      | Mount point | Propósito                    |
|--------------|-------------|------------------------------|
| `redis_data` | `/data`     | Datos persistentes (RDB)     |

## Notas de Seguridad

1. **Autenticación obligatoria**: No se puede conectar sin contraseña (`requirepass`).
2. **Comandos peligrosos bloqueados**: `FLUSHALL`, `FLUSHDB`, `DEBUG`, `SLAVEOF` están completamente deshabilitados. `CONFIG` está ofuscado.
3. **Red interna aislada**: Redis solo es accesible desde `cache_net`. No tiene exposición a internet ni a `public_net`.
4. **Puerto en loopback**: El mapeo `127.0.0.1:6379:6379` asegura que solo el host local puede conectarse directamente.
5. **Límite de memoria**: 100 MB con política LRU evita que el caché consuma toda la RAM del sistema.
6. **Máximo de conexiones**: 100 conexiones simultáneas, evitando agotar los file descriptors.
7. **Persistencia mínima en desarrollo**: RDB cada 5 minutos. En producción, evaluar activar AOF para durabilidad transaccional.
