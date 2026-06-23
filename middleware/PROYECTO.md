# Middleware — Go Fiber

## Descripción General

Gateway de entrada, proxy de seguridad y punto de control único para toda la comunicación entre el frontend y la API de BOLO. Escrito en **Go 1.25** con **Fiber v2** (framework basado en fasthttp, significativamente más rápido que net/http).

Actúa como **API Gateway** en la arquitectura: el frontend (React) nunca se comunica directamente con la API (NestJS). Todas las peticiones pasan por el middleware, que se encarga de validación JWT, rate-limiting anti-abuso, firma y verificación HMAC de códigos QR, caché distribuida con Redis, y proxy reverso hacia la API interna. Es el **único servicio expuesto al exterior** (puerto 8080).

## Estructura de Archivos

```markdown
middleware/
├── .air.toml            # Configuración de Air (hot-reload en desarrollo)
├── Dockerfile           # Multi-stage: base / development / build / production (scratch)
├── go.mod               # Módulo Go: bolo/middleware (Go 1.25)
├── go.sum               # Checksums de dependencias
├── main.go              # Punto de entrada (29 líneas, placeholder)
└── tmp/                 # Binarios temporales de Air (generado)
```

## Stack Tecnológico

| Componente   | Versión      | Propósito                                |
|--------------|--------------|------------------------------------------|
| Go           | 1.25         | Lenguaje compilado, tipado estáticamente |
| Fiber v2     | v2.52.13     | Framework HTTP (fasthttp)                |
| Air          | latest       | Hot-reload en desarrollo                 |
| Redis        | 7            | Caché de sesiones, rate-limiting         |
| Scratch      | —            | Imagen base de producción (~0 MB)        |

### Dependencias (go.mod)

```
github.com/gofiber/fiber/v2       # Framework web
github.com/google/uuid            # Generación de UUIDs
github.com/valyala/fasthttp       # HTTP engine subyacente (por Fiber)
github.com/klauspost/compress     # Compresión (por Fiber)
github.com/andybalholm/brotli     # Soporte Brotli (por Fiber)
```

## Despliegue — Paso a Paso

### En Desarrollo (hot-reload con Air)

```bash
# Desde la raíz del proyecto, el middleware se levanta automáticamente
make up
```

Air vigila los archivos `.go` en el directorio `./middleware` y recompila al detectar cambios:

```toml
# .air.toml
cmd = "go build -o ./tmp/main ."
include_ext = ["go", "tpl", "html", "env"]
exclude_dir = ["assets", "tmp", "vendor", "testdata"]
delay = 1000
stop_on_error = true
```

El contenedor monta `./middleware:/app` como volumen, por lo que los cambios locales se reflejan al instante. La caché de módulos Go se almacena en el volumen `middleware_cache` para no descargar dependencias en cada reinicio.

### En Desarrollo Local (sin Docker)

```bash
cd middleware
go mod download
go run .              # Inicia en localhost:8080
# O con Air:
go install github.com/air-verse/air@latest
air
```

### En Producción

El stage `production` genera un **binario estático** compilado con `CGO_ENABLED=0` y lo despliega en una **imagen scratch**:

```bash
docker build --target production -t bolo-middleware:latest .
```

Flags de compilación:

```dockerfile
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s -extldflags=-static" \
    -trimpath \
    -o /out/middleware ./cmd/main.go
```

- `CGO_ENABLED=0`: Binario completamente estático (sin dependencias de C)
- `-ldflags="-w -s"`: Sin información de debug ni tabla de símbolos
- `-trimpath`: Rutas de compilación limpias (sin información del sistema de archivos local)

La imagen final pesa ~5 MB y solo contiene:

- El binario compilado `/middleware`
- Certificados CA para HTTPS
- Zona horaria (`/usr/share/zoneinfo`)
- Usuario `nobody` (UID 65534)

## Variables de Entorno

| Variable             | Requerida | Default | Descripción                                    |
|----------------------|-----------|---------|------------------------------------------------|
| JWT_SECRET_FILE      | Sí        | —       | Ruta al secret con la clave de firma JWT      |
| QR_HMAC_SECRET_FILE  | Sí        | —       | Ruta al secret HMAC para códigos QR           |
| REDIS_HOST           | Sí        | —       | Host del servidor Redis                        |
| REDIS_PORT           | Sí        | —       | Puerto de Redis (6379)                         |
| REDIS_PASSWORD_FILE  | Sí        | —       | Ruta al secret con contraseña de Redis         |
| API_URL              | Sí        | —       | URL interna de la API (<http://api:3000>)        |
| FIBER_PREFORK        | No        | false   | Modo prefork (múltiples procesos)              |
| LOG_LEVEL            | No        | info    | Nivel de logging (debug, info, warn, error)    |

## Funcionalidades Actuales (placeholder)

Actualmente `main.go` implementa solo endpoints básicos:

```go
// Endpoint raíz
app.Get("/", func(c *fiber.Ctx) error {
    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "middleware": "hello world",
    })
})

// Healthcheck para Docker
app.Get("/health", func(c *fiber.Ctx) error {
    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "status": "healthy",
    })
})
```

**Pendiente de implementar:**

- [ ] Validación y renovación de JWT
- [ ] Rate-limiting por IP/usuario (Redis + sliding window)
- [ ] Proxy reverso a la API (forwarding de peticiones)
- [ ] Firma y verificación HMAC de códigos QR
- [ ] Manejo de CORS
- [ ] Logging estructurado
- [ ] Métricas Prometheus

## Dependencias entre Servicios

```
redis (healthy) ──→ middleware ──→ frontend
api (healthy)   ──→ middleware
```

El middleware espera a que tanto Redis como la API estén saludables.

## Redes

| Red          | Tipo     | Tráfico                                     |
|--------------|----------|---------------------------------------------|
| `public_net` | bridge   | Tráfico externo: frontend ↔ middleware       |
| `cache_net`  | internal | Conexión a Redis                            |
| `api_net`    | internal | Proxy reverso hacia la API (<http://api:3000>) |

El middleware es el **único servicio** que está en `public_net` y puede recibir tráfico externo. También es el puente entre `public_net`, `cache_net` y `api_net`.

## Healthcheck

```yaml
test: ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
interval: 10s
timeout: 5s
retries: 5
start_period: 30s
```

## Puertos

| Entorno     | Puerto | Servicio       |
|-------------|--------|----------------|
| Desarrollo  | 8080   | Fiber (Air)    |
| Producción  | 8080   | Fiber (binario)|

Siempre expuesto en `127.0.0.1` (loopback del host).

## Notas de Seguridad

1. **Único punto de entrada**: Todo el tráfico externo pasa por aquí. No hay exposición directa de la API.
2. **Imagen scratch**: En producción, el contenedor no tiene shell, package manager, ni herramientas de depuración. Solo el binario.
3. **Usuario nobody**: El binario corre como UID 65534, sin permisos de escritura en el sistema de archivos.
4. **Redis aislado**: La conexión a Redis solo es posible desde `cache_net` (red interna).
5. **API invisible**: La API está en `api_net` (red interna), inalcanzable desde `public_net`.
6. **Binario estático**: Sin dependencias dinámicas que puedan ser explotadas.
7. **Docker Secrets**: Las contraseñas y claves se leen de archivos montados, nunca de variables de entorno.
