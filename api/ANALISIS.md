# ANÁLISIS COMPLETO — BOLO API

> Documento generado por el Analista Comentador.
> Basado en la revisión exhaustiva de todos los archivos fuente (`src/`),
> archivos de documentación (`PROYECTO.md`, `DOCUMENTACION.md`, `README.md`),
> configuración y tests.

---

## 1. RESUMEN DEL PROYECTO

**BOLO API** es el backend monolítico modular de una plataforma de transporte de pasajeros con:
- Billetera digital y pagos
- Tracking GPS en tiempo real
- Gestión de cooperativas y conductores
- Tarifas dinámicas por cooperativa

### Stack Tecnológico

| Componente | Versión | Propósito |
|---|---|---|
| Node.js | 24 Alpine | Runtime |
| NestJS | ^11.0 | Framework backend (DI, módulos, guards) |
| TypeScript | ^5.7 | Lenguaje |
| TypeORM | ^1.0 | ORM PostgreSQL |
| PostgreSQL | 18 + PostGIS 3 | BD relacional + geoespacial |
| Redis | 7 Alpine | Caché / sesiones / rate-limiting |
| passport-jwt | ^4.0 | Autenticación JWT |
| bcrypt | ^6.0 | Hashing de contraseñas |
| class-validator | ^0.15 | Validación de DTOs |
| Winston | ^3.19 | Logging estructurado |
| ioredis | ^5.11 | Cliente Redis |
| Jest | ^30.0 | Tests unitarios y e2e |

---

## 2. ARQUITECTURA — ARQUITECTURA HEXAGONAL (PUERTOS Y ADAPTADORES)

### 2.1 Capas por Módulo

```
┌──────────────────────────────────────────┐
│           Interfaces                      │
│  (Controladores REST, DTOs de validación, │
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

### 2.2 Flujo de Solicitud

```
HTTP → Controller → DTO (validate) → UseCase → Port (interface) → RepositoryImpl (TypeORM) → PostgreSQL
```

### 2.3 Patrón de Inyección

Cada puerto se declara como un **token string** (ej: `USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT'`) y se vincula a su implementación en el módulo de infraestructura:

```typescript
{ provide: USER_REPOSITORY_PORT, useClass: UserRepositoryImpl }
```

Esto permite cambiar implementaciones sin modificar el dominio ni los casos de uso.

---

## 3. ESTRUCTURA DEL PROYECTO (ARCHIVOS REALES)

```
api/
├── .env
├── .prettierrc
├── ANALISIS.md                    ← ESTE ARCHIVO
├── DOCUMENTACION.md               ← Documentación detallada por archivo (2352 líneas)
├── Dockerfile                     ← Multi-stage (dev / build / prod)
├── PROYECTO.md                    ← Documentación técnica del proyecto (297 líneas)
├── README.md                      ← README en inglés (96 líneas)
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── tsconfig.json / tsconfig.build.json
├── src/
│   ├── main.ts                    ← Bootstrap (31 líneas, con JSDoc)
│   ├── app.module.ts              ← Módulo raíz (51 líneas, con JSDoc)
│   ├── app.controller.ts          ← GET / (31 líneas, con JSDoc)
│   ├── app.controller.spec.ts     ← Test unitario
│   ├── app.service.ts             ← Servicio raíz (24 líneas, con JSDoc)
│   ├── health.controller.ts       ← GET /health (33 líneas, con JSDoc)
│   ├── health.controller.spec.ts  ← Test unitario con mocks manuales
│   ├── .env                       ← Variables de entorno locales
│   ├── shared/                    ← Código común transversal
│   │   ├── domain/
│   │   │   ├── base.entity.ts                ← Clase abstracta (32 líneas)
│   │   │   ├── exceptions/                   ← NotFoundException, UnauthorizedException
│   │   │   ├── interfaces/                   ← IBaseRepository<T>
│   │   │   └── value-objects/               ← Email, Money, Phone (stubs TODO)
│   │   ├── application/
│   │   │   ├── ports/                        ← ICache, ILogger
│   │   │   └── services/crypto.service.ts   ← bcrypt hash/compare
│   │   ├── infrastructure/
│   │   │   ├── database/typeorm.config.ts   ← Config PostgreSQL (81 líneas)
│   │   │   ├── logger/winston.logger.ts     ← Winston (80 líneas)
│   │   │   └── redis/redis.client.ts        ← ioredis singleton (48 líneas)
│   │   └── interfaces/
│   │       ├── middleware/logging.middleware.ts
│   │       ├── filters/all-exceptions.filter.ts
│   │       └── decorators/                  ← @CurrentUser, @Roles
│   └── modules/
│       ├── auth/               ← ✅ COMPLETO (35 archivos)
│       │   ├── domain/entities/             ← User, Association, DriverRequest
│       │   ├── domain/exceptions/           ← InvalidCredentials, UserAlreadyExists, UserNotFound
│       │   ├── domain/interfaces/           ← 3 repos + 2 services ports
│       │   ├── application/use-cases/       ← CreateUserUseCase, LoginUseCase
│       │   ├── application/dto/             ← CreateUserDto, LoginDto (logint.dto.ts typo)
│       │   ├── interfaces/rest/             ← AuthController, UserController, AssociationController
│       │   ├── interfaces/dto/              ← RegisterDto, LoginDto, UserResponseDto
│       │   ├── infrastructure/orm/          ← UserOrmEntity, AssociationOrmEntity, DriverRequestOrmEntity
│       │   ├── infrastructure/persistence/  ← 3 repos TypeORM
│       │   ├── infrastructure/auth/         ← JwtStrategy, JwtAuthGuard
│       │   ├── infrastructure/services/     ← NotificationServiceImpl (stub)
│       │   └── infrastructure/auth.module.ts ← Composición DI (190 líneas)
│       ├── fin/               ← ✅ COMPLETO (46 archivos)
│       │   ├── domain/entities/             ← Wallet, Transaction, ExchangeRate, CoopFare, SagaState
│       │   ├── domain/value-objects/        ← Money (95 líneas, completo)
│       │   ├── domain/exceptions/           ← InsufficientBalance, WalletNotFound, TransactionFailed
│       │   ├── domain/interfaces/           ← 5 repos + 1 service port
│       │   ├── application/use-cases/       ← CreateWalletUseCase (deposit, withdraw, payment, balance son stubs)
│       │   ├── application/dto/             ← CreateWalletDto, TransactionDto, BalanceResponseDto
│       │   ├── application/services/        ← (vació — WalletServiceImpl está en infra)
│       │   ├── interfaces/rest/             ← WalletController, TransactionController (stub)
│       │   ├── interfaces/dto/              ← DepositDto, TransferDto (sin validación)
│       │   ├── infrastructure/orm/          ← 5 ORM entities
│       │   ├── infrastructure/persistence/  ← 5 repos TypeORM
│       │   ├── infrastructure/services/     ← WalletServiceImpl (13 líneas)
│       │   └── infrastructure/fin.module.ts ← Composición DI (26 líneas)
│       ├── audit/             ← ❌ STUB (archivo único con TODO)
│       ├── ops/               ← ❌ STUB (archivo único con TODO)
│       └── trip/              ← ❌ STUB (archivo único con TODO)
└── test/
    ├── app.e2e-spec.ts
    └── jest-e2e.json
```

---

## 4. ANÁLISIS DETALLADO POR ARCHIVO

### 4.1 Punto de Entrada — `src/main.ts`

**Líneas:** 31
**Propósito:** Bootstrap de la aplicación NestJS
**Patrón:** Carga `dotenv` ANTES de `NestFactory.create()` para que las variables de entorno estén disponibles durante la inicialización del contenedor IoC.
**Documentación:** El archivo tiene JSDoc completo (20 líneas de comentario + código).

### 4.2 Módulo Raíz — `src/app.module.ts`

**Líneas:** 51
**Patrón:** Módulo NestJS que importa `ConfigModule`, `TypeOrmModule`, `AuthModule` y `FinModule`.
**Hallazgos importantes:**
- ✅ `FinModule` ya está importado y activo (la documentación en `PROYECTO.md` lo marca como pendiente)
- ❌ `TripModule`, `AuditModule` siguen comentados (correcto)
- ❌ Las entidades ORM en `typeorm.config.ts` ahora incluyen `WalletOrmEntity` (no estaba en la documentación original)

### 4.3 Shared — Capa Transversal

#### `src/shared/domain/base.entity.ts`
- **Estado:** Stub con campos `id`, `createdAt`, `updatedAt`
- **Inconsistencia:** Ninguna entidad de dominio extiende `BaseEntity`. Las entidades actuales (User, Association, etc.) implementan sus propios campos directamente. `BaseEntity` es un esqueleto no utilizado.

#### Value Objects en shared (`email.vo.ts`, `money.vo.ts`, `phone.vo.ts`)
- **Estado:** Los 3 son TODOs sin implementación. Solo comentarios.
- **Nota:** El módulo `fin` tiene su propio `Money` value object completo en `fin/domain/value-objects/money.vo.ts`. El de `shared` es un placeholder redundante.

#### `src/shared/domain/exceptions/`
- `NotFoundException` y `UnauthorizedException` extienden `Error` (dominio puro, sin dependencia de NestJS)
- **Contraste con auth:** Las excepciones en `auth/domain/exceptions/` extienden `HttpException` de NestJS, no `Error`. Esto es una inconsistencia arquitectónica: unas son dominio puro, otras tienen dependencia de framework.

#### `src/shared/application/services/crypto.service.ts`
- **Estado:** Funcional. Usa bcrypt con costo 10.
- **Nota:** Está ubicado en `shared/application/services` (capa de aplicación), lo cual es correcto según la arquitectura.

#### `src/shared/infrastructure/database/typeorm.config.ts`
- **Líneas:** 81
- **Entidades registradas:** `UserOrmEntity`, `AssociationOrmEntity`, `DriverRequestOrmEntity`, `WalletOrmEntity`
- **Nota:** `WalletOrmEntity` se importa desde `'src/modules/fin'` (path alias). Solo estas 4 entidades están registradas; las de `fin` (TransactionOrmEntity, etc.) NO están en la lista.

#### `src/shared/infrastructure/logger/winston.logger.ts`
- **Estado:** Funcional, implementa `ILogger`, escribe a consola + archivos.

#### `src/shared/infrastructure/redis/redis.client.ts`
- **Estado:** Singleton de ioredis. No implementa `ICache` directamente; expone la instancia de Redis.

#### `src/shared/interfaces/decorators/`
- `@CurrentUser`: Extrae `req.user` (funcional)
- `@Roles`: Asigna metadatos (funcional, pero no hay `RolesGuard` implementado)

### 4.4 Módulo Auth — Análisis Completo

#### 4.4.1 Visión General

| Archivos | Estado | Testing |
|---|---|---|
| 35 archivos | ✅ Completo | ✅ 10 spec files |

#### 4.4.2 Dominio — Entidades

| Entidad | Atributos | Método Factory |
|---|---|---|
| `User` | 18 readonly props | `User.create(data)` |
| `Association` | 9 readonly props | `Association.create(data)` |
| `DriverRequest` | 8 readonly props | `DriverRequest.create(data)` |

**Patrón:** Todas usan `readonly` + constructor público con todos los campos + `static create()` con defaults.

#### 4.4.3 Dominio — Puertos

| Puerto | Token | Métodos |
|---|---|---|
| `UserRepositoryPort` | `USER_REPOSITORY_PORT` | findById, findByPhone, save, updateJwtKey |
| `AssociationRepositoryPort` | `ASSOCIATION_REPOSITORY_PORT` | findById, findByRif, save |
| `DriverRequestRepositoryPort` | `DRIVER_REQUEST_REPOSITORY_PORT` | findById, findByDriverAndAssociation, save |
| `NotificationServicePort` | `NOTIFICATION_SERVICE_PORT` | sendEmail, sendSms |
| `WalletServicePort` | `WALLET_SERVICE_PORT` | createWallet |

**Patrón:** Token string + interfaz TypeScript. Todos los tokens son strings únicos.

#### 4.4.4 Dominio — Excepciones

| Excepción | Extiende | Código HTTP |
|---|---|---|
| `InvalidCredentialsException` | `UnauthorizedException` (NestJS) | 401 |
| `UserAlreadyExistsException` | `ConflictException` (NestJS) | 409 |
| `UserNotFoundException` | `NotFoundException` (NestJS) | 404 |

**Inconsistencia:** Estas excepciones extienden `HttpException` de NestJS, no las excepciones de dominio puras de `shared/domain/exceptions/`. Esto acopla el dominio a NestJS.

#### 4.4.5 Aplicación — Casos de Uso

| Caso de Uso | Dependencias | Flujo |
|---|---|---|
| `CreateUserUseCase` | UserRepo, CryptoService, WalletService (opt) | validate phone → hash → create → save → create wallet |
| `LoginUseCase` | UserRepo, CryptoService, JwtService | find → compare → check active → rotate key → sign token |

**Patrón:** `@Injectable()` + `@Inject(TOKEN)` para puertos + `@Optional()` para dependencias no esenciales.

#### 4.4.6 Infraestructura — ORM

| ORM Entity | Tabla | Esquema |
|---|---|---|
| `UserOrmEntity` | users | auth |
| `AssociationOrmEntity` | associations | auth |
| `DriverRequestOrmEntity` | driver_requests | auth |

**Patrón:** Decoradores TypeORM + snake_case en BD, camelCase en TS.

#### 4.4.7 Infraestructura — Repositorios

| Repositorio | Puerto | DI Token |
|---|---|---|
| `UserRepositoryImpl` | `UserRepositoryPort` | `USER_REPOSITORY_PORT` |
| `AssociationRepositoryImpl` | `AssociationRepositoryPort` | `ASSOCIATION_REPOSITORY_PORT` |
| `DriverRequestRepositoryImpl` | `DriverRequestRepositoryPort` | `DRIVER_REQUEST_REPOSITORY_PORT` |

**Patrón:** `@Injectable()` + `@InjectRepository()` + mappers `toDomain()` / `toOrm()` privados.

#### 4.4.8 Infraestructura — JWT

- `JwtStrategy`: Usa `secretOrKeyProvider` dinámico que busca clave por usuario. Clave única por sesión.
- `JwtAuthGuard`: `extends AuthGuard('jwt')` (delega en Passport).

#### 4.4.9 Interfaces — Controladores

| Controlador | Endpoints | Estado |
|---|---|---|
| `AuthController` | POST /auth/register, POST /auth/login, GET /auth/profile | ✅ Funcional |
| `UserController` | GET /users/:id | ⚠️ Placeholder (retorna mock) |
| `AssociationController` | GET /associations/:id, POST /associations | ⚠️ Placeholder |

**Patrón:** Controladores delgados que convierten DTOs de interfaz → DTOs de aplicación.

#### 4.4.10 Interfaces — DTOs

| DTO | Validación | Swagger |
|---|---|---|
| `RegisterDto` | ✅ class-validator completo | ✅ @ApiProperty |
| `LoginDto` | ✅ class-validator básico | ✅ @ApiProperty |
| `UserResponseDto` | ❌ Solo datos | ✅ @ApiProperty |

### 4.5 Módulo Fin — Análisis Completo

#### 4.5.1 Visión General

| Archivos | Estado | Testing |
|---|---|---|
| 46 archivos | ⚠️ Parcial (varios stubs) | ⚠️ Solo 4 spec files |

#### 4.5.2 Dominio — Entidades (✅ Completas)

| Entidad | Campos clave | Métodos |
|---|---|---|
| `Wallet` | balance, debtBalance, creditUsed, currency, version | `Wallet.create()` |
| `Transaction` | type (enum), amount, status, referenceId | `create()`, `complete()`, `fail()`, `reverse()` |
| `ExchangeRate` | fromCurrency, toCurrency, rate, validFrom/Until | `isEffective()`, `convert()` |
| `CoopFare` | baseFare, perKmRate, active | `calculateTripCost()`, `deactivate()` |
| `SagaState` | sagaId, step, status | `complete()`, `fail()`, `compensate()`, `compensated()` |

**Patrón consistente:** Todas inmutables (readonly), con método `static create()` factory y métodos que retornan nuevas instancias.

#### 4.5.3 Dominio — Value Objects (✅ Completo solo Money)

| VO | Estado | Operaciones |
|---|---|---|
| `Money` | ✅ Funcional | fromCents, fromDecimal, add, subtract, multiply, toDecimal, isZero, isNegative, isGreaterThanOrEqual |

#### 4.5.4 Dominio — Excepciones (✅ Completas)

| Excepción | Extiende | Campos extra |
|---|---|---|
| `InsufficientBalanceException` | `Error` | walletId, currentBalance, requiredAmount |
| `WalletNotFoundException` | `Error` | identifier |
| `TransactionFailedException` | `Error` | reason, transactionId |

**Nota:** Estas extienden `Error` (dominio puro), a diferencia de auth que extiende `HttpException`. Son consistentes con `shared/domain/exceptions/`.

#### 4.5.5 Aplicación — Casos de Uso (⚠️ Parcial)

| Caso de Uso | Estado |
|---|---|
| `CreateWalletUseCase` | ✅ Funcional (39 líneas) |
| `DepositUseCase` | ❌ STUB (archivo vacío, 1 línea) |
| `WithdrawUseCase` | ❌ STUB (archivo vacío, 1 línea) |
| `ProcessPaymentUseCase` | ❌ STUB (archivo vacío, 1 línea) |
| `GetBalanceUseCase` | ❌ STUB (archivo vacío, 1 línea) |

**Hallazgo crítico:** Solo `CreateWalletUseCase` está implementado. Los otros 4 son archivos vacíos. La documentación (`DOCUMENTACION.md`) los describe como implementados, pero en realidad no lo están.

#### 4.5.6 Infraestructura — ORM (✅ 5 entidades completas)

| ORM Entity | Tabla | Esquema |
|---|---|---|
| `WalletOrmEntity` | wallets | fin |
| `TransactionOrmEntity` | transactions | fin |
| `ExchangeRateOrmEntity` | exchange_rates | fin |
| `CoopFareOrmEntity` | coop_fares | fin |
| `SagaStateOrmEntity` | saga_states | fin |

#### 4.5.7 Infraestructura — Repositorios (✅ 5 implementaciones completas)

| Repositorio | Puerto |
|---|---|
| `WalletRepositoryImpl` | `WalletRepositoryPort` |
| `TransactionRepositoryImpl` | `TransactionRepositoryPort` |
| `ExchangeRateRepositoryImpl` | `ExchangeRateRepositoryPort` |
| `CoopFareRepositoryImpl` | `CoopFareRepositoryPort` |
| `SagaStateRepositoryImpl` | `SagaStateRepositoryPort` |

**Patrón:** Consistentes con auth — `@Injectable()`, `@InjectRepository()`, mappers toDomain/toOrm.

#### 4.5.8 Infraestructura — Servicio (⚠️ Parcial)

| Servicio | Puerto | Estado |
|---|---|---|
| `WalletServiceImpl` | `WalletServicePort` | ⚠️ Funcional (solo createWallet, 13 líneas) |

**Nota:** El `WalletServiceImpl` solo implementa `createWallet()`. Los demás métodos del puerto (`getBalance`, `deposit`, `withdraw`, `processPayment`, `getWallet`) no están implementados.

#### 4.5.9 Interfaces — Controladores (⚠️ Parcial)

| Controlador | Endpoints | Estado |
|---|---|---|
| `WalletController` | POST /fin/wallets | ✅ Funcional (19 líneas) |
| `TransactionController` | (ninguno) | ❌ STUB (archivo vacío, 7 líneas) |

#### 4.5.10 Interfaces — DTOs (⚠️ Sin validación)

| DTO | Estado | class-validator |
|---|---|---|
| `DepositDto` | ⚠️ Sin decoradores | ❌ |
| `TransferDto` | ⚠️ Sin decoradores | ❌ |

**Hallazgo:** La documentación en `PROYECTO.md` ya registra esto como pendiente: "Agregar decoradores class-validator a DepositDto y TransferDto".

#### 4.5.11 FinModule (⚠️ Parcial)

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([WalletOrmEntity])],
  providers: [
    { provide: WALLET_REPOSITORY_PORT, useClass: WalletRepositoryImpl },
    { provide: WALLET_SERVICE_PORT, useClass: WalletServiceImpl },
    CreateWalletUseCase,
  ],
  exports: [WALLET_SERVICE_PORT],
})
```

**Hallazgo:** FinModule solo registra `WalletOrmEntity`, `WalletRepositoryImpl`, `WalletServiceImpl` y `CreateWalletUseCase`. Las otras 4 entidades ORM (Transaction, ExchangeRate, CoopFare, SagaState) y sus repositorios NO están registrados en el módulo. Esto es porque el módulo está en construcción.

### 4.6 Módulos Stub

| Módulo | Archivo | Funcionalidad planeada |
|---|---|---|
| `audit` | `index.ts` (38 líneas TODO) | Log inmutable de acciones críticas con triggers BD |
| `ops` | `index.ts` (34 líneas TODO) | CRUD de rutas, vehículos, asignaciones |
| `trip` | `index.ts` (40 líneas TODO) | Viajes, pagos, tracking GPS con WebSockets |

---

## 5. ANÁLISIS DE DOCUMENTACIÓN EXISTENTE

### 5.1 `PROYECTO.md` (297 líneas)

**Aciertos:**
- Excelente overview del stack y arquitectura
- Diagrama de capas hexagonal claro
- Tablas de endpoints y estado de implementación
- Detalle de esquemas de BD

**Desactualizaciones:**
- Dice "FinModule: ⚠️ PARCIAL → ✅ COMPLETO" pero en realidad varios archivos son stubs vacíos
- Dice "WalletServiceImpl real reemplazó mock" — verdad, pero solo implementa createWallet
- Menciona que DepositDto/TransferDto necesitan decoradores (✅ correcto, sigue pendiente)
- No menciona que FinModule ya está importado en `app.module.ts`

### 5.2 `DOCUMENTACION.md` (2352 líneas)

**Aciertos:**
- Documentación exhaustiva por archivo (∼108 archivos documentados)
- Explica el "por qué" de cada decisión técnica
- Captura typos y deudas técnicas (ej: logint.dto.ts)

**Desactualizaciones:**
- Describe `DepositUseCase`, `WithdrawUseCase`, `ProcessPaymentUseCase`, `GetBalanceUseCase` como implementados con código, pero los archivos reales están vacíos
- Describe `TransactionController` con endpoints deposit y transfer, pero el archivo está vacío
- Describe wallet.service.impl.ts con delegación a múltiples casos de uso, pero el archivo real solo tiene createWallet
- Menciona 108 archivos documentados pero el código real tiene más archivos

### 5.3 `README.md` (96 líneas)

**Aciertos:**
- README funcional con stack, endpoints, esquemas y scripts

**Desactualizaciones:**
- Dice fin "⚠️ Wallet entity + ORM (falta servicio real)" — ya hay WalletServiceImpl (parcial)
- Faltan endpoints de fin (/fin/wallets) en la tabla

---

## 6. INCONSISTENCIAS Y HALLAZGOS

### 6.1 Código vs Documentación

| # | Hallazgo | Severidad |
|---|---|---|
| 1 | `DepositUseCase`, `WithdrawUseCase`, `ProcessPaymentUseCase`, `GetBalanceUseCase` son archivos VACÍOS pero la documentación los describe como implementados | 🔴 Alta |
| 2 | `TransactionController` está vacío (sin endpoints) pero `DOCUMENTACION.md` describe deposit y transfer | 🔴 Alta |
| 3 | `WalletServiceImpl` solo implementa `createWallet()`, no los demás métodos del puerto | 🟡 Media |
| 4 | `FinModule` no registra las otras 4 entidades ORM ni sus repositorios | 🟡 Media |
| 5 | `typeorm.config.ts` no lista todas las entidades de `fin` (solo WalletOrmEntity) | 🟡 Media |

### 6.2 Inconsistencias Arquitectónicas

| # | Hallazgo | Severidad |
|---|---|---|
| 1 | Excepciones de auth extienden `HttpException` (NestJS), mientras que las de fin extienden `Error`. Inconsistencia en pureza del dominio | 🟡 Media |
| 2 | `BaseEntity` en `shared` no es usado por ninguna entidad de dominio | 🟢 Baja |
| 3 | Value Objects de `shared` son TODOs mientras `fin` tiene su propio Money completo. Hay duplicación conceptual | 🟢 Baja |
| 4 | `NotificationServiceImpl` tiene método `sendPushNotification` que no está en el puerto `NotificationServicePort` | 🟢 Baja |
| 5 | `CreateWalletUseCase` lanza `Error` genérico si la wallet ya existe, en lugar de una excepción de dominio específica | 🟢 Baja |

### 6.3 Deudas Técnicas

| # | Hallazgo | Severidad |
|---|---|---|
| 1 | `logint.dto.ts` — typo histórico en nombre de archivo (debería ser `login.dto.ts`) | 🟢 Baja |
| 2 | `UserController` y `AssociationController` son placeholders con `CreateUserUseCase` inyectado pero no usado | 🟢 Baja |
| 3 | No hay `RolesGuard` implementado para el decorador `@Roles()` | 🟢 Baja |
| 4 | `DepositDto` y `TransferDto` sin decoradores class-validator | 🟡 Media |
| 5 | Las excepciones de dominio de fin no son capturadas por el filtro global (extienden `Error`, no `HttpException`) | 🟡 Media |

### 6.4 Cobertura de Tests

| Módulo | Spec files | Cobertura |
|---|---|---|
| auth | 10 | ✅ Buena (use cases, repos, controllers, DTOs, strategy) |
| fin | 4 | ⚠️ Baja (solo create-wallet use case, create-wallet dto, wallet repo, wallet service) |
| shared | 1 | ⚠️ Mínima (solo crypto.service) |
| e2e | 1 | ⚠️ Mínima (solo GET /) |

---

## 7. PATRONES ENCONTRADOS

### 7.1 Patrón de Documentación de Código

Todos los archivos siguen un patrón JSDoc consistente:

```typescript
// src/ruta/relativa/archivo.ts — Ruta relativa desde src/
/**
 * ════════════════════════════════════════════
 * NombreDeClase — Descripción
 * ════════════════════════════════════════════
 *
 * Descripción detallada de qué hace y por qué.
 *
 * Capa: [Capa] ([módulo])
 * Dependencias:
 *   - [Dependencia1]: [descripción]
 *
 * @module NombreDeClase
 * @see OtraClaseRelacionada
 */
```

### 7.2 Patrón de Entidad de Dominio

```typescript
export class Entidad {
  constructor(
    public readonly id: string,
    // ... readonly fields
  ) {}

  static create(data: Omit<Entidad, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Entidad {
    return new Entidad(
      data.id ?? crypto.randomUUID(),
      // ... con defaults
    );
  }
}
```

### 7.3 Patrón de Puerto (Port)

```typescript
export const REPO_PORT = 'RepoPort';

export interface RepoPort {
  findById(id: string): Promise<Entity | null>;
  save(entity: Entity): Promise<Entity>;
}
```

### 7.4 Patrón de Repositorio TypeORM

```typescript
@Injectable()
export class RepoImpl implements RepoPort {
  constructor(
    @InjectRepository(OrmEntity)
    private readonly repo: Repository<OrmEntity>,
  ) {}

  async save(entity: Entity): Promise<Entity> {
    const orm = this.toOrm(entity);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: OrmEntity): Entity { /* mapper */ }
  private toOrm(domain: Entity): OrmEntity { /* mapper */ }
}
```

### 7.5 Patrón de DTOs

- **DTOs de interfaz** (`interfaces/dto/`): Tienen decoradores `@ApiProperty` + `@IsString`, `@IsEmail`, etc.
- **DTOs de aplicación** (`application/dto/`): Planos, sin decoradores. Usados internamente entre controlador y caso de uso.

---

## 8. RECOMENDACIONES

### 8.1 Prioridad Alta

1. **Implementar casos de uso faltantes de fin:** DepositUseCase, WithdrawUseCase, ProcessPaymentUseCase, GetBalanceUseCase
2. **Implementar TransactionController** con endpoints deposit y transfer
3. **Completar WalletServiceImpl** con los métodos faltantes del puerto
4. **Agregar las 4 entidades ORM restantes y sus repositorios a FinModule**
5. **Actualizar DOCUMENTACION.md** para reflejar el estado real del código

### 8.2 Prioridad Media

6. **Unificar excepciones de dominio:** Decidir si todas extienden `Error` (dominio puro) o `HttpException` (conveniencia NestJS)
7. **Agregar decoradores class-validator** a DepositDto y TransferDto
8. **Registrar todas las entidades fin en typeorm.config.ts**
9. **Escribir tests para los casos de uso de fin**
10. **Implementar RolesGuard** para el decorador @Roles

### 8.3 Prioridad Baja

11. **Renombrar logint.dto.ts → login.dto.ts**
12. **Implementar value objects de shared** o eliminarlos si están duplicados con fin
13. **Refactorizar UserController y AssociationController** para que usen sus casos de uso
14. **Extender BaseEntity** a las entidades de dominio o eliminarla

---

## 9. ESTADÍSTICAS DEL PROYECTO

| Métrica | Valor |
|---|---|
| Archivos totales en `src/` | 111 |
| Archivos de código fuente | ∼85 |
| Archivos de test (`*.spec.ts`) | ∼18 |
| Archivos de documentación | 3 (PROYECTO.md, DOCUMENTACION.md, README.md) |
| Archivos de configuración | 7 |
| Archivos stub (vacíos/TODO) | ∼8 |
| Líneas en DOCUMENTACION.md | 2,352 |
| Líneas totales de código (est.) | ∼6,000 |
| Módulos completos | 2 de 5 (auth, fin paricial) |
| Módulos stub | 3 (audit, ops, trip) |

---

## 10. CONCLUSIÓN

La API BOLO es un proyecto NestJS bien estructurado que sigue **Arquitectura Hexagonal (Puertos y Adaptadores)** con una separación clara de capas. Los módulos `auth` y `shared` están completos y funcionales con buena cobertura de tests.

El módulo `fin` tiene una base sólida (entidades de dominio, value objects, puertos, ORM entities, repositorios) pero los casos de uso y controladores están mayormente vacíos. La documentación existente (`DOCUMENTACION.md`) describe un estado más avanzado del que realmente tiene el código.

Los módulos `audit`, `ops` y `trip` son stubs con planeación detallada en comentarios TODO.

La documentación en el código fuente (JSDoc) es excelente: cada archivo tiene un bloque documentando su propósito, capa, dependencias y notas técnicas. Esto facilita enormemente el mantenimiento y la incorporación de nuevos desarrolladores.

---

## 11. COMENTARIOS DETALLADOS — MÓDULO FIN (46 ARCHIVOS)

> Cada bloque explica **qué hace** y **por qué** fue diseñado así, siguiendo los patrones del código existente sin modificar ningún archivo.

---

### 11.1 Barrel Principal — `src/modules/fin/index.ts`

**Propósito:** Punto de entrada público del módulo financiero. Re-exporta todo desde las 4 subcarpetas (domain, application, infrastructure, interfaces) para que `app.module.ts` pueda importar `FinModule` con un solo path.

**Comentario:** El JSDoc declara 21 checkboxes marcados como ✅, pero esto NO refleja el estado real del código. Varios ítems (deposit, withdraw, process-payment, get-balance use-cases, TransactionController) están vacíos o son stubs. El barrel `export *` funciona correctamente pero da una falsa impresión de completitud.

**Línea 26:** `export * from './domain'` re-exporta entidades, puertos, excepciones y value objects de dominio.
**Línea 27:** `export * from './application'` re-exporta casos de uso y DTOs de aplicación.
**Línea 28:** `export * from './infrastructure'` re-exporta ORM, repositorios y FinModule.
**Línea 29:** `export * from './interfaces'` re-exporta controladores REST y DTOs de interfaz.

---

### 11.2 Capa de Dominio — Entidades

#### 11.2.1 `src/modules/fin/domain/index.ts`

Barrel de dominio. Re-exporta entidades, interfaces (puertos), excepciones y value objects.

---

#### 11.2.2 `src/modules/fin/domain/entities/index.ts`

Barrel de entidades. Exporta Wallet, Transaction (con TransactionType/TransactionStatus), ExchangeRate, CoopFare, SagaState (con SagaStatus/SagaStep).

**Patrón:** Cada export incluye la clase principal más sus enumeraciones asociadas.

---

#### 11.2.3 `src/modules/fin/domain/entities/wallet.entity.ts` (81 líneas)

**Qué hace:** Entidad de dominio Wallet — representa la billetera digital de un usuario.

**Bloques:**

- **Líneas 31-63 (constructor):** 11 campos readonly que modelan el estado de una billetera:
  - `id` (UUID): Identificador único, generado en el dominio.
  - `userId` (UUID): Relación 1:1 con usuarios.
  - `balance` (number): Saldo disponible en centavos. Se usa BIGINT en BD para evitar errores de redondeo por punto flotante (IEEE 754). Toda conversión a decimal ocurre solo en presentación.
  - `debtBalance` (number): Crédito de emergencia usado, también en centavos. Mecanismo para que usuarios sin saldo puedan completar un viaje (uso único).
  - `creditUsed` (boolean): Flag de uso único del crédito de emergencia. Se resetea administrativamente.
  - `currency` (string): Código ISO 4217 (USD, VED).
  - `lastTransactionAt` (Date | null): Última transacción. Null si nunca transó. Útil para auditoría y cargos por inactividad.
  - `version` (number): Control de concurrencia optimista (OCC). Previene condiciones de carrera sin locks pesados en BD.
  - `createdAt` / `updatedAt`: Timestamps de creación/modificación.

- **Líneas 67-80 (método estático `create`):** Factory method que crea una wallet con valores iniciales consistentes. Usa `crypto.randomUUID()` (UUID v4) para el ID. Parámetros con default: `currency = 'USD'`.

**Por qué:** El constructor público con readonly permite crear instancias válidas desde los repositorios (método `toDomain`). El método `create` encapsula la inicialización del agregado, garantizando que todos los valores de negocio tengan defaults correctos (balance=0, sin deuda, versión=1).

---

#### 11.2.4 `src/modules/fin/domain/entities/transaction.entity.ts` (150 líneas)

**Qué hace:** Entidad de dominio Transaction — representa una operación financiera sobre una wallet. Es inmutable: los cambios de estado (complete, fail, reverse) retornan una nueva instancia.

**Bloques:**

- **Líneas 28-34 (`TransactionType` enum):** DEPOSIT (ingreso), WITHDRAWAL (retiro), PAYMENT (pago), REFUND (devolución), FEE (comisión).

- **Líneas 36-41 (`TransactionStatus` enum):** PENDING → COMPLETED | FAILED → REVERSED. Ciclo de vida definido por métodos de cambio de estado.

- **Líneas 43-69 (constructor):** 12 campos. `referenceId` (nullable) vincula la transacción a un viaje o pago externo. `metadata` (JSONB nullable) guarda datos dinámicos como desglose de tarifas o info del gateway.

- **Líneas 71-95 (`create`):** Factory que inicia en estado PENDING con versión 1. Parámetros opcionales para referenceId, description y metadata (con ?? null para normalizar undefined → null).

- **Líneas 97-149 (métodos de transición de estado):**
  - `complete()`: Retorna nueva Transaction con status=COMPLETED y version+1.
  - `fail()`: Retorna nueva Transaction con status=FAILED y version+1.
  - `reverse()`: Retorna nueva Transaction con status=REVERSED y version+1.

**Por qué:** El patrón de inmutabilidad (cada cambio retorna una nueva instancia) previene mutaciones accidentales y facilita la auditoría: cada transición queda registrada en el historial. Al incrementar `version` en cada cambio, se implementa OCC: al persistir, TypeORM verificará que la versión en BD coincida.

**Observación:** Los métodos no toman parámetros adicionales (ej: `complete(metadata?)`), lo que limita agregar información contextual en cada transición. Sería más flexible si aceptaran metadatos opcionales.

---

#### 11.2.5 `src/modules/fin/domain/entities/exchange-rate.entity.ts` (79 líneas)

**Qué hace:** Entidad ExchangeRate — tasa de conversión entre dos monedas ISO 4217 con vigencia temporal.

**Bloques:**

- **Líneas 26-46 (constructor):** `fromCurrency`, `toCurrency`, `rate` (decimal 18,8), `validFrom`, `validUntil` (nullable = vigente indefinidamente).

- **Líneas 48-67 (`create`):** Factory con `validUntil` opcional (default null).

- **Líneas 69-73 (`isEffective`):** Verifica si la tasa está vigente en una fecha dada. Si `validUntil` es null, se considera vigente desde `validFrom` en adelante. Tiene default `at = new Date()` para la consulta "ahora".

- **Líneas 75-78 (`convert`):** Convierte un monto multiplicando por la tasa. Usa `Math.round()` para mantener enteros (centavos).

**Por qué:** Las tasas de cambio cambian frecuentemente (especialmente en economías dolarizadas como Venezuela). Tener vigencia permite mantener histórico y saber qué tasa se aplicó en cada transacción. `Math.round()` evita centavos fraccionarios.

---

#### 11.2.6 `src/modules/fin/domain/entities/coop-fare.entity.ts` (93 líneas)

**Qué hace:** Entidad CoopFare — tarifario por cooperativa. Define el costo de los viajes.

**Bloques:**

- **Líneas 25-47 (constructor):** `cooperativeId` referencia a la asociación en esquema `auth`. `baseFare` (centavos fijos por viaje) + `perKmRate` (centavos por km). `active` flag booleano.

- **Líneas 49-69 (`create`):** Factory que crea la tarifa como activa por defecto.

- **Líneas 71-75 (`calculateTripCost`):** Fórmula: `baseFare + Math.round(perKmRate * distanceKm)`. El resultado se redondea a entero para mantener centavos.

- **Líneas 77-92 (`deactivate`):** Retorna nueva instancia con `active=false` y `version+1`. No se elimina — se mantiene historial.

**Por qué:** Cada cooperativa tiene su propio tarifario. El diseño permite tarifas diferenciales (nocturna, fin de semana) desactivando la anterior y creando una nueva. `Math.round()` en `calculateTripCost` evita errores de redondeo acumulados.

---

#### 11.2.7 `src/modules/fin/domain/entities/saga-state.entity.ts` (124 líneas)

**Qué hace:** Entidad SagaState — implementa el patrón Saga para transacciones distribuidas.

**Bloques:**

- **Líneas 28-34 (`SagaStatus` enum):** PENDING → COMPLETED | FAILED → COMPENSATING → COMPENSATED.

- **Líneas 36-42 (`SagaStep` enum):** AUTH_HOLD, DEBIT_WALLET, RECORD_TRANSACTION, NOTIFY_USER, RELEASE_HOLD. Define el flujo típico de un pago.

- **Líneas 44-64 (constructor):** `sagaId` agrupa todos los pasos de una transacción. `payload` (JSONB) permite almacenar datos específicos del paso (ej: `{ amount, walletId, transactionId }`). `error` almacena mensaje de fallo.

- **Líneas 66-83 (`create`):** Factory con payload opcional, status PENDING.

- **Líneas 85-123 (métodos de transición):**
  - `complete()`: Paso ejecutado OK.
  - `fail(error)`: Recibe mensaje de error para debugging.
  - `compensate()`: Inicia deshacer la operación.
  - `compensated()`: Compensación completada.

**Por qué:** El patrón Saga es esencial para transacciones que cruzan múltiples sistemas (wallet + notificación + proveedor de pagos). Si un paso falla, los pasos anteriores se compensan en orden inverso. El diseño por paso permite paralelismo y recuperación granular.

**Observación:** No hay un método `isCompensable()` o `canCompensate()` para validar si un paso puede compensarse. En una saga real, no todos los pasos son compensables (ej: notificar al usuario no se deshace). Esto podría agregarse.

---

### 11.3 Capa de Dominio — Value Objects

#### 11.3.1 `src/modules/fin/domain/value-objects/index.ts`

Barrel que exporta `Money` desde `money.vo.ts`.

---

#### 11.3.2 `src/modules/fin/domain/value-objects/money.vo.ts` (95 líneas)

**Qué hace:** Value Object inmutable para manejo de montos financieros. Almacena todo en centavos (enteros).

**Bloques:**

- **Líneas 24-35 (constructor privado):** Valida que `amount` sea entero (rechaza decimales) y `currency` tenga 3 caracteres ISO 4217. **Constructor privado** — las únicas formas de crear instancias son `fromCents()` o `fromDecimal()`.

- **Líneas 37-40 (`fromCents`):** Fábrica desde centavos enteros. Ej: `Money.fromCents(1050, 'USD')`.

- **Líneas 42-46 (`fromDecimal`):** Convierte desde decimal. `Math.round(amount * 100)` asegura que 10.505 USD se convierta a 1051 centavos (no 1050.5).

- **Líneas 48-52 (`add`):** Suma dos montos de la misma moneda. Lanze error si monedas distintas.

- **Líneas 54-58 (`subtract`):** Resta dos montos. Misma validación de moneda.

- **Líneas 60-64 (`multiply`):** Multiplica por factor (para impuestos, propinas). Redondea resultado.

- **Líneas 66-69 (`toDecimal`):** Convierte a decimal dividiendo por 100.

- **Líneas 71-85 (comparadores):** `isZero()`, `isNegative()`, `isGreaterThanOrEqual()`.

- **Líneas 87-94 (`assertSameCurrency`):** Validación privada reutilizada por add, subtract, isGreaterThanOrEqual.

**Por qué:** Los floats IEEE 754 tienen errores de redondeo (0.1 + 0.2 = 0.30000000000000004). Almacenar en centavos enteros y hacer todas las operaciones con enteros elimina este problema. El constructor privado + fábricas públicas garantiza que toda instancia pase por las validaciones.

**Observación:** Este Money no implementa `toJSON()` para serialización, por lo que al responder en REST se devuelve como `{ amount: 1050, currency: 'USD' }` en lugar de `{ amount: 10.50, currency: 'USD' }`. El frontend debería convertir dividiendo por 100.

---

### 11.4 Capa de Dominio — Excepciones

#### 11.4.1 `src/modules/fin/domain/exceptions/index.ts`

Barrel que exporta InsufficientBalanceException, WalletNotFoundException, TransactionFailedException.

---

#### 11.4.2 `src/modules/fin/domain/exceptions/insufficient-balance.exception.ts` (33 líneas)

**Qué hace:** Se lanza cuando el saldo disponible (incluyendo crédito de emergencia) no alcanza para la operación.

**Bloques:**
- Extiende `Error` (dominio puro, sin dependencia de NestJS).
- Campos públicos adicionales: `walletId`, `currentBalance`, `requiredAmount` para debugging y respuesta al cliente.
- Constructor formatea el mensaje: `"Insufficient balance in wallet {id}: current={x}, required={y}"`.

**Por qué:** Incluir los datos del saldo en la excepción permite al manejador de errores construir una respuesta HTTP informativa sin necesidad de consultar la BD nuevamente.

---

#### 11.4.3 `src/modules/fin/domain/exceptions/wallet-not-found.exception.ts` (20 líneas)

**Qué hace:** Se lanza cuando se busca una wallet por ID o userId y no existe.

**Observación:** Extiende `Error` directamente. Contrasta con `auth` donde excepciones similares extienden `HttpException`. Esta es una elección de diseño más pura (dominio sin acoplamiento a NestJS).

---

#### 11.4.4 `src/modules/fin/domain/exceptions/transaction-failed.exception.ts` (26 líneas)

**Qué hace:** Se lanza cuando una operación falla por razones distintas a saldo insuficiente (error de BD, conflicto de concurrencia, validación de negocio).

**Campos:** `reason` (string, requerido), `transactionId` (string | null, opcional). Incluye transactionId en el mensaje si está presente.

---

### 11.5 Capa de Dominio — Puertos (Interfaces)

#### 11.5.1 `src/modules/fin/domain/interfaces/index.ts`

Barrel que re-exporta repositorios y servicios.

---

#### 11.5.2 `src/modules/fin/domain/interfaces/repositories/index.ts`

Solo exporta `WALLET_REPOSITORY_PORT` y `WalletRepositoryPort`. **No exporta** los otros 4 puertos de repositorio (Transaction, ExchangeRate, CoopFare, SagaState). Esto significa que aunque los archivos existen con sus tokens, no son accesibles desde fuera del módulo a menos que se importen directamente. Es intencional: FinModule no los registra en DI.

```
export { WALLET_REPOSITORY_PORT } from './wallet.repository.port';
export type { WalletRepositoryPort } from './wallet.repository.port';
```

---

#### 11.5.3 Puertos de Repositorio (6 archivos)

Todos siguen el mismo patrón:

| Archivo | Token | Métodos |
|---|---|---|
| `wallet.repository.port.ts` | `WALLET_REPOSITORY_PORT` | findById, findByUserId, save, update, delete |
| `transaction.repository.port.ts` | `TRANSACTION_REPOSITORY_PORT` | findById, findByWalletId, save, update |
| `exchange-rate.repository.port.ts` | `EXCHANGE_RATE_REPOSITORY_PORT` | findCurrent, findById, save |
| `coop-fare.repository.port.ts` | `COOP_FARE_REPOSITORY_PORT` | findById, findByCooperativeId, save, update |
| `saga-state.repository.port.ts` | `SAGA_STATE_REPOSITORY_PORT` | findById, findBySagaId, save, update |

**Patrón común:**
- Token string exportado como constante (ej: `export const WALLET_REPOSITORY_PORT = 'WalletRepositoryPort'`).
- Interfaz con métodos asíncronos que trabajan con entidades de dominio (nunca con ORM entities).
- Cada interfaz importa solo la entidad de dominio que le corresponde.

**Por qué:** El token string permite inyección por nombre (no por clase), desacoplando implementación de interfaz. Si mañana hay dos implementaciones de WalletRepositoryPort (TypeORM + Redis cache), se pueden usar tokens diferenciados.

---

#### 11.5.4 `src/modules/fin/domain/interfaces/services/index.ts`

Exporta `WALLET_SERVICE_PORT` y `WalletServicePort`.

```
export { WALLET_SERVICE_PORT } from './wallet.service.port';
export type { WalletServicePort } from './wallet.service.port';
```

---

#### 11.5.5 `src/modules/fin/domain/interfaces/services/wallet.service.port.ts` (6 líneas)

**Qué hace:** Puerto de servicio que expone `createWallet()` para ser consumido por el módulo `auth`.

```typescript
export const WALLET_SERVICE_PORT = 'WALLET_SERVICE_PORT';
export interface WalletServicePort {
  createWallet(userId: string, currency?: string): Promise<void>;
}
```

**Observación crítica:** Esta interfaz solo tiene un método (`createWallet`). En `DOCUMENTACION.md` se describe con 6 métodos (createWallet, getBalance, deposit, withdraw, processPayment, getWallet), pero el puerto REAL solo define `createWallet`. Cuando se implementen los demás casos de uso, este puerto deberá expandirse.

---

### 11.6 Capa de Aplicación — Casos de Uso

#### 11.6.1 `src/modules/fin/application/use-cases/index.ts`

Solo exporta `CreateWalletUseCase`. Los otros 4 casos de uso (deposit, withdraw, process-payment, get-balance) no se exportan porque sus archivos están vacíos.

```
export { CreateWalletUseCase } from './create-wallet.use-case';
```

---

#### 11.6.2 `src/modules/fin/application/use-cases/create-wallet.use-case.ts` (39 líneas)

**Qué hace:** Caso de uso completo que crea una billetera para un usuario.

**Bloques:**

- **Líneas 25-29 (clase):** Inyecta `WalletRepositoryPort` vía `@Inject(WALLET_REPOSITORY_PORT)`. Usa `private readonly` para inmutabilidad.

- **Líneas 31-38 (`execute`):** Flujo:
  1. Busca wallet existente por userId (idempotencia parcial).
  2. Si existe, lanza Error (rechaza, a diferencia de auth que devolvería la existente).
  3. Si no existe, crea con `Wallet.create()` y persiste.

**Observación:** Lanza `Error` genérico en lugar de `WalletAlreadyExistsException`. Esto significa que el filtro global de excepciones no puede categorizar este error fácilmente. Sería mejor tener una excepción de dominio específica o, alternativamente, retornar la wallet existente en lugar de lanzar error (patrón más tolerante, como hace `CreateUserUseCase` con `UserAlreadyExistsException`).

**Tests (`create-wallet.use-case.spec.ts`, 71 líneas):** 2 tests: creación exitosa y error por wallet existente. Usa mocks manuales del repositorio con `jest.fn()`. Cobertura correcta pero mínima.

---

#### 11.6.3 Archivos VACÍOS — Casos de Uso No Implementados

| Archivo | Contenido |
|---|---|
| `deposit.use-case.ts` | Solo comentario de ruta `// src/modules/fin/application/use-cases/deposit.use-case.ts` |
| `withdraw.use-case.ts` | Solo comentario de ruta |
| `process-payment.use-case.ts` | Solo comentario de ruta |
| `get-balance.use-case.ts` | Solo comentario de ruta |

**Impacto:** Estos 4 archivos son archivos vacíos (1 línea cada uno). `DOCUMENTACION.md` los describe como si tuvieran implementación completa, pero el código real no tiene nada. Esto es el gap más crítico del módulo fin. Sin estos casos de uso, las operaciones básicas (depositar, retirar, pagar, consultar saldo) no existen.

---

### 11.7 Capa de Aplicación — DTOs

#### 11.7.1 `src/modules/fin/application/dto/index.ts`

Barrel de DTOs de aplicación. Exporta `CreateWalletDto`, `TransactionDto` (con sus enums), `BalanceResponseDto`.

---

#### 11.7.2 `src/modules/fin/application/dto/create-wallet.dto.ts` (12 líneas)

**Qué hace:** DTO de validación para crear wallet. Usa class-validator.

```typescript
@IsString()
userId: string;

@IsOptional()
@IsString()
@IsIn(['USD', 'VES'])
currency?: string;
```

**Observación:** Solo permite 'USD' y 'VES' como monedas. Si se agregan más monedas en el futuro, habrá que actualizar `@IsIn()`.

**Tests (`create-wallet.dto.spec.ts`, 30 líneas):** 3 tests: validación correcta, falta userId, moneda inválida. Buen test porque usa `plainToInstance` + `validate` para simular el pipeline de NestJS.

---

#### 11.7.3 `src/modules/fin/application/dto/transaction.dto.ts` (41 líneas)

**Qué hace:** DTO de respuesta para transacciones. Tiene enums duplicados de `TransactionType` y `TransactionStatus` (prefijo Dto para distinguirlos).

```typescript
export enum TransactionTypeDto { DEPOSIT, WITHDRAWAL, PAYMENT, REFUND, FEE }
export enum TransactionStatusDto { PENDING, COMPLETED, FAILED, REVERSED }
```

**Observación:** Hay duplicación de enums: `TransactionType` en domain/entities, `TransactionTypeDto` en application/dto, y `TransactionOrmType` en infrastructure/orm. Esto es coherente con la arquitectura hexagonal (cada capa tiene sus propios tipos), pero aumenta el mantenimiento. Al agregar un nuevo tipo, hay que actualizar 3 archivos.

---

#### 11.7.4 `src/modules/fin/application/dto/balance-response.dto.ts` (20 líneas)

**Qué hace:** DTO de respuesta para consulta de saldo. Expone `balance`, `debtBalance`, `currency`.

---

#### 11.7.5 `src/modules/fin/application/services/index.ts`

Archivo vacío: `export {};`. Este directorio está preparado para futuros servicios de aplicación, pero actualmente no hay ninguno.

---

### 11.8 Capa de Infraestructura — ORM Entities

#### 11.8.1 `src/modules/fin/infrastructure/orm/index.ts`

Barrel de ORM entities. Exporta las 5 entidades: WalletOrmEntity, TransactionOrmEntity, ExchangeRateOrmEntity, CoopFareOrmEntity, SagaStateOrmEntity.

---

#### 11.8.2 `src/modules/fin/infrastructure/orm/wallet.orm-entity.ts` (81 líneas)

**Qué hace:** Mapeo TypeORM para tabla `fin.wallets`.

**Bloques clave:**

- **Línea 33:** `@Entity({ name: 'wallets', schema: 'fin' })` — Esquema `fin`, tabla `wallets`.

- **Líneas 36-37 (`id`):** `@PrimaryGeneratedColumn('uuid')` — Generación de UUID por PostgreSQL (uuid-ossp o pgcrypto).

- **Líneas 39-41 (`userId`):** `@Column({ type: 'uuid', name: 'user_id', unique: true })` — Relación 1:1 con users. `unique: true` garantiza que un usuario solo tenga una wallet.

- **Líneas 44-46 (`balance`):** `@Column({ type: 'bigint', default: 0 })` — BIGINT en BD, number en TS. TypeORM convierte automáticamente.

- **Líneas 61-63 (`lastTransactionAt`):** `@Column({ type: 'timestamptz', name: 'last_transaction_at', nullable: true })` — `timestamptz` almacena timestamp con zona horaria, evita ambigüedades.

- **Líneas 65-70 (`version`):** `@Column({ type: 'int', default: 1 })` — OCC. La aplicación debe incrementar este valor en cada UPDATE y filtrar `WHERE version = :old_version`. Si 0 filas afectadas, hubo conflicto.

- **Líneas 75-80 (`createdAt`/`updatedAt`):** `default: () => 'clock_timestamp()'` — Usa `clock_timestamp()` de PostgreSQL (hora real) en lugar de `now()` (hora al inicio de la transacción). Esto evita que dos operaciones en la misma transacción tengan el mismo timestamp.

---

#### 11.8.3 `src/modules/fin/infrastructure/orm/transaction.orm-entity.ts` (84 líneas)

**Qué hace:** Mapeo para tabla `fin.transactions`.

**Bloques clave:**
- `type` como VARCHAR(20) en lugar de enum nativo PostgreSQL — más flexible, no requiere migrations de tipo ENUM.
- `amount` como BIGINT (centavos).
- `metadata` como JSONB nullable — datos dinámicos del gateway de pago.
- Enums ORM duplicados (TransactionOrmType, TransactionOrmStatus).

---

#### 11.8.4 `src/modules/fin/infrastructure/orm/exchange-rate.orm-entity.ts` (59 líneas)

**Qué hace:** Mapeo para tabla `fin.exchange_rates`.

**Bloques clave:**
- `rate` como `DECIMAL(18,8)` — precisión financiera: 18 dígitos totales, 8 decimales. Suficiente para tasas de cambio (ej: 1 USD = 4,350.12345678 VES).
- `valid_from` / `valid_until` como timestamptz.

---

#### 11.8.5 `src/modules/fin/infrastructure/orm/coop-fare.orm-entity.ts` (62 líneas)

**Qué hace:** Mapeo para tabla `fin.coop_fares`.

**Bloques clave:**
- `base_fare` y `per_km_rate` como BIGINT (centavos).
- `cooperative_id` referencia a `auth.associations.id` (relación entre esquemas).
- `active` boolean — permite desactivar tarifas sin eliminar historial.

---

#### 11.8.6 `src/modules/fin/infrastructure/orm/saga-state.orm-entity.ts` (77 líneas)

**Qué hace:** Mapeo para tabla `fin.saga_states`.

**Bloques clave:**
- `saga_id` UUID que agrupa todos los pasos de una transacción.
- `step` como VARCHAR(30) con enum SagaOrmStep.
- `payload` JSONB nullable.
- `error` TEXT nullable.

---

### 11.9 Capa de Infraestructura — Repositorios TypeORM

#### 11.9.1 `src/modules/fin/infrastructure/persistence/index.ts`

Barrel que exporta las 5 implementaciones de repositorio.

---

#### 11.9.2 `src/modules/fin/infrastructure/persistence/wallet.repository.impl.ts` (88 líneas)

**Qué hace:** Implementación TypeORM de `WalletRepositoryPort`.

**Bloques:**

- **Líneas 25-30 (clase):** `@Injectable()`, inyecta `Repository<WalletOrmEntity>` via `@InjectRepository()`.

- **Líneas 32-35 (`findById`):** `findOne` con filtro por id. Retorna null si no existe (no lanza excepción — el caso de uso decide qué hacer con null).

- **Líneas 37-40 (`findByUserId`):** `findOne` con filtro por userId.

- **Líneas 42-46 (`save`):** Convierte dominio → ORM, persiste, convierte ORM → dominio y retorna. Esto garantiza que siempre se trabaje con entidades de dominio, nunca con ORM entities fuera del repositorio.

- **Líneas 48-51 (`update`):** Usa `repo.update(id, partial)` para UPDATE directo, luego reloe con `findById`. **Posible bug:** Si el registro fue eliminado entre el update y el findById, `findById` retorna null y el cast `as Promise<Wallet>` ocultaría el error.

- **Líneas 53-55 (`delete`):** Eliminación física. En wallets quizás sería mejor borrado lógico (flag `deleted_at`).

- **Líneas 57-71 (`toDomain`):** Mapea ORM → dominio. Usa `Number()` para convertir BIGINT de BD a number de TS (TypeORM devuelve string para BIGINT).

- **Líneas 73-87 (`toOrm`):** Mapea dominio → ORM. Crea nueva instancia de ORM entity y asigna campo por campo.

**Tests (`wallet.repository.impl.spec.ts`, 77 líneas):** 3 tests: save (conversión dominio→ORM→dominio), findByUserId (encontrado), findByUserId (no encontrado). Usa mockOrmWallet con valores fijos. No testea update ni delete.

---

#### 11.9.3 `src/modules/fin/infrastructure/persistence/transaction.repository.impl.ts` (77 líneas)

**Qué hace:** Implementación TypeORM de `TransactionRepositoryPort`.

**Observación:** No tiene JSDoc (a diferencia de wallet y exchange-rate que sí tienen). Tampoco tiene archivo de test.

**`toDomain`:** Usa `as unknown as TransactionType` y `as unknown as TransactionStatus` para convertir de enums ORM a enums de dominio. Esto es seguro porque los valores string son idénticos, pero el doble cast (`as unknown as X`) indica que los tipos no son directamente compatibles aunque representen lo mismo.

**`toOrm`:** Usa `as any` para asignar los enums de dominio a los de ORM. Funciona en runtime porque los valores string coinciden, pero TypeScript no puede verificarlo estáticamente.

---

#### 11.9.4 `src/modules/fin/infrastructure/persistence/exchange-rate.repository.impl.ts` (85 líneas)

**Qué hace:** Implementación TypeORM de `ExchangeRateRepositoryPort`.

**Bloque clave (`findCurrent`):** Usa `LessThanOrEqual` y `MoreThanOrEqual` de TypeORM para encontrar la tasa vigente en la fecha actual. Ordena por `validFrom DESC` para obtener la más reciente si hay múltiples vigentes.

```typescript
where: {
  fromCurrency: from,
  toCurrency: to,
  validFrom: LessThanOrEqual(now),
  validUntil: MoreThanOrEqual(now),
},
order: { validFrom: 'DESC' },
```

Tiene JSDoc completo y métodos toDomain/toOrm.

---

#### 11.9.5 `src/modules/fin/infrastructure/persistence/coop-fare.repository.impl.ts` (83 líneas)

**Qué hace:** Implementación TypeORM de `CoopFareRepositoryPort`.

**Bloque clave (`findByCooperativeId`):** Filtra por `cooperativeId` Y `active: true`. Esto retorna la tarifa activa asumiendo que solo una puede estar activa (regla de negocio documentada en la entidad de dominio).

Tiene JSDoc completo.

---

#### 11.9.6 `src/modules/fin/infrastructure/persistence/saga-state.repository.impl.ts` (68 líneas)

**Qué hace:** Implementación TypeORM de `SagaStateRepositoryPort`.

**Observación:** Sin JSDoc (como transaction.repository.impl.ts). Mismos patrones de casting (`as unknown as SagaStep`, `as any`). Sin tests.

---

### 11.10 Capa de Infraestructura — Servicios

#### 11.10.1 `src/modules/fin/infrastructure/services/wallet.service.impl.ts` (13 líneas)

**Qué hace:** Implementa `WalletServicePort` (el puerto que auth consume).

```typescript
@Injectable()
export class WalletServiceImpl implements WalletServicePort {
  constructor(private readonly createWalletUseCase: CreateWalletUseCase) {}

  async createWallet(userId: string, currency?: string): Promise<void> {
    await this.createWalletUseCase.execute(userId, currency);
  }
}
```

**Observación crítica:** Este servicio solo implementa `createWallet`. No tiene los métodos `getBalance`, `deposit`, `withdraw`, `processPayment`, `getWallet` que `WalletServicePort` debería tener según `DOCUMENTACION.md`. El puerto real (`WalletServicePort`) tampoco declara esos métodos — solo tiene `createWallet`. Cuando esos casos de uso se implementen, habrá que:
1. Expandir `WalletServicePort` con los nuevos métodos.
2. Implementarlos en `WalletServiceImpl`.
3. Registrarlos en `FinModule`.

**Tests (`wallet.service.impl.spec.ts`, 48 líneas):** 2 tests: verifica que delega en CreateWalletUseCase y que propaga errores. Mockea el caso de uso.

---

### 11.11 Capa de Infraestructura — Módulo NestJS

#### 11.11.1 `src/modules/fin/infrastructure/fin.module.ts` (26 líneas)

**Qué hace:** Módulo NestJS que registra y exporta dependencias del módulo financiero.

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([WalletOrmEntity])],
  providers: [
    { provide: WALLET_REPOSITORY_PORT, useClass: WalletRepositoryImpl },
    { provide: WALLET_SERVICE_PORT, useClass: WalletServiceImpl },
    CreateWalletUseCase,
  ],
  exports: [WALLET_SERVICE_PORT],
})
export class FinModule {}
```

**Observaciones críticas:**

1. **Solo registra `WalletOrmEntity`** — Las otras 4 entidades ORM (Transaction, ExchangeRate, CoopFare, SagaState) no están registradas en `TypeOrmModule.forFeature()`. Esto significa que sus repositorios (`TransactionRepositoryImpl`, etc.) NO pueden inyectar `Repository<XxxOrmEntity>` porque TypeORM no las tiene en el contexto. Si se intenta usar `@InjectRepository(TransactionOrmEntity)` en una clase dentro de FinModule, fallará en tiempo de compilación/arranque.

2. **Solo registra `WalletRepositoryImpl`** — Los otros 4 repositorios no están en `providers`, por lo que no pueden ser inyectados. Sus tokens (`TRANSACTION_REPOSITORY_PORT`, etc.) no tienen binding.

3. **Solo exporta `WALLET_SERVICE_PORT`** — Correcto para el consumo de auth, pero otros módulos no pueden acceder a los repositorios ni a los casos de uso.

4. **No registra `WalletController` ni `TransactionController`** — Los controladores no están en la lista de `controllers` del módulo, lo que significa que NestJS no crea rutas para ellos. Las rutas POST /fin/wallets y /fin/transactions no están registradas.

**Conclusión:** El módulo está en estado de construcción temprana. Solo el flujo `CreateWalletUseCase → WalletRepositoryImpl → WalletOrmEntity` funciona. Cualquier intento de usar transactions, exchange rates, coop fares o saga states a través de este módulo fallará porque sus dependencias no están registradas.

---

### 11.12 Capa de Interfaces — Controladores REST

#### 11.12.1 `src/modules/fin/interfaces/rest/index.ts`

Barrel que exporta WalletController y TransactionController.

---

#### 11.12.2 `src/modules/fin/interfaces/rest/wallet.controller.ts` (19 líneas)

**Qué hace:** Controlador REST para `POST /fin/wallets`.

```typescript
@Controller('fin/wallets')
export class WalletController {
  constructor(
    @Inject(WALLET_SERVICE_PORT)
    private readonly walletService: WalletServicePort,
  ) {}

  @Post()
  async createWallet(@Body() dto: CreateWalletDto) {
    await this.walletService.createWallet(dto.userId, dto.currency);
    return { message: 'Wallet created successfully' };
  }
}
```

**Bloques:**
- Inyecta `WalletServicePort` (no el caso de uso directamente). Esto abstrae al controlador de los detalles de implementación.
- Convierte el DTO de interfaz en parámetros del servicio.
- Retorna mensaje de éxito (sin datos de la wallet creada).

**Observación:** No retorna la wallet creada. El cliente solo sabe que "se creó exitosamente" pero no tiene el ID. Sería más útil retornar la wallet o al menos su ID.

**Tests (`wallet.controller.spec.ts`, 52 líneas):** 2 tests: creación exitosa (verifica mensaje) y error propagado (wallet ya existe). Mockea el servicio.

---

#### 11.12.3 `src/modules/fin/interfaces/rest/transaction.controller.ts` (7 líneas)

**Qué hace:** Stub total.

```typescript
@Controller('fin/transactions')
export class TransactionController {
  // Endpoints deposit y transfer se implementarán en futuras sesiones
}
```

No tiene métodos, no tiene rutas. El comentario reconoce que está pendiente.

---

### 11.13 Capa de Interfaces — DTOs

#### 11.13.1 `src/modules/fin/interfaces/dto/index.ts`

Barrel que exporta `DepositDto` y `TransferDto`.

---

#### 11.13.2 `src/modules/fin/interfaces/dto/deposit.dto.ts` (19 líneas)

**Qué hace:** DTO para solicitudes de depósito.

```typescript
export class DepositDto {
  userId: string;
  amount: number;
  referenceId?: string;
}
```

**Observación:** **Sin decoradores class-validator.** No hay `@IsString()`, `@IsNumber()`, `@IsPositive()` ni `@IsOptional()`. NestJS aceptará cualquier cuerpo JSON sin validación. `DOCUMENTACION.md` reconoce esto como pendiente. `PROYECTO.md` está desactualizado al respecto.

---

#### 11.13.3 `src/modules/fin/interfaces/dto/transfer.dto.ts` (19 líneas)

**Qué hace:** DTO para solicitudes de transferencia/pago.

```typescript
export class TransferDto {
  userId: string;
  amount: number;
  referenceId: string;
}
```

**Observación:** Mismo problema que deposit.dto.ts — sin validación. `referenceId` es requerido (sin `?`) a diferencia de DepositDto.

---

### 11.14 Tests del Módulo Fin

| Archivo | Tests | Cobertura |
|---|---|---|
| `create-wallet.use-case.spec.ts` | 2 | Creación y error por duplicado |
| `create-wallet.dto.spec.ts` | 3 | Validación, falta userId, moneda inválida |
| `wallet.repository.impl.spec.ts` | 3 | Save, findByUserId (encontrado/no encontrado) |
| `wallet.service.impl.spec.ts` | 2 | Delegación en use case, propagación de error |
| `wallet.controller.spec.ts` | 2 | Creación exitosa, error propagado |

**Total: 12 tests en 5 spec files.**

**Faltan tests para:**
- TransactionRepositoryImpl (0 tests)
- ExchangeRateRepositoryImpl (0 tests)
- CoopFareRepositoryImpl (0 tests)
- SagaStateRepositoryImpl (0 tests)
- Wallet entity (create/constructor) — 0 tests
- Transaction entity (create/complete/fail/reverse) — 0 tests
- ExchangeRate entity (isEffective/convert) — 0 tests
- CoopFare entity (calculateTripCost/deactivate) — 0 tests
- SagaState entity (complete/fail/compensate/compensated) — 0 tests
- Money VO (fromCents/fromDecimal/add/subtract/convert) — 0 tests
- Excepciones (constructor/mensajes) — 0 tests

---

*Documento generado el 2026-06-24 por el Analista Comentador.*
*Basado en la revisión de 111 archivos fuente y 4 archivos de documentación.*
