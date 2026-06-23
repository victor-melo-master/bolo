# API — NestJS Monolítico

## Descripción General

API principal del sistema BOLO. Es un monolito construido con **NestJS 11** sobre **Node.js 24** que centraliza toda la lógica de negocio: autenticación y registro de usuarios (pasajeros, conductores, admins), gestión de cooperativas y asociaciones, administración de rutas y flota de vehículos, ejecución de viajes con tracking GPS, sistema de billetera y pagos con soporte para crédito de emergencia, y cálculo de tarifas con tasas de cambio diarias.

Se comunica con **PostgreSQL 18 + PostGIS** para persistencia y con **Redis 7** para caché de sesiones y rate-limiting. No expone puerto al exterior en producción — todo el tráfico externo pasa por el middleware (Go Fiber).

## Estructura de Archivos

```
api/
├── .prettierrc              # Configuración de formato
├── Dockerfile               # Multi-stage: base / development / build / production
├── eslint.config.mjs        # Configuración ESLint flat config
├── nest-cli.json            # Configuración del CLI de NestJS
├── package.json             # Dependencias y scripts
├── package-lock.json        # Lockfile de npm
├── tsconfig.json            # TypeScript configuración raíz
├── tsconfig.build.json      # TypeScript configuración para build
├── src/                     # Código fuente
│   ├── main.ts              # Punto de entrada de la aplicación
│   ├── app.module.ts        # Módulo raíz de NestJS
│   ├── app.controller.ts    # Controlador raíz
│   ├── app.service.ts       # Servicio raíz
│   └── ...                  # Módulos, servicios, controladores adicionales
├── test/                    # Tests end-to-end
│   ├── jest-e2e.json
│   └── app.e2e-spec.ts
└── dist/                    # Compilación TypeScript (generado)
```

## Stack Tecnológico

| Componente    | Versión   | Propósito                              |
|---------------|-----------|----------------------------------------|
| Node.js       | 24 Alpine | Runtime JavaScript                      |
| NestJS        | ^11.0     | Framework backend (controladores, módulos, servicios) |
| @nestjs/core  | ^11.0     | Core del framework                      |
| @nestjs/common| ^11.0     | Decoradores, guards, pipes, interceptors |
| @nestjs/platform-express | ^11.0 | Adaptador Express                    |
| @nestjs/terminus | ^11.0  | Healthchecks                            |
| TypeScript    | ^5.7      | Lenguaje                                |
| Jest          | ^30.0     | Tests unitarios                         |
| Supertest     | ^7.0      | Tests HTTP end-to-end                   |
| ESLint        | ^9.18     | Linting                                 |
| Prettier      | ^3.4      | Formateo                                |

## Despliegue — Paso a Paso

### En Desarrollo (con Docker Compose)

```bash
# 1. Desde la raíz del proyecto, genera los secretos y construye imágenes
make init

# 2. Levanta todo el stack (postgres, redis, api, middleware, frontend)
make up

# 3. Verifica que la API esté saludable
curl http://localhost:3000/
```

El contenedor usa el stage `development` del Dockerfile. NestJS arranca con `nest start --watch`, que compila TypeScript al vuelo y reinicia automáticamente ante cualquier cambio. El código fuente se monta como volumen `./api:/app` (delegated), por lo que los cambios locales se reflejan al instante.

### En Desarrollo Local (sin Docker, solo Node)

```bash
cd api
npm install
npm run start:dev    # Compila y escucha cambios
```

### En Producción

El stage `production` del Dockerfile genera una imagen optimizada:

```bash
# Construir imagen de producción
docker build --target production -t bolo-api:latest .

# O desde la raíz del proyecto:
docker compose build api
```

La imagen de producción:
- Usa `node:24.17-alpine` como base
- Solo instala dependencias de producción (`npm ci --omit=dev`)
- Copia el `dist/` compilado desde el stage `build`
- Corre como usuario no privilegiado `bolo:bolo`
- Usa `dumb-init` como PID 1 (manejo correcto de señales)

## Variables de Entorno

| Variable             | Requerida | Default | Descripción                                  |
|----------------------|-----------|---------|----------------------------------------------|
| DB_HOST              | Sí        | —       | Host de PostgreSQL (nombre del servicio Docker) |
| DB_PORT              | Sí        | —       | Puerto PostgreSQL (5432)                     |
| DB_NAME              | Sí        | —       | Nombre de la base de datos (`POSTGRES_DB`)   |
| DB_USER              | Sí        | —       | Usuario de BD (`POSTGRES_USER`)              |
| DB_PASSWORD_FILE     | Sí        | —       | Ruta al secret con la contraseña de BD       |
| REDIS_HOST           | Sí        | —       | Host de Redis                                |
| REDIS_PORT           | Sí        | —       | Puerto Redis (6379)                          |
| REDIS_PASSWORD_FILE  | Sí        | —       | Ruta al secret con la contraseña de Redis    |
| JWT_SECRET_FILE      | Sí        | —       | Ruta al secret JWT                           |
| QR_HMAC_SECRET_FILE  | Sí        | —       | Ruta al secret HMAC para códigos QR          |
| NODE_ENV             | No        | development | Entorno de ejecución                     |
| PORT                 | No        | 3000    | Puerto interno del contenedor                |

## Dependencias entre Servicios

```
postgres (healthy) ──→ api ──→ middleware (healthy) ──→ frontend
redis (healthy)    ──→ api
                    ──→ middleware
```

La API **no se inicia** hasta que PostgreSQL y Redis estén saludables (ver `depends_on` en el compose).

## Redes

| Red       | Tipo      | Acceso                           |
|-----------|-----------|----------------------------------|
| `db_net`  | internal  | API ↔ PostgreSQL                 |
| `cache_net` | internal | API ↔ Redis                     |
| `api_net` | internal  | Middleware → API (proxy reverso) |

La API **nunca** está en `public_net`. No recibe tráfico directo del exterior.

## Healthcheck

```yaml
test: ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"]
interval: 10s
timeout: 5s
retries: 5
start_period: 30s
```

## Comandos Útiles (dentro del contenedor)

```bash
npm run build          # Compila TypeScript a dist/
npm run start          # Inicia la aplicación compilada
npm run start:dev      # Desarrollo con live-reload
npm run start:prod     # node dist/main (producción local)
npm run test           # Tests unitarios (Jest)
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Tests con cobertura
npm run lint           # ESLint + fix automático
npm run format         # Prettier
```

## Notas de Seguridad

- En producción, el puerto 3000 **no se expone al host**. Solo está visible internamente mediante `expose` en el compose.
- Las contraseñas se leen desde archivos montados como Docker Secrets (`/run/secrets/`), nunca desde variables de entorno.
- La conexión a PostgreSQL usa solo redes internas de Docker (`db_net`), sin exposición a internet.
- El usuario del contenedor es `bolo:bolo` sin privilegios.
- `dumb-init` asegura que las señales (SIGTERM, SIGINT) se propaguen correctamente a NestJS.

## Scripts de package.json

| Script          | Comando                      |
|-----------------|------------------------------|
| build           | `nest build`                 |
| format          | `prettier --write "src/**/*.ts" "test/**/*.ts"` |
| start           | `nest start`                 |
| start:dev       | `nest start --watch`         |
| start:debug     | `nest start --debug --watch` |
| start:prod      | `node dist/main`             |
| lint            | `eslint "{src,apps,libs,test}/**/*.ts" --fix` |
| test            | `jest`                       |
| test:watch      | `jest --watch`               |
| test:cov        | `jest --coverage`            |
| test:e2e        | `jest --config ./test/jest-e2e.json` |
