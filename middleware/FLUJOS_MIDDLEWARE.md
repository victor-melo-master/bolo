# 🌐 CAPA DE SEGURIDAD (MIDDLEWARE) — BOLO

> El middleware es la **puerta de entrada** al sistema. Todo el tráfico pasa por él antes de llegar a la API.
> Escrito en **Go** con **Fiber v2**. Actúa como proxy inverso, validador JWT y cortafuegos.

---

## 📌 ¿Qué es el Middleware y por qué existe?

Imagina que la API NestJS es una casa. El middleware es la **reja de entrada**, el **portero electrónico** y el **sistema de vigilancia**:

| Sin middleware                                             | Con middleware                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| El frontend llama directo a la API                        | El frontend llama al middleware, y este llama a la API           |
| La API está expuesta en la red pública                    | La API está en una red **privada**, invisible desde afuera       |
| Cualquiera puede atacar la API directamente               | Los atacantes solo ven el middleware (imagen mínima Go)          |
| La API tiene que manejar autenticación + lógica de negocio| El middleware valida JWT antes de que llegue a la API            |

### Arquitectura real

```
                    ┌─ Red Pública ─┐   ┌─ Red Interna ─┐   ┌─ Red BD ─┐
                    │               │   │               │   │           │
  App Móvil ───────►│  MIDDLEWARE   │──►│  API NestJS   │──►│PostgreSQL │
  Web Browser ─────►│  (Go/Fiber)   │   │  (Node.js)    │   │           │
                    │   Puerto:8080 │   │   Puerto:3000 │   │           │
                    └───────────────┘   └───────────────┘   └───────────┘
                            │                   │
                            ▼                   ▼
                     ┌──────────────┐   ┌──────────────┐
                     │    Redis     │   │    Redis     │
                     │  (sesiones,  │   │  (caché)     │
                     │  rate-limit) │   │              │
                     └──────────────┘   └──────────────┘
```

**Clave:** la API **NUNCA** está expuesta al exterior. Solo el middleware tiene acceso a la red pública.

---

## 🛡️ ¿Qué hace el middleware exactamente?

### 1. Proxy Inverso

Todas las peticiones que llegan a `http://middeware:8080/api/*` se reenvían a `http://api:3000/*` (quitando el prefijo `/api`).

```
Frontend:  GET /api/auth/passenger/profile
                │
                ▼
Middleware: recibe /api/auth/passenger/profile
                │
                ├─ ¿Es ruta pública? → pasa sin JWT
                ├─ ¿Requiere JWT? → valida token
                │
                ▼
API:        recibe /auth/passenger/profile (sin /api)
```

### 2. Validación JWT con Claves Rotativas

Cada sesión de usuario tiene su **propia clave de firma JWT**. Cuando el middleware recibe un token:

```
Petición entrante
      │
      ▼
¿Header Authorization: Bearer <token>?
      │
      ▼
1. Extrae sessionId del token (sin verificar firma aún)
      │
      ▼
2. Busca la clave de firma en Redis
      │
      ├─ ¿En Redis? → la usa
      │
      └─ ¿No está? → consulta PostgreSQL → la guarda en Redis
      │
      ▼
3. Verifica la firma del JWT con esa clave
      │
      ▼
4. Inyecta headers con datos del usuario:
   • X-User-Id
   • X-User-Role
   • X-Session-Id
      │
      ▼
Reenvía a la API
```

**¿Por qué es seguro?**
- Cada inicio de sesión genera una **nueva clave** → el token anterior se invalida
- Las claves se cacheadas en Redis (rápido) con respaldo en PostgreSQL
- Las sesiones expiradas se limpian automáticamente

### 3. Rate Limiting (Control de Tráfico)

Cada IP solo puede hacer **5 peticiones por minuto**. Usa Redis para contar:

```
IP: 192.168.1.100
      │
      ▼
Redis: clave "rate_limit:192.168.1.100" → contador
      │
      ├─ < 5 peticiones/min → pasa ✓
      │
      └─ ≥ 5 peticiones/min → 429 Too Many Requests ✗
```

### 4. Honeypot (Señuelo de Seguridad)

El middleware añade cabeceras falsas para confundir a atacantes automáticos:

```
x-railway-request-id:  a1b2c3d4-e5f6-7890-abcd-ef1234567890
x-railway-service-name: bolo-api
x-railway-region:       us-west1
railway-env:            production
server:                 railway
```

Esto hace que parezca que el servicio corre en **Railway** (plataforma cloud), cuando en realidad está en infraestructura propia. Los atacantes pierden tiempo atacando la plataforma equivocada.

### 5. CORS

Solo permite peticiones desde `http://localhost:5173` (el frontend en desarrollo) con credenciales (cookies).

---

## 🧩 ¿Cómo se conecta con el resto del sistema?

### Redes Aisladas

Cada servicio está en una red Docker separada. El middleware es el **único** que está en múltiples redes:

```
                ┌──────────────────────────────────────────┐
                │            RED PÚBLICA                    │
                │  frontend ◄──────► middleware             │
                └──────────────────────────────────────────┘
                            │
                            ▼
                ┌──────────────────────────────────────────┐
                │            RED API (interna)              │
                │  middleware ◄──────► api                  │
                └──────────────────────────────────────────┘
                            │
                            ▼
                ┌──────────────────────────────────────────┐
                │            RED CACHE (interna)            │
                │  middleware ◄──────► redis               │
                └──────────────────────────────────────────┘
                            │
                            ▼
                ┌──────────────────────────────────────────┐
                │            RED BD (interna)               │
                │  middleware ◄──────► postgres             │
                └──────────────────────────────────────────┘
```

**Principio de mínimo privilegio:**
- PostgreSQL solo está en `db_net` y `cache_net`
- Redis solo está en `cache_net`
- API solo está en `api_net`, `db_net` y `cache_net`
- Frontend solo está en `public_net`
- **Middleware** está en **todas** las redes (es el puente)

### Dependencias entre servicios

```
postgres (saludable) ────┐
                         ├──► api (saludable) ────┐
redis (saludable) ───────┘                        ├──► middleware ────► frontend
                                                   │
redis (saludable) ────────────────────────────────┘
```

---

## 🌊 Flujo Completo: Petición Autenticada

```
Frontend                         Middleware                         API                           PostgreSQL
  (React)                        (Go/Fiber)                      (NestJS)                          (PG)
    │                                │                              │                                │
    │  1. Login                      │                              │                                │
    │  POST /api/auth/passenger/login│                              │                                │
    │  ────────────────────────────► │                              │                                │
    │                                │  ¿Ruta pública? → Sí, pasa   │                                │
    │                                │  ──────────────────────────► │                                │
    │                                │                              │  2. Verifica credenciales       │
    │                                │                              │  ──────────────────────────────►│
    │                                │                              │  ◄── usuario encontrado ────────│
    │                                │                              │                                │
    │                                │                              │  3. Genera JWT + sesión         │
    │                                │                              │  ──────────────────────────────►│
    │                                │                              │     auth.sessions               │
    │                                │                              │                                │
    │  ◄── { token, user } ─────────│  ◄── 200 OK ──────────────── │                                │
    │                                │                              │                                │
    │                                │                              │                                │
    │  4. Petición autenticada       │                              │                                │
    │  GET /api/auth/passenger/profile│                             │                                │
    │  Authorization: Bearer <token> │                              │                                │
    │  ────────────────────────────► │                              │                                │
    │                                │  ¿Ruta pública? → No         │                                │
    │                                │                              │                                │
    │                                │  5. Extrae sessionId del JWT │                                │
    │                                │                              │                                │
    │                                │  6. Busca clave de firma     │                                │
    │                                │  ───────────────────────────►│                                │
    │                                │     (Redis cache)            │                                │
    │                                │  ◄── clave de firma ────────│                                │
    │                                │                              │                                │
    │                                │  7. Verifica firma JWT       │                                │
    │                                │                              │                                │
    │                                │  8. Inyecta headers          │                                │
    │                                │  (X-User-Id, X-User-Role,    │                                │
    │                                │   X-Session-Id)              │                                │
    │                                │                              │                                │
    │                                │  9. Reenvía a la API         │                                │
    │                                │  ──────────────────────────► │                                │
    │                                │                              │  10. Procesa la petición        │
    │                                │                              │  ──────────────────────────────►│
    │                                │                              │  ◄── datos del perfil ─────────│
    │                                │                              │                                │
    │  ◄── datos del perfil ────────│  ◄── 200 OK ──────────────── │                                │
```

---

## 🏗️ Anatomía del Código (main.go)

El middleware está en `middleware/main.go` (~340 líneas de Go). Sus partes principales:

```
main.go
├── 1. Configuración (variables de entorno)
│     API_URL, REDIS_ADDR, DB_HOST, DB_PORT, ...
│
├── 2. Conexiones externas
│     ├── initRedis()      → Cliente Redis con 5 reintentos
│     └── initPostgreSQL() → Pool de conexiones PG con 5 reintentos
│
├── 3. Middleware pipeline (orden exacto)
│     ├── Cors             → Solo localhost:5173
│     ├── Honeypot         → Cabeceras falsas de Railway
│     ├── Logger           → Registro de peticiones
│     ├── Rate Limit       → 5 req/min por IP
│     ├── JWT Auth         → Validación con claves rotativas
│     └── Proxy            → Reenvío a API (sin /api)
│
└── 4. Servidor
      app.Listen(":8080")
```

### Flujo interno del middleware

```
Petición HTTP entrante
      │
      ▼
┌─────────────┐
│ 1. CORS     │  → ¿Origen permitido?
└──────┬──────┘
       ▼
┌─────────────┐
│ 2. Honeypot │  → Añade cabeceras falsas
└──────┬──────┘
       ▼
┌─────────────┐
│ 3. Logger   │  → Registra método, URL, tiempo
└──────┬──────┘
       ▼
┌─────────────┐
│ 4. Rate     │  → ¿IP excede límite? → 429
│    Limit    │
└──────┬──────┘
       ▼
┌─────────────┐
│ 5. JWT Auth │  → ¿Ruta pública? → pasa
│             │  → ¿Token válido?  → inyecta headers
│             │  → ¿Token inválido? → 401
└──────┬──────┘
       ▼
┌─────────────┐
│ 6. Proxy    │  → Reenvía a API interna
└─────────────┘
       │
       ▼
Respuesta al cliente
```

---

## 🔍 Comparativa: Ruta Pública vs Ruta Protegida

### Ruta pública (login, registro, health)

```
Frontend ──► Middleware ──► API ──► PostgreSQL
                 │
            Solo pasa por:
            • CORS
            • Honeypot
            • Logger
            • Rate Limit
            (NO valida JWT)
```

### Ruta protegida (perfil, rutas, tarifas)

```
Frontend ──► Middleware ──► API ──► PostgreSQL
                 │
            Pasa por TODO:
            • CORS
            • Honeypot
            • Logger
            • Rate Limit
            • JWT Auth (valida token + clave rotativa)
            • Proxy
```

---

## 🚀 ¿Cómo se despliega?

### Con Docker Compose (recomendado)

```bash
# Desde la raíz del proyecto
make init    # Genera secretos, construye imágenes
make up      # Levanta todo: postgres, redis, api, middleware, frontend
```

El middleware se construye con un **Dockerfile multi-stage**:

| Stage        | Base      | Propósito                        |
|------------- |-----------|----------------------------------|
| `base`       | golang:1.25-alpine | Descarga dependencias     |
| `development`| base      | Hot-reload con Air               |
| `build`      | base      | Compilación estática optimizada  |
| `production` | scratch   | Imagen mínima (~5 MB)            |

En producción, el binario está compilado con:
- `CGO_ENABLED=0` → sin dependencias dinámicas
- `-ldflags="-w -s"` → sin debug symbols
- Corre como usuario `nobody` (UID 65534)

### Sin Docker (desarrollo local)

```bash
cd middleware
go mod download
go run main.go
# Middleware corre en localhost:8080
# La API debe estar corriendo en localhost:3000
```

---

## 📁 Archivos del Middleware

| Archivo                          | Propósito                                                   |
| -------------------------------- | ----------------------------------------------------------- |
| `middleware/main.go`             | Servidor Go/Fiber con toda la lógica (~340 líneas)          |
| `middleware/go.mod`              | Definición del módulo Go y dependencias                     |
| `middleware/go.sum`              | Checksums de las dependencias                               |
| `middleware/Dockerfile`          | Multi-stage: dev (Air) / prod (scratch)                     |
| `middleware/.air.toml`           | Configuración de hot-reload para desarrollo                 |
| `middleware/PROYECTO.md`         | Documentación técnica del middleware                        |
| `middleware/README.md`           | README del middleware                                       |

---

## 🔐 Secretos que usa

El middleware lee secretos desde archivos montados en `/run/secrets/`:

| Secreto           | Para qué                                           |
| ----------------- | -------------------------------------------------- |
| `redis_password`  | Conectarse a Redis (sesiones, rate limit)          |
| `pg_password`     | Conectarse a PostgreSQL (fallback de sesiones)     |

---

## 📊 Resumen de Responsabilidades

| Responsabilidad              | ¿Dónde se hace?                 | Tecnología           |
| ---------------------------- | ------------------------------- | -------------------- |
| Recibir tráfico externo      | Middleware (puerto 8080)        | Go/Fiber             |
| Validar JWT                  | Middleware (antes de reenviar)  | golang-jwt           |
| Rate Limiting                | Middleware (por IP)             | Redis + redis_rate   |
| Caché de claves JWT          | Middleware → Redis              | go-redis             |
| Proxy a la API               | Middleware → API (red interna)  | Fiber proxy          |
| Lógica de negocio            | API NestJS                      | TypeScript           |
| Persistencia                 | API → PostgreSQL                | TypeORM              |
| Sesiones (creación)          | API NestJS                      | TypeORM + PostgreSQL |
| Sesiones (validación)        | Middleware → Redis/PostgreSQL   | Go/pgx               |
| Honeypot (señuelo)           | Middleware (cabeceras HTTP)     | Go/Fiber             |
