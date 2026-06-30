# `middleware/` — Capa de proxy/seguridad (Go Fiber)

Microservicio escrito en **Go** usando el framework **Fiber v2** que actúa como proxy inverso y capa de seguridad entre el frontend y la API interna.

## Archivos

| Archivo | Propósito |
|---|---|
| `main.go` | Punto de entrada: servidor Fiber con rutas base |
| `Dockerfile` | Multi-stage: desarrollo con hot-reload (Air) y producción (scratch) |
| `go.mod` / `go.sum` | Dependencias de Go (Fiber v2) |
| `.air.toml` | Configuración de hot-reload para desarrollo |
| `PROYECTO.md` | Notas del proyecto (pre-existente) |
| `tmp/` | Directorio temporal de Air (no versionado) |

## `main.go` — Servidor Fiber

Actualmente implementa dos endpoints base:

| Ruta | Método | Respuesta | Propósito |
|---|---|---|---|
| `/` | `GET` | `{"middleware": "hello world"}` | Endpoint de verificación básica |
| `/health` | `GET` | `{"status": "healthy"}` | Healthcheck para Docker |

El archivo está preparado para añadir:

- **Proxy inverso** hacia la API (NestJS) en `http://api:3000`
- **Validación de tokens JWT** usando `jwt_secret`
- **Rate limiting** con Redis como backend
- **Registro de auditoría** de peticiones entrantes
- **CORS** y cabeceras de seguridad

```go
func main() {
    app := fiber.New()
    app.Get("/", ...)      // Health check simple
    app.Get("/health", ...) // Health check para Docker
    // ... rutas de proxy, auth, etc.
    app.Listen(":8080")
}
```

## `Dockerfile` — Multi-stage

### Stage `base`
- Imagen: `golang:1.25-alpine`
- Descarga dependencias (`go mod download && go mod verify`)
- Instala `git`, `ca-certificates`, `tzdata`, `curl`

### Stage `development`
- Instala **Air** (`github.com/air-verse/air`) para recarga automática en cambios
- Monta el código fuente como volumen (ver `docker-compose.yml`)
- Comando: `air -c /app/.air.toml`

### Stage `build`
- Compilación optimizada: `CGO_ENABLED=0`, `GOOS=linux`, `GOARCH=amd64`
- Flags: `-ldflags="-w -s -extldflags=-static"`, `-trimpath`
- Salida: `/out/middleware`

### Stage `production`
- Imagen base: `scratch` (mínima posible)
- Solo copia: certificados CA, zona horaria, binario compilado
- Usuario no privilegiado: `UID 65534` (nobody)
- Puerto: `8080`

## Integración con Docker Compose

### Variables de entorno

| Variable | Propósito |
|---|---|
| `JWT_SECRET_FILE` | Ruta al secreto JWT (`/run/secrets/jwt_secret`) |
| `QR_HMAC_SECRET_FILE` | Ruta al secreto HMAC de QR |
| `REDIS_HOST` / `REDIS_PORT` | Conexión a Redis |
| `REDIS_PASSWORD_FILE` | Ruta al secreto de Redis |
| `API_URL` | URL de la API interna (`http://api:3000`) |
| `FIBER_PREFORK` | `"false"` (deshabilitado en desarrollo) |
| `LOG_LEVEL` | Nivel de log (`info` por defecto) |

### Secretos montados

- `jwt_secret`
- `qr_hmac_secret`
- `redis_password`

### Redes

El middleware es el único servicio conectado a **3 redes**:

```
public_net  ←→ Frontend (React) — tráfico externo
cache_net   ←→ Redis — sesiones, rate limiting, caché
api_net     ←→ API (NestJS) — proxy inverso
```

Esto permite que el middleware actúe como **puerta de entrada única**:

```
Frontend → Middleware (Go Fiber) → API (NestJS) → PostgreSQL
                              ↘ Redis
```

### Healthcheck

```dockerfile
test: ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
```

## Responsabilidades previstas (futuro)

- **Proxy inverso**: reenviar peticiones a la API interna
- **Autenticación JWT**: validar tokens antes de llegar a la API
- **Rate limiting**: control de tráfico por IP/usuario usando Redis
- **CORS**: gestionar orígenes permitidos
- **Logging centralizado**: registro de todas las peticiones
- **Compresión**: Gzip/Brotli para respuestas
- **Timeout y circuit breaker**: protección contra fallos en cascada
