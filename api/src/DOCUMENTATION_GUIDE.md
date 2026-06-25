# Guía de Documentación — BOLO API

> Índice centralizado de toda la documentación del proyecto.

---

## 📋 Archivos de Documentación

| Archivo                    | Descripción                                                                                   | Ubicación                         |
| -------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------- |
| **README.md**              | README principal del proyecto. Stack, endpoints, esquemas BD, scripts.                        | `/api/README.md`                  |
| **PROYECTO.md**            | Documentación técnica detallada. Arquitectura, estructura, módulos, BD.                       | `/api/PROYECTO.md`                |
| **DOCUMENTACION.md**       | Documentación exhaustiva por archivo (~120 archivos). Explica qué hace cada bloque y por qué. | `/api/DOCUMENTACION.md`           |
| **ANALISIS.md**            | Análisis completo del código fuente. Hallazgos, inconsistencias, patrones, recomendaciones.   | `/api/ANALISIS.md`                |
| **DOCUMENTATION_GUIDE.md** | **← Este archivo.** Guía de navegación de la documentación.                                   | `/api/src/DOCUMENTATION_GUIDE.md` |

---

## 🏗️ Arquitectura

**Arquitectura Hexagonal (Puertos y Adaptadores)** con NestJS 11 sobre Node.js 24.

```
┌──────────────────────────────────────────┐
│           Interfaces                      │
│  (Controladores REST, DTOs validación,    │
│   Middleware, Guards, Decorators)         │
├──────────────────────────────────────────┤
│           Application                     │
│  (Casos de uso, DTOs internos,           │
│   Servicios de aplicación)               │
├──────────────────────────────────────────┤
│           Domain                          │
│  (Entidades puras, Puertos/Interfaces,   │
│   Value Objects, Excepciones)            │
├──────────────────────────────────────────┤
│           Infrastructure                  │
│  (ORM entities, Repositorios TypeORM,    │
│   JWT Strategy, Servicios externos)      │
└──────────────────────────────────────────┘
```

### Flujo de Solicitud

```
HTTP → Controller → DTO (validate) → UseCase → Port → RepositoryImpl → PostgreSQL
```

### Patrón de Inyección

Cada puerto se declara como un **token string** (ej: `USER_REPOSITORY_PORT`) y se vincula a su implementación en el módulo de infraestructura. Esto permite cambiar implementaciones sin modificar el dominio ni los casos de uso.

---

## 🗺️ Mapa de Módulos

| Módulo   | Estado         | Descripción                                                                                                                                                                                   |
| -------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared` | ✅ Completo    | Código común: entidad base, puertos (ICache, ILogger), CryptoService, config TypeORM, logger Winston, cliente Redis, decoradores, filtro global, middleware logging                           |
| `auth`   | ✅ Completo    | Autenticación y usuarios. 35 archivos, 10 spec files. Register, login JWT con clave por usuario, roles.                                                                                       |
| `fin`    | 🔄 En progreso | Billetera digital, tarifas, transacciones. Dominio completo (5 entidades), 2 use cases funcionales (CreateWallet, CreateCoopFare). Pendientes: Deposit, Withdraw, ProcessPayment, GetBalance. |
| `ops`    | 🔄 En progreso | Operaciones: rutas, vehículos, asignaciones. Route entity + CreateRouteUseCase funcionales. Pendientes: Vehicle, AssignedRoute.                                                               |
| `trip`   | ⏳ Pendiente   | Viajes, tracking GPS, pagos. Solo stub con planeación.                                                                                                                                        |
| `audit`  | ⏳ Pendiente   | Logs inmutables de auditoría. Solo stub con planeación.                                                                                                                                       |

### Detalle por Módulo

#### `shared` — Capa Transversal ✅

- `domain/`: BaseEntity, excepciones (NotFoundException, UnauthorizedException), IBaseRepository, value objects (stubs)
- `application/`: CryptoService (bcrypt), puertos ICache e ILogger
- `infrastructure/`: typeorm.config.ts, Winston logger, Redis singleton
- `interfaces/`: decoradores @CurrentUser, @Roles; filtro global de excepciones; middleware de logging HTTP

#### `auth` — Autenticación ✅

- **Entidades:** User, Association, DriverRequest
- **Casos de uso:** CreateUserUseCase, LoginUseCase
- **JWT personalizado:** Cada usuario tiene su propia clave de firma (jwtKey), rotada en cada login
- **Endpoints:** POST /auth/register, POST /auth/login, GET /auth/profile
- **Placeholders:** GET /users/:id, GET /associations/:id, POST /associations

#### `fin` — Financiero 🔄

- **Entidades de dominio:** Wallet, Transaction, ExchangeRate, CoopFare, SagaState (✅ 5 completas)
- **Value Object:** Money (inmutable, centavos enteros)
- **Casos de uso implementados:** CreateWalletUseCase, CreateCoopFareUseCase
- **Casos de uso pendientes:** DepositUseCase, WithdrawUseCase, ProcessPaymentUseCase, GetBalanceUseCase (archivos vacíos)
- **ORM:** 3 entidades registradas en FinModule (Wallet, CoopFare, ExchangeRate)
- **Controladores funcionales:** WalletController (POST /fin/wallets), CoopFareController (POST /fin/coop-fares)
- **Controlador pendiente:** TransactionController (stub vacío)

#### `ops` — Operaciones 🔄

- **Entidades:** Route (✅ implementada)
- **Casos de uso:** CreateRouteUseCase, CreateAssociationUseCase
- **Controladores:** RouteController (POST /ops/routes), OpsAssociationController (POST /ops/associations)
- **Pendiente:** Vehicle entity, AssignedRoute entity, CRUDs completos

#### `trip` — Viajes ⏳

- Planeado: entidades Trip, TripPayment, GpsHistory
- Tracking GPS con PostGIS, WebSockets en tiempo real
- Cálculo de tarifa dinámica según cooperativa y categoría

#### `audit` — Auditoría ⏳

- Planeado: entidad AuditEntry, triggers BD INSERT-only
- Log inmutable de acciones críticas
- Consulta de historial por entidad con paginación

---

## 🛠️ Stack Tecnológico

| Componente      | Versión        | Propósito                   |
| --------------- | -------------- | --------------------------- |
| Node.js         | 24 Alpine      | Runtime                     |
| NestJS          | ^11.0          | Framework backend           |
| TypeScript      | ^5.7           | Lenguaje                    |
| TypeORM         | ^1.0           | ORM PostgreSQL              |
| PostgreSQL      | 18 + PostGIS 3 | BD relacional + geoespacial |
| Redis           | 7 Alpine       | Caché / sesiones            |
| passport-jwt    | ^4.0           | Autenticación JWT           |
| bcrypt          | ^6.0           | Hashing de contraseñas      |
| class-validator | ^0.15          | Validación DTOs             |
| Winston         | ^3.19          | Logging estructurado        |
| ioredis         | ^5.11          | Cliente Redis               |
| Jest            | ^30.0          | Tests                       |

---

## 🧪 Cómo Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests end-to-end
npm run test:e2e

# Ejecutar un archivo específico
npx jest src/modules/auth/application/use-cases/create-user.use-case.spec.ts
```

### Cobertura Actual

| Módulo | Spec files | Estado                                         |
| ------ | ---------- | ---------------------------------------------- |
| auth   | 10         | ✅ Buena cobertura                             |
| fin    | 5          | ⚠️ Baja (solo create-wallet, create-coop-fare) |
| shared | 1          | ⚠️ Mínima (solo crypto.service)                |
| e2e    | 1          | ⚠️ Mínima (solo GET /)                         |

---

## 🚀 Desarrollo

### Requisitos

- Node.js 24+
- PostgreSQL 18+ con PostGIS 3
- Redis 7+

### Setup Local

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Configurar variables de entorno
cp src/.env.example src/.env  # o crear manualmente

# 3. Iniciar en desarrollo
npm run start:dev

# 4. Verificar healthcheck
curl http://localhost:3000/health
```

### Variables de Entorno Clave

| Variable    | Default       | Descripción       |
| ----------- | ------------- | ----------------- |
| DB_HOST     | localhost     | Host PostgreSQL   |
| DB_PORT     | 5432          | Puerto PostgreSQL |
| DB_NAME     | bolo          | Nombre BD         |
| DB_USER     | postgres      | Usuario BD        |
| DB_PASSWORD | (vacío)       | Contraseña BD     |
| JWT_SECRET  | defaultSecret | Secreto JWT       |
| REDIS_HOST  | localhost     | Host Redis        |
| REDIS_PORT  | 6379          | Puerto Redis      |

### Scripts Disponibles

```bash
npm run build          # Compilar TypeScript
npm run start          # Iniciar servidor
npm run start:dev      # Desarrollo con hot-reload
npm run start:prod     # Producción (node dist/main)
npm run test           # Tests unitarios
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Tests con cobertura
npm run lint           # ESLint
npm run format         # Prettier
```

---

## 📐 Esquemas de Base de Datos

| Schema  | Tablas                                                         | Módulo   |
| ------- | -------------------------------------------------------------- | -------- |
| `auth`  | users, associations, driver_requests                           | auth ✅  |
| `fin`   | wallets, transactions, exchange_rates, coop_fares, saga_states | fin 🔄   |
| `ops`   | routes, vehicles, assigned_routes                              | ops 🔄   |
| `trip`  | trips, payments, gps_history                                   | trip ⏳  |
| `audit` | audit_log                                                      | audit ⏳ |

---

## 🔗 Referencias Rápidas

- **Para entender la arquitectura:** `PROYECTO.md` sección 3
- **Para ver el estado de cada módulo:** `PROYECTO.md` sección 5-7
- **Para documentación por archivo:** `DOCUMENTACION.md`
- **Para análisis de código y hallazgos:** `ANALISIS.md`
- **Para comenzar a desarrollar:** Esta guía, sección "Desarrollo"
- **Para endpoints disponibles:** `README.md` tabla de endpoints
