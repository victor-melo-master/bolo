# AGENTS — Middleware (Go Fiber)

## Stack
Go 1.25 · Fiber v2 · go-redis v9 · pgx v5 · golang-jwt v5 · redis_rate v10

## Propósito
Proxy inverso de seguridad, punto de entrada único del sistema. Todo el tráfico externo pasa por aquí. La API NestJS **nunca** está expuesta al exterior.

## Estado
✅ Funcional — todos los middlewares implementados.

## Pipeline de Middleware (orden exacto)
```
Petición HTTP entrante
  │
  ▼
1. CORS        → AllowOrigins: http://localhost:5173, credenciales
2. Honeypot    → Cabeceras falsas (Railway) para confundir atacantes
3. Logger      → Método, URL, tiempo de respuesta
4. Rate Limit  → 5 req/min por IP (Redis + redis_rate)
5. JWT Auth    → Validación con claves rotativas por sesión
6. Proxy       → Reenvío a API (stripa /api)
```

## Validación JWT
```
1. Extrae sessionId del token (sin verificar)
2. Busca clave en Redis (get session:{sessionId})
3. Si no está → fallback a PostgreSQL → cachea en Redis (TTL 24h)
4. Verifica firma JWT con la clave obtenida
5. Inyecta headers: X-User-Id, X-User-Role, X-Session-Id
```

## Rutas públicas (sin JWT)
```go
publicPaths := []string{
    "/api/auth/passenger/login",
    "/api/auth/passenger/register",
    "/api/auth/admin/login",
    "/api/health",
}
```

## Secretos que lee
| Secreto | Variable | Propósito |
|---------|----------|-----------|
| REDIS_PASSWORD_FILE | `/run/secrets/redis_password` | Conexión a Redis |
| DB_PASSWORD_FILE | `/run/secrets/pg_password` | Fallback sesiones PostgreSQL |

## Variables de entorno
```go
API_URL          = http://api:3000
REDIS_ADDR       = redis:6379
DB_HOST          = postgres
DB_PORT          = 5432
DB_USER          = bolo_admin
DB_NAME          = bolo
PORT             = 8080
LOG_LEVEL        = info
```

## Despliegue
```bash
# Dev con hot-reload (Air)
docker compose up -d middleware

# Producción (scratch image ~5MB)
cd middleware && CGO_ENABLED=0 go build -ldflags="-w -s" -o dist/main .
```

## Conexiones externas
- **Redis**: 5 reintentos, 2s intervalo
- **PostgreSQL**: pool pgx, 5 reintentos, 2s intervalo
- **API**: proxy Fiber directo (sin reintentos explícitos)

## Redes
El middleware está en **todas** las redes: `public_net`, `api_net`, `cache_net`, `db_net`.
Es el único puente entre la red pública y los servicios internos.

## Archivos clave
| Archivo | Propósito |
|---------|-----------|
| `main.go` | ~346 líneas, todo el middleware en un solo archivo |
| `Dockerfile` | Multi-stage: development (Air) / production (scratch) |
| `go.mod` | Dependencias Go |
| `.air.toml` | Hot-reload config |
