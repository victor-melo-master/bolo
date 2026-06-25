# BOLO API — Documentación Técnica del Proyecto

## 1. Descripción General

API monolítica modular de la plataforma BOLO. Construida con **NestJS 11** sobre **Node.js 24**, sigue **Arquitectura Hexagonal (Puertos y Adaptadores)** para desacoplar la lógica de negocio de la infraestructura.

La base de datos corre sobre **PostgreSQL 18 + PostGIS 3**, con esquemas separados por dominio de negocio (microservicios lógicos). **Redis 7** se utiliza para caché de sesiones, rate-limiting y tracking GPS en tiempo real.

## 2. Stack Tecnológico

| Componente      | Versión        | Propósito                               |
| --------------- | -------------- | --------------------------------------- |
| Node.js         | 24 Alpine      | Runtime JavaScript                      |
| NestJS          | ^11.0          | Framework backend (DI, módulos, guards) |
| TypeScript      | ^5.7           | Lenguaje                                |
| TypeORM         | ^1.0           | ORM para PostgreSQL                     |
| PostgreSQL      | 18 + PostGIS 3 | Base de datos relacional + geoespacial  |
| Redis           | 7 Alpine       | Caché / sesiones / rate-limiting        |
| passport-jwt    | ^4.0           | Autenticación JWT                       |
| bcrypt          | ^6.0           | Hashing de contraseñas                  |
| class-validator | ^0.15          | Validación de DTOs                      |
| @nestjs/swagger | ^11.4          | Documentación OpenAPI automática        |
| Winston         | ^3.19          | Logging estructurado                    |
| ioredis         | ^5.11          | Cliente Redis                           |
| Jest            | ^30.0          | Tests unitarios y e2e                   |

## 3. Arquitectura Hexagonal (Puertos y Adaptadores)

### Capas por Módulo

```
┌─────────────────────────────────────────────────┐
│                   Interfaces                     │
│  (Controladores REST, DTOs de validación,       │
│   Middleware, Guards, Decorators)                │
├─────────────────────────────────────────────────┤
│                Application                       │
│  (Casos de uso, DTOs internos,                   │
│   Servicios de aplicación)                       │
├─────────────────────────────────────────────────┤
│                  Domain                          │
│  (Entidades puras, Puertos/Interfaces,          │
│   Value Objects, Excepciones)                    │
├─────────────────────────────────────────────────┤
│              Infrastructure                      │
│  (ORM entities, Repositorios TypeORM,            │
│   JWT Strategy, Servicios externos)              │
└─────────────────────────────────────────────────┘
```

### Flujo de una Solicitud

```
HTTP Request → Controller → DTO (validate) → UseCase → Port (interface)
                                                          ↓
                                              RepositoryImpl (TypeORM)
                                                          ↓
                                                      PostgreSQL
```

## 4. Estructura del Proyecto

```
api/
├── .env                        # Variables de entorno (desarrollo)
├── .prettierrc                 # Config Prettier
├── Dockerfile                  # Multi-stage (dev / build / prod)
├── eslint.config.mjs           # ESLint flat config
├── nest-cli.json               # Config CLI NestJS
├── package.json                # Dependencias y scripts
├── tsconfig.json               # TypeScript raíz
├── tsconfig.build.json         # TypeScript para build
├── src/
│   ├── main.ts                 # Bootstrap de la app
│   ├── app.module.ts           # Módulo raíz
│   ├── app.controller.ts       # Controlador raíz (GET /)
│   ├── app.service.ts          # Servicio raíz
│   ├── health.controller.ts    # Healthcheck (GET /health)
│   ├── shared/                 # Código común transversal
│   │   ├── domain/
│   │   │   ├── base.entity.ts              # Entidad base abstracta
│   │   │   ├── exceptions/                 # NotFound, Unauthorized
│   │   │   ├── interfaces/                 # IBaseRepository
│   │   │   └── value-objects/              # Money, Email, Phone (stubs)
│   │   ├── application/
│   │   │   ├── services/crypto.service.ts  # Hash bcrypt
│   │   │   └── ports/                      # ICache, ILogger
│   │   ├── infrastructure/
│   │   │   ├── database/typeorm.config.ts  # Config PostgreSQL
│   │   │   ├── logger/winston.logger.ts    # Logger Winston
│   │   │   └── redis/redis.client.ts       # Cliente Redis singleton
│   │   └── interfaces/
│   │       ├── middleware/logging.middleware.ts
│   │       ├── filters/all-exceptions.filter.ts
│   │       └── decorators/                 # @Roles, @CurrentUser
│   └── modules/
│       ├── auth/               # ✅ COMPLETO
│       │   ├── domain/entities/            # User, Association, DriverRequest
│       │   ├── domain/interfaces/          # Ports: repositorios + servicios
│       │   ├── application/use-cases/      # CreateUserUseCase, LoginUseCase
│       │   ├── application/dto/            # CreateUserDto, LoginDto
│       │   ├── interfaces/dto/             # RegisterDto, LoginDto, UserResponseDto
│       │   ├── interfaces/rest/            # AuthController, UserController, AssociationController
│       │   └── infrastructure/
│       │       ├── orm/                    # UserOrmEntity, AssociationOrmEntity, DriverRequestOrmEntity
│       │       ├── persistence/            # UserRepositoryImpl, etc.
│       │       ├── auth/                   # JwtStrategy, JwtAuthGuard
│       │       ├── services/               # NotificationServiceImpl (stub)
│       │       └── auth.module.ts          # Composición del módulo
│       ├── fin/               # 🔄 PARCIAL
│       │   ├── domain/
│       │   │   ├── entities/              # Wallet, Transaction, ExchangeRate, CoopFare, SagaState
│       │   │   ├── exceptions/            # InsufficientBalance, WalletNotFound, TransactionFailed
│       │   │   ├── value-objects/         # Money (en centavos)
│       │   │   └── interfaces/
│       │   │       ├── repositories/      # 5 puertos de repositorio
│       │   │       └── services/          # WalletServicePort
│       │   ├── application/
│       │   │   ├── use-cases/             # CreateWallet, CreateCoopFare (Deposit/Withdraw/etc stubs)
│       │   │   ├── dto/                   # CreateWalletDto, TransactionDto, BalanceResponseDto, CreateCoopFareDto
│       │   │   └── services/              # (vacío)
│       │   ├── infrastructure/
│       │   │   ├── orm/                   # 5 entidades (3 registradas en módulo)
│       │   │   ├── persistence/           # 3 repositorios registrados en módulo
│       │   │   └── fin.module.ts          # DI parcial
│       │   └── interfaces/
│       │       ├── rest/                  # WalletController, CoopFareController, TransactionController (stub)
│       │       └── dto/                   # DepositDto, TransferDto
│       ├── ops/               # 🔄 EN PROGRESO
│       │   ├── domain/
│       │   │   ├── entities/              # Route
│       │   │   ├── exceptions/
│       │   │   └── interfaces/
│       │   ├── application/
│       │   │   └── use-cases/             # CreateRouteUseCase, CreateAssociationUseCase
│       │   ├── infrastructure/
│       │   │   ├── orm/                   # RouteOrmEntity
│       │   │   ├── persistence/           # RouteRepositoryImpl
│       │   │   └── ops.module.ts          # DI con AuthModule + FinModule
│       │   └── interfaces/
│       │       └── rest/                  # RouteController, OpsAssociationController
│       ├── trip/              # ⏳ PENDIENTE
│       └── audit/             # ⏳ PENDIENTE
└── test/
    ├── jest-e2e.json           # Config Jest e2e
    └── app.e2e-spec.ts         # Test e2e básico
```

## 5. Módulo auth — Detalle

### Endpoints

| Método | Ruta              | Auth | Descripción                          | Implementado |
| ------ | ----------------- | ---- | ------------------------------------ | :----------: |
| POST   | /auth/register    | No   | Registro de usuario con billetera    |      ✅      |
| POST   | /auth/login       | No   | Login con phone + password → JWT     |      ✅      |
| GET    | /auth/profile     | JWT  | Perfil del usuario autenticado       |      ✅      |
| GET    | /users/:id        | No   | Obtener usuario por ID (placeholder) |      ⚠️      |
| GET    | /associations/:id | No   | Obtener asociación (placeholder)     |      ⚠️      |
| POST   | /associations     | No   | Crear asociación (placeholder)       |      ⚠️      |

### Casos de Uso

#### CreateUserUseCase

1. Verifica unicidad de teléfono
2. Hashea contraseña con bcrypt (costo 10)
3. Crea entidad User mediante factory method
4. Persiste mediante UserRepositoryImpl (TypeORM → auth.users)
5. Crea billetera digital (mock WalletServicePort no-op)

#### LoginUseCase

1. Busca usuario por teléfono
2. Compara contraseña contra hash
3. Verifica isActive
4. Genera JWT firmado con sub, phone, role (expira 1h)

### Seguridad JWT

- Estrategia: `passport-jwt` con extracción del header `Authorization: Bearer <token>`
- Secreto: `JWT_SECRET` desde ConfigService (variable de entorno o Docker secret)
- Guard: `JwtAuthGuard` protege rutas que requieren autenticación
- Payload: `{ sub: userId, phone, role }`

### Tablas en Base de Datos

**auth.users** — Usuarios del sistema

- UUID v7, phone único, email único nullable
- Role enum: passenger, driver, association_admin, super_admin
- Category enum: normal, student, elderly
- Soft-delete via deleted_at
- QR fields para identificación rápida de conductores

**auth.associations** — Cooperativas/Asociaciones

- UUID v7, name único, RIF único
- admin_id referencia a auth.users

**auth.driver_requests** — Solicitudes de afiliación

- Estados: pending, approved, rejected
- documents_urls: JSONB para documentos adjuntos
- rejection_reason opcional

## 6. Módulo fin — Estado Actual

### Implementado — Dominio (✅ Completo)

- **Entidades:**
  - `Wallet` — billetera digital con balance/debtBalance en centavos (BigInt), OCC por version, crédito de emergencia de uso único
  - `Transaction` — transacciones financieras con ciclo de estados (PENDING → COMPLETED | FAILED → REVERSED)
  - `ExchangeRate` — tipo de cambio con vigencia temporal (validFrom/validUntil)
  - `CoopFare` — tarifario por cooperativa (baseFare + perKmRate \* distance)
  - `SagaState` — paso de saga distribuida con estados y compensación
- **Value Object:** `Money` — monto inmutable en centavos con operaciones aritméticas seguras
- **Excepciones:** `InsufficientBalanceException`, `WalletNotFoundException`, `TransactionFailedException`
- **Puertos (interfaces):**
  - 5 repositorios: Wallet, Transaction, ExchangeRate, CoopFare, SagaState
  - 1 servicio: WalletServicePort (usado por AuthModule para crear billeteras)

### Implementado — Aplicación (🔄 Parcial)

- **Casos de uso implementados:**
  - `CreateWalletUseCase` — crea wallet o retorna existente (idempotente)
  - `CreateCoopFareUseCase` — crea tarifario con validación de tasa de cambio
- **Casos de uso pendientes (archivos vacíos):**
  - `DepositUseCase` — acreditar fondos
  - `WithdrawUseCase` — debitar fondos con validación de saldo
  - `ProcessPaymentUseCase` — pago con crédito de emergencia
  - `GetBalanceUseCase` — consulta de saldo y deuda
- **DTOs:** CreateWalletDto, TransactionDto, BalanceResponseDto, CreateCoopFareDto
- **Servicio:** `WalletServiceImpl` — solo implementa `createWallet()`

### Implementado — Infraestructura (🔄 Parcial)

- **ORM (TypeORM):** 3 entidades registradas en FinModule: wallets, exchange_rates, coop_fares
- **Repositorios:** 3 implementaciones TypeORM registradas: Wallet, CoopFare, ExchangeRate
- **Faltan:** TransactionOrmEntity, SagaStateOrmEntity y sus repositorios (no registrados en FinModule)
- **Módulo NestJS:** `FinModule` con DI parcial

### Implementado — Interfaces (🔄 Parcial)

- **REST:**
  - `WalletController`: POST /fin/wallets (funcional)
  - `CoopFareController`: POST /fin/coop-fares (funcional)
  - `TransactionController`: vacío (stub pendiente)
- **DTOs:** DepositDto, TransferDto (sin decoradores class-validator)

### Pendiente

- Agregar decoradores class-validator a DepositDto y TransferDto
- Implementar DepositUseCase, WithdrawUseCase, ProcessPaymentUseCase, GetBalanceUseCase
- Implementar TransactionController
- Registrar TransactionOrmEntity y SagaStateOrmEntity en FinModule
- Tests unitarios para casos de uso y repositorios
- Endpoint para historial de transacciones por wallet

## 7. Módulos Pendientes

### Ops (Operaciones) 🔄 En Progreso

- Route entity implementada (src/modules/ops/domain/entities/route.entity.ts)
- CreateRouteUseCase funcional con repositorio TypeORM
- CreateAssociationUseCase para sub-asociaciones operativas
- OpsModule registrado en app.module.ts con RouteOrmEntity
- Pendiente: CRUD de vehículos, asignaciones, validaciones de disponibilidad

### Trip (Viajes) ⏳ Pendiente

- Inicio/finalización de viajes
- Cálculo de tarifa dinámica
- Tracking GPS con PostGIS (GEOGRAPHY Point, 4326)
- Pagos y comisiones por viaje

### Audit (Auditoría) ⏳ Pendiente

- Log inmutable de acciones críticas
- Trigger BD para prevenir UPDATE/DELETE
- Consulta de historial por entidad

## 8. Configuración de Base de Datos

### Conexión (typeorm.config.ts)

```typescript
type: 'postgres',
host: DB_HOST || 'localhost',
port: DB_PORT || 5432,
username: DB_USER || 'postgres',
password: readSecret('DB_PASSWORD_FILE', 'DB_PASSWORD'),
database: DB_NAME || 'bolo',
synchronize: false,  // ¡Deshabilitado! Usar init.sql o migraciones
```

### Lectura de Secrets

```typescript
function readSecret(fileEnvKey: string, fallbackEnvKey?: string): string;
// 1. Si existe variable <fileEnvKey> (path a archivo secreto), lo lee
// 2. Sino, usa <fallbackEnvKey> como variable directa
// 3. Sino, retorna string vacío
```

## 9. Próximos Pasos

- [x] Implementar WalletServiceImpl real en fin/infrastructure
- [x] Crear repositorios WalletRepository (port + impl) y resto de entidades fin
- [x] Tarifas por cooperativa (fin.coop_fares)
- [x] Tipos de cambio (fin.exchange_rates)
- [x] Saga pattern para pagos distribuidos (fin.saga_states)
- [x] Módulo ops básico con Route entity, OpsModule, controllers
- [x] FinModule integrado en app.module.ts
- [x] OpsModule integrado en app.module.ts
- [ ] Implementar casos de uso de fin: Deposit, Withdraw, ProcessPayment, GetBalance
- [ ] Implementar TransactionController
- [ ] Agregar decoradores class-validator a DepositDto y TransferDto
- [ ] Registrar TransactionOrmEntity y SagaStateOrmEntity en FinModule
- [ ] Desarrollar CRUD de vehículos en módulo ops (ops.vehicles)
- [ ] Implementar módulo trip con tracking GPS
- [ ] Configurar módulo audit con triggers de BD
- [ ] Integrar Redis para caché de sesiones
- [ ] Agregar migraciones TypeORM
- [ ] Escribir tests unitarios para casos de uso y repositorios
- [ ] Escribir tests e2e para endpoints

## 10. Notas Técnicas

- UUID v7: disponible nativamente en PostgreSQL 18 (no requiere extensión pg_uuidv7)
- PostGIS: usar imagen `postgis/postgis:18-3.5` en Docker
- TypeORM: `autoLoadEntities: true` es propiedad de `TypeOrmModuleOptions` (NestJS), no de `DataSourceOptions`
- Docker: las contraseñas se montan como archivos en `/run/secrets/`; en desarrollo se usa `.env`
- Contraseña para bcrypt: **costo 10** — balance entre seguridad y performance
- La API nunca expone puerto al exterior en producción; todo el tráfico pasa por middleware Go Fiber
