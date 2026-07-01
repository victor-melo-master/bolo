# AGENTS — API (NestJS)

## Stack
Node.js 24 · NestJS 11 · TypeScript 5.7 · TypeORM 1.0 · PostgreSQL 18 · Redis 7

## Arquitectura
Hexagonal (Puertos y Adaptadores) en cada módulo:
- `domain/` — entidades puras, interfaces de repositorio (puertos), excepciones, value objects
- `application/` — casos de uso, DTOs internos
- `infrastructure/` — módulo NestJS, ORM entities, repositorios (TypeORM), servicios JWT
- `interfaces/` — controladores REST, DTOs de validación, guards

## Módulos
| Módulo | Estado | Endpoints |
|--------|--------|-----------|
| `auth` | ✅ Completo | register, login, profile CRUD, change-password (passenger + admin) |
| `fin` | 🔄 Parcial | create-wallet, create-coop-fare (faltan deposit, withdraw, payment) |
| `ops` | 🔄 Parcial | create-route, create-association |
| `trip` | ⏳ Stub | — |
| `audit` | ⏳ Stub | — |
| `shared` | ✅ Cross | crypto, redis, typeorm config, logging, guards, decorators, filters |

## Comandos
```bash
npm run start:dev    # dev con hot-reload
npm run build        # compilar a dist/
npm run test         # jest unit tests
npm run test:e2e     # e2e tests
npm run lint         # eslint --fix
```

## Convenciones
- Puertos: `{nombre}.repository.port.ts` con token string `NOMBRE_REPOSITORY_PORT`
- Implementaciones: `{nombre}.repository.impl.ts`
- Tests: `*.spec.ts` junto al archivo que prueban
- JSDoc con header `═══` blocks (Capa, Dependencias, @module)
- DTOs con `class-validator` decorators

## Claves de sesión JWT
Cada sesión tiene su propia clave de firma (`auth.sessions.jwt_key`). El middleware valida el token usando la clave guardada en BD/Redis. No hay un `JWT_SECRET` global.

## Docs relacionados
- `FLUJOS.md` — diagramas de flujo de la API
- `FLUJOS_MIDDLEWARE.md` — proxy, JWT, rate limiting
- `FLUJOS_REDIS.md` — caché y sesiones
- `FLUJOS_POSTGRES.md` — schema y seeders
- `PROYECTO.md` — documentación técnica
- `DOCUMENTACION.md` — análisis por archivo (~120 archivos)

## Variables de entorno clave
```
DB_HOST=postgres | DB_PORT=5432 | DB_NAME=bolo | DB_USER=bolo_admin
DB_PASSWORD_FILE=/run/secrets/pg_password
REDIS_HOST=redis | REDIS_PORT=6379
REDIS_PASSWORD_FILE=/run/secrets/redis_password
JWT_SECRET_FILE=/run/secrets/jwt_secret
QR_HMAC_SECRET_FILE=/run/secrets/qr_hmac_secret
PORT=3000 | NODE_ENV=development
```
