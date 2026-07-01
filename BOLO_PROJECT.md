# BOLOS — Documentación Técnica Completa del Proyecto

> Plataforma integral de transporte de pasajeros con billetera digital, tracking GPS, gestión de cooperativas y tarifas dinámicas.
> **Versión:** MVP 0.1.0 | **Fecha:** Julio 2026

---

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Base de Datos](#5-base-de-datos)
6. [Módulo Auth](#6-módulo-auth)
7. [Módulo Ops](#7-módulo-ops)
8. [Módulo Fin](#8-módulo-fin)
9. [Módulo Trip](#9-módulo-trip)
10. [Módulo Audit](#10-módulo-audit)
11. [Frontend](#11-frontend)
12. [Middleware Go](#12-middleware-go)
13. [Infraestructura Docker](#13-infraestructura-docker)
14. [Seguridad](#14-seguridad)
15. [Pruebas](#15-pruebas)
16. [API Reference](#16-api-reference)
17. [Flujo de Autenticación](#17-flujo-de-autenticación)
18. [Flujo de Autorización](#18-flujo-de-autorización)
19. [Roadmap](#19-roadmap)

---

## 1. Visión General

**BOLOS** digitaliza y optimiza la gestión de transporte público en Venezuela. Conecta pasajeros, conductores y cooperativas mediante:

- Tracking GPS en tiempo real
- Billetera digital con pagos en USD/VES
- Gestión de rutas y tarifas dinámicas
- Panel de administración para cooperativas
- Sistema de auditoría inmutable

### Estado del Proyecto

| Aspecto | Estado |
|---------|--------|
| **Madurez global** | ~32% del MVP |
| **Listo para producción** | No |
| **Módulos funcionales completos** | 0 de 5 |
| **Módulos parcialmente funcionales** | 3 de 5 (auth, ops, fin) |
| **Módulos sin implementar** | 2 de 5 (trip, audit) |
| **Tests unitarios** | 39 archivos, ~3,879 líneas |
| **Tests E2E** | 0 |
| **Endpoints REST** | 19 |

---

## 2. Stack Tecnológico

### Backend API
| Componente | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 24.17 (Alpine) | Runtime |
| NestJS | 11.x | Framework backend |
| TypeScript | 5.7 | Lenguaje |
| Express | 5.x | Servidor HTTP subyacente |
| TypeORM | 1.x | ORM / PostgreSQL |
| Passport | 0.7 + JWT | Autenticación |
| class-validator | 0.15 | Validación DTOs |
| bcrypt | 6.x | Hashing de contraseñas |
| Helmet | 8.x | Seguridad HTTP headers |
| Winston | 3.x | Logging |
| ioredis | 5.x | Cliente Redis |
| Swagger | 11.x (instalado, no configurado) | Documentación API |

### Frontend
| Componente | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2 | UI Framework |
| Vite | 8.x | Bundler / Dev server |
| TypeScript | 6.0 | Lenguaje |
| React Router | 7.x | Routing SPA |
| Zustand | 5.x | Estado global |
| react-hook-form | 7.80 | Formularios |
| Zod | 4.x | Validación schemas |
| Nginx | 1.27 | Servidor producción |

### Middleware
| Componente | Versión | Propósito |
|------------|---------|-----------|
| Go | 1.25 | Lenguaje |
| Fiber | v2 | Framework HTTP |
| Air | — | Hot-reload desarrollo |

### Base de Datos
| Componente | Versión | Propósito |
|------------|---------|-----------|
| PostgreSQL | 18 | Base de datos principal |
| PostGIS | 3 | Extensiones geoespaciales |
| Redis | 7 Alpine | Caché / sesiones |

### Infraestructura
| Componente | Propósito |
|------------|-----------|
| Docker Compose | Orquestación local |
| Docker Secrets | Gestión de credenciales |
| pgAdmin | Admin BD (solo dev) |

---

## 3. Arquitectura del Sistema

### 3.1 Arquitectura Hexagonal (Puertos y Adaptadores)

Cada módulo sigue 4 capas:

```
┌──────────────────────────────────────────────────┐
│                    Interfaces                      │
│         (Controladores REST, DTOs, Guards)          │
├──────────────────────────────────────────────────┤
│                  Application                       │
│      (Casos de uso, DTOs de aplicación, Servicios)  │
├──────────────────────────────────────────────────┤
│                    Domain                          │
│   (Entidades, Value Objects, Puertos, Excepciones)  │
├──────────────────────────────────────────────────┤
│                Infrastructure                      │
│   (ORM, Repositorios, Servicios externos, Módulos)  │
└──────────────────────────────────────────────────┘
```

### 3.2 Arquitectura de Redes Docker

```
                    Internet / Host
                         │
                         ▼
                    [public_net]
                  ┌─────┴─────┐
                  │           │
             frontend    middleware
                  │           │
                  │     [api_net]
                  │           │
                  │         api
                  │      ────┼────
                  │      │       │
                  │  [db_net]  [cache_net]
                  │      │       │
                  │  postgres   redis
```

| Red | Tipo | Acceso |
|-----|------|--------|
| `public_net` | bridge | Frontend ↔ Middleware |
| `api_net` | internal | Middleware → API |
| `db_net` | internal | API ↔ PostgreSQL, pgAdmin ↔ PostgreSQL |
| `cache_net` | internal | API ↔ Redis, Middleware ↔ Redis |

### 3.3 Monolito Modular

5 esquemas de base de datos independientes, cada uno correspondiente a un futuro microservicio físico:

```
auth  → Microservicio de Autenticación y Usuarios
ops   → Microservicio de Flota y Operaciones
fin   → Microservicio de Billetera y Finanzas
trip  → Microservicio de Ejecución de Viajes
audit → Microservicio de Auditoría Global
```

---

## 4. Estructura del Proyecto

```
projectBolo/
├── .env                        # Variables NO sensibles
├── .gitignore
├── Makefile                    # 12 comandos de gestión
├── docker-compose.yml          # 6 servicios, 4 redes, 7 volúmenes
├── README.md
│
├── api/                        # ★ NestJS 11 — Backend (~228 archivos)
│   ├── src/
│   │   ├── main.ts             # Bootstrap: ValidationPipe, Helmet, CORS
│   │   ├── app.module.ts       # Módulo raíz (Throttler, Config, TypeORM)
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── health.controller.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/           # ★ 45 archivos — COMPLETO (~85%)
│   │   │   │   ├── interfaces/   # Controladores REST + DTOs
│   │   │   │   ├── application/  # 12 casos de uso + DTOs
│   │   │   │   ├── domain/       # 5 entidades + 5 puertos + excepciones
│   │   │   │   └── infrastructure/ # ORM, repositorios, JWT strategy
│   │   │   │
│   │   │   ├── ops/            # ○ 18 archivos — PARCIAL (~40%)
│   │   │   │   ├── interfaces/   # 2 controladores
│   │   │   │   ├── application/  # 2 casos de uso
│   │   │   │   ├── domain/       # 1 entidad + 1 puerto
│   │   │   │   └── infrastructure/ # ORM, repositorio, módulo
│   │   │   │
│   │   │   ├── fin/            # ○ 41 archivos — PARCIAL (~25%)
│   │   │   │   ├── interfaces/   # 2 controladores
│   │   │   │   ├── application/  # 2 casos de uso + 4 stubs
│   │   │   │   ├── domain/       # 5 entidades + value objects + excepciones
│   │   │   │   └── infrastructure/ # ORM, repositorios, módulo
│   │   │   │
│   │   │   ├── trip/           # ✗ 2 archivos — STUB (~5%)
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── audit/          # ✗ 2 archivos — STUB (~5%)
│   │   │       └── index.ts
│   │   │
│   │   └── shared/             # 23 archivos — Infraestructura compartida
│   │       ├── interfaces/       # Middleware, filtros, decoradores
│   │       ├── application/      # CryptoService
│   │       ├── domain/           # Value Objects, excepciones base
│   │       └── infrastructure/   # TypeORM config, guards, Redis, Logger
│   │
│   ├── test/                   # Config E2E (placeholder)
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                   # ★ React 19 + Vite 8 (~36 archivos fuente)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── routes/AppRouter.tsx   # 12 rutas
│   │   ├── pages/                 # 11 páginas
│   │   ├── modules/auth/          # Auth: hooks, services, components
│   │   ├── shared/store/          # Zustand authStore
│   │   ├── shared/guards/         # ProtectedRoute
│   │   └── api/client.ts          # Cliente HTTP con JWT
│   ├── nginx.conf
│   ├── Dockerfile
│   └── vite.config.ts
│
├── middleware/                 # ○ Go Fiber — STUB (~30 líneas)
│   ├── main.go                 # Solo / y /health
│   ├── Dockerfile
│   └── go.mod
│
├── database/
│   └── init.sql                # 690 líneas, schema completo
│
├── postgres/
│   ├── Dockerfile
│   ├── pg_hba.conf             # SCRAM-SHA-256 + IP restrict
│   └── pgadmin-servers.json
│
├── redis/
│   ├── redis.conf              # Endurecido: comandos peligrosos off
│   └── docker-entrypoint.sh
│
├── secrets/
│   ├── init-secrets.sh
│   ├── pg_password.txt
│   ├── redis_password.txt
│   ├── jwt_secret.txt
│   ├── qr_hmac_secret.txt
│   └── pgadmin_password.txt
│
└── postman/
    ├── BOLO_API-TEST.postman_collection.json
    └── Respaldo - BOLO API - TEST.postman_collection.json
```

---

## 5. Base de Datos

### 5.1 Esquemas

| Esquema | Tablas | Propósito |
|---------|--------|-----------|
| `auth` | passengers, admins, associations, sessions, driver_requests | Usuarios y acceso |
| `fin` | wallets, transactions, coop_fares, exchange_rates, saga_states, rates_config | Financiero |
| `ops` | routes, vehicles, assigned_routes | Operaciones |
| `trip` | trips, payments, gps_history | Viajes |
| `audit` | audit_log | Auditoría |

### 5.2 Tablas Detalladas

#### Schema `auth`

**`auth.passengers`** — Usuarios pasajeros
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK, uuidv7() |
| phone | VARCHAR(20) | UNIQUE, NOT NULL |
| email | VARCHAR(100) | UNIQUE, nullable |
| password_hash | TEXT | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| cedula | VARCHAR(20) | UNIQUE, nullable |
| jwt_key | TEXT | nullable |
| category | passenger_category | DEFAULT 'normal' |
| student_doc_approved | BOOLEAN | DEFAULT FALSE |
| is_active | BOOLEAN | DEFAULT TRUE |
| deleted_at | TIMESTAMPTZ | soft delete |
| last_login_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | clock_timestamp() |
| updated_at | TIMESTAMPTZ | clock_timestamp() |

**`auth.admins`** — Administradores y conductores
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK, uuidv7() |
| phone | VARCHAR(20) | UNIQUE, NOT NULL |
| email | VARCHAR(100) | UNIQUE, nullable |
| password_hash | TEXT | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| cedula | VARCHAR(20) | UNIQUE, nullable |
| role | admin_role | NOT NULL |
| qr_code | VARCHAR(50) | UNIQUE, nullable |
| qr_key | TEXT | nullable |
| qr_version | INT | DEFAULT 1 |
| association_id | UUID | FK → auth.associations(id) |
| is_active | BOOLEAN | DEFAULT TRUE |
| deleted_at | TIMESTAMPTZ | soft delete |
| last_login_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | clock_timestamp() |
| updated_at | TIMESTAMPTZ | clock_timestamp() |

**`auth.associations`** — Cooperativas
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK, uuidv7() |
| name | VARCHAR(255) | UNIQUE, NOT NULL |
| rif | VARCHAR(20) | UNIQUE, NOT NULL |
| address | TEXT | nullable |
| phone | VARCHAR(20) | nullable |
| admin_id | UUID | FK → auth.admins(id) |
| is_active | BOOLEAN | DEFAULT TRUE |

**`auth.sessions`** — Sesiones JWT activas
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK, uuidv7() |
| user_id | UUID | NOT NULL (polimórfica) |
| user_type | VARCHAR(20) | CHECK (admin, passenger) |
| client_type | VARCHAR(20) | CHECK (phone, web, tablet) |
| jwt_key | TEXT | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |

**`auth.driver_requests`** — KYC conductores
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| driver_id | UUID | FK → auth.admins(id) |
| association_id | UUID | FK → auth.associations(id) |
| status | driver_request_status | DEFAULT 'pending' |
| documents_urls | JSONB | nullable |
| rejection_reason | TEXT | nullable |

#### Schema `fin`

**`fin.wallets`** — Billeteras digitales
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| user_id | UUID | UNIQUE, NOT NULL (polimórfica) |
| balance | BIGINT | DEFAULT 0, CHECK >= 0 |
| debt_balance | BIGINT | DEFAULT 0, CHECK >= 0 |
| credit_used | BOOLEAN | DEFAULT FALSE |
| currency | VARCHAR(3) | DEFAULT 'USD' |
| version | INT | DEFAULT 1 (OCC) |

**`fin.transactions`** — Historial inmutable
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| wallet_id | UUID | FK → fin.wallets(id) |
| type | transaction_type | NOT NULL |
| amount | BIGINT | CHECK >= 0 |
| status | transaction_status | DEFAULT 'pending' |
| reference | VARCHAR(255) | nullable |
| completed_at | TIMESTAMPTZ | nullable |

**`fin.coop_fares`** — Tarifarios por cooperativa
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| association_id | UUID | FK → auth.associations(id) |
| name | VARCHAR(100) | NOT NULL |
| base_amount_usd | BIGINT | CHECK >= 0 (centavos) |
| exchange_rate_id | UUID | FK → fin.exchange_rates(id) |
| surcharge_* | BIGINT | DEFAULTS 0 |

**`fin.exchange_rates`** — Tasas de cambio diarias
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| currency | VARCHAR(10) | NOT NULL |
| rate | NUMERIC(19,6) | CHECK > 0 |
| effective_date | DATE | DEFAULT CURRENT_DATE |

**`fin.saga_states`** — Estado de sagas transaccionales
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| transaction_id | UUID | FK → fin.transactions(id) |
| current_step | VARCHAR(50) | nullable |
| status | saga_status | DEFAULT 'pending' |
| payload | JSONB | nullable |
| retry_count | INT | DEFAULT 0 |

**`fin.rates_config`** — Configuración global de comisiones
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| commission_percentage | BIGINT | 0-10000 (base 10000) |
| base_fare_usd | BIGINT | DEFAULT 150 |
| indexed_to_dollar | BOOLEAN | DEFAULT FALSE |

#### Schema `ops`

**`ops.routes`** — Rutas de transporte
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| association_id | UUID | FK → auth.associations(id) |
| name | VARCHAR(255) | NOT NULL |
| coop_fare_id | UUID | FK → fin.coop_fares(id) |

**`ops.vehicles`** — Vehículos registrados
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| association_id | UUID | FK → auth.associations(id) |
| plate | VARCHAR(20) | UNIQUE, NOT NULL |
| capacity | INT | DEFAULT 15, CHECK > 0 |

**`ops.assigned_routes`** — Asignación diaria conductor-ruta
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| driver_id | UUID | FK → auth.admins(id) |
| route_id | UUID | FK → ops.routes(id) |
| vehicle_id | UUID | FK → ops.vehicles(id) |
| assigned_date | DATE | DEFAULT CURRENT_DATE |

#### Schema `trip`

**`trip.trips`** — Viajes con tracking
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| passenger_id | UUID | FK → auth.passengers(id) |
| driver_id | UUID | FK → auth.admins(id) |
| route_id | UUID | FK → ops.routes(id) |
| origin_geom | GEOGRAPHY(Point, 4326) | NOT NULL |
| dest_geom | GEOGRAPHY(Point, 4326) | NOT NULL |
| status | trip_status | DEFAULT 'requested' |
| fare | BIGINT | CHECK >= 0 |
| distance | DECIMAL(10,2) | CHECK >= 0 |
| duration | INT | CHECK >= 0 |

**`trip.payments`** — Pagos de viajes (1:1)
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| trip_id | UUID | UNIQUE, FK → trip.trips(id) |
| amount | BIGINT | CHECK >= 0 |
| method | payment_method | DEFAULT 'wallet' |
| status | payment_status | DEFAULT 'pending' |
| commission_bolo | BIGINT | DEFAULT 0 |

**`trip.gps_history`** — Tracking GPS (~1 punto/s)
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| trip_id | UUID | FK → trip.trips(id) |
| location | GEOGRAPHY(Point, 4326) | NOT NULL |
| speed | DECIMAL(5,2) | nullable |
| heading | INT | 0-360 |

#### Schema `audit`

**`audit.audit_log`** — Logs inmutables
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | UUID | PK |
| user_id | UUID | nullable (polimórfica) |
| action | VARCHAR(255) | NOT NULL |
| details | JSONB | nullable |
| ip_address | INET | nullable |
| user_agent | TEXT | nullable |

### 5.3 ENUMs (10)

| Schema | Nombre | Valores |
|--------|--------|---------|
| auth | `admin_role` | `'driver'`, `'association_admin'`, `'super_admin'` |
| auth | `passenger_category` | `'normal'`, `'student'`, `'elderly'` |
| auth | `driver_request_status` | `'pending'`, `'approved'`, `'rejected'` |
| trip | `trip_status` | `'requested'`, `'active'`, `'completed'`, `'cancelled'`, `'pending_credit'` |
| fin | `transaction_type` | `'deposit'`, `'withdrawal'`, `'refund'`, `'commission'`, `'adjustment'` |
| fin | `transaction_status` | `'pending'`, `'completed'`, `'failed'` |
| fin | `payment_method` | `'wallet'`, `'card'`, `'sms'` |
| fin | `payment_status` | `'pending'`, `'processing'`, `'completed'`, `'failed'`, `'refunded'` |
| fin | `saga_status` | `'pending'`, `'in_progress'`, `'completed'`, `'failed'`, `'compensating'`, `'compensated'` |

### 5.4 Índices (35+)

| Esquema | Índices destacados |
|---------|-------------------|
| auth | phone, email (partial), cedula, sessions (user_id, user_type), sessions (is_active partial) |
| fin | wallets (user_id INCLUDE balance, version), transactions (wallet_id, status, created_at DESC), exchange_rates (currency, effective_date UNIQUE) |
| ops | routes (association_id, coop_fare_id), vehicles (plate), assigned_routes (driver_id partial) |
| trip | trips (passenger_id, status), trips (origin_geom GIST), gps_history (location GIST, trip_id, recorded_at DESC) |
| audit | audit_log (user_id, action, created_at DESC) |

### 5.5 Triggers

```sql
-- Inmutabilidad de transacciones financieras
CREATE TRIGGER trg_immutable_transactions
    BEFORE UPDATE OR DELETE ON fin.transactions
    FOR EACH ROW EXECUTE FUNCTION prevent_modifications();

-- Inmutabilidad de logs de auditoría
CREATE TRIGGER trg_immutable_audit
    BEFORE UPDATE OR DELETE ON audit.audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_modifications();

-- Actualización automática de updated_at (todas las tablas)
-- Trigger dinámico: se aplica a TODAS las tablas con columna updated_at
```

### 5.6 Seeders

```sql
-- Super Admin por defecto
INSERT INTO auth.admins (phone, email, password_hash, full_name, role)
VALUES ('+584121234567', 'admin@bolo.com', crypt('admin123', gen_salt('bf', 10)), 'Super Admin BOLO', 'super_admin');

-- Wallet del Super Admin
INSERT INTO fin.wallets (user_id, balance, currency) SELECT id, 0, 'USD' FROM auth.admins WHERE role = 'super_admin';

-- Config inicial de comisiones (10%, $1.50 base)
INSERT INTO fin.rates_config (commission_percentage, base_fare_usd) VALUES (1000, 150);

-- Tasa de cambio VES inicial
INSERT INTO fin.exchange_rates (currency, rate) VALUES ('VES', 36.50);

-- Asociación de ejemplo y tarifario
INSERT INTO auth.associations (name, rif) VALUES ('Cooperativa Bolivariana', 'J-12345678-9');
INSERT INTO fin.coop_fares (...) VALUES (...);
```

---

## 6. Módulo Auth

**Estado:** ~85% completo | **Archivos:** 45 | **Tests:** 17

### 6.1 Entidades de Dominio (5)

| Entidad | Propósito | Factory Method |
|---------|-----------|----------------|
| `Passenger` | Usuario pasajero | `Passenger.create(data)` |
| `Admin` | Admin/conductor | `Admin.create(data)` |
| `Session` | Sesión JWT | `Session.create(data)` |
| `Association` | Cooperativa | `Association.create(data)` |
| `DriverRequest` | Solicitud KYC | `DriverRequest.create(data)` |

### 6.2 Casos de Uso (12 implementados)

| Caso de Uso | Input | Output | Validaciones Clave |
|-------------|-------|--------|-------------------|
| `CreatePassengerUseCase` | CreatePassengerDto | Passenger | Unicidad phone, email, cédula |
| `CreateAdminUseCase` | CreateAdminDto | Admin | Unicidad phone, email, cédula |
| `LoginPassengerUseCase` | phone, password, clientType | { accessToken, user } | bcrypt verify, isActive |
| `LoginAdminUseCase` | phone, password, clientType | { accessToken, user } | bcrypt verify, isActive |
| `GetPassengerProfileUseCase` | passengerId | Passenger profile | Existencia |
| `GetAdminProfileUseCase` | adminId | Admin profile (incluye qrCode) | Existencia |
| `UpdatePassengerUseCase` | passengerId, UpdatePassengerDto | Perfil actualizado | Unicidad condicional |
| `UpdateAdminUseCase` | adminId, UpdateAdminDto | Perfil actualizado | Unicidad condicional |
| `DeletePassengerUseCase` | passengerId | void | Soft delete |
| `DeleteAdminUseCase` | adminId | void | Soft delete |
| `ChangePassengerPasswordUseCase` | passengerId, ChangePasswordDto | void | Current password, matching |
| `ChangeAdminPasswordUseCase` | adminId, ChangePasswordDto | void | Current password, matching |

### 6.3 DTOs de Validación (6)

**CreatePassengerDto / CreateAdminDto:**
- `phone`: `@IsVenezuelanPhone()` — decorador personalizado que valida formato 04XX-XXXXXXX y +58
- `password`: `@MinLength(8)` + `@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)` — mayúscula, minúscula, número
- `email`: `@IsOptional()` + `@IsEmail({ require_tld: true })` — TLD obligatorio
- `cedula`: `@IsOptional()` + `@IsCedulaOrPassport()` — decorador personalizado

**ChangePasswordDto:**
- `currentPassword`: `@IsNotEmpty()`
- `newPassword`: mismas reglas que password
- `newPasswordConfirmation`: `@IsNotEmpty()`

### 6.4 Puertos (Interfaces de Repositorio)

| Puerto | Métodos |
|--------|---------|
| `PassengerRepositoryPort` | findByPhone, findById, save, softDelete, findByEmail, findByCedula, updateLastLogin |
| `AdminRepositoryPort` | findByPhone, findById, save, updateAssociationId, softDelete, findByEmail, findByCedula, updateLastLogin |
| `SessionRepositoryPort` | save, findActiveByUserAndClient, deactivateAllForUser, findById, deactivateExpired |
| `AssociationRepositoryPort` | findById, findByRif, save |
| `DriverRequestRepositoryPort` | findById, findByDriverAndAssociation, save |

### 6.5 Excepciones de Dominio

| Excepción | Código HTTP | Propósito |
|-----------|-------------|-----------|
| `UserAlreadyExistsException` | 409 Conflict | Duplicados (phone, email, cédula) |
| `InvalidCredentialsException` | 401 Unauthorized | Credenciales inválidas / usuario inactivo |
| `UserNotFoundException` | 404 Not Found | Usuario no existe |

### 6.6 Estrategia JWT (Per-Session Keys)

```typescript
// Flujo de login:
// 1. Verificar credenciales (bcrypt)
// 2. Desactivar sesiones anteriores del mismo usuario
// 3. Crear nueva sesión con jwtKey = randomUUID()
// 4. Firmar JWT con jwtKey de la sesión
// 5. Almacenar payload: { sub, phone, role, userType, sessionId }

// Flujo de validación (JwtStrategy):
// 1. Extraer token de Authorization: Bearer <token>
// 2. Decodificar payload sin verificar (solo para extraer sessionId)
// 3. Buscar sesión en auth.sessions por sessionId
// 4. Verificar isActive = true
// 5. Usar session.jwtKey como secretOrKeyProvider
// 6. Si firma OK → validate() construye req.user
```

---

## 7. Módulo Ops

**Estado:** ~40% completo | **Archivos:** 18 | **Tests:** 4

### 7.1 Implementado

| Funcionalidad | Endpoint | Guard |
|--------------|----------|-------|
| Crear asociación | `POST /ops/associations` | JwtAuth + Roles('association_admin') |
| Crear ruta | `POST /ops/routes` | JwtAuth + Roles('association_admin') |

### 7.2 No Implementado

- Gestión de conductores (CRUD)
- Gestión de vehículos (CRUD)
- Asignación de rutas a conductores
- Reportes de operaciones
- Geolocalización de flota

### 7.3 Validaciones de Negocio (CreateAssociationUseCase)

```
1. Admin existe y es association_admin  → ForbiddenException (403)
2. Admin no pertenece a otra asociación  → ConflictException (409)
3. RIF no está duplicado              → ConflictException (409)
4. Side effect: actualizar admin.associationId
```

### 7.4 Validaciones de Negocio (CreateRouteUseCase)

```
1. coopFareId existe y pertenece a la asociación → BadRequestException (400)
2. Crear ruta con associationId, name, coopFareId
```

---

## 8. Módulo Fin

**Estado:** ~25% completo | **Archivos:** 41 | **Tests:** 6

### 8.1 Implementado

| Funcionalidad | Endpoint | Guard |
|--------------|----------|-------|
| Crear wallet (manual) | `POST /fin/wallets` | JwtAuth + Roles(passenger) |
| Crear tarifario | `POST /fin/coop-fares` | JwtAuth + Roles(association_admin) |
| Creación automática de wallet | Al registrar usuario | — |

### 8.2 En Stub (solo JSDoc, sin implementación)

| Use Case | Archivo | Estado |
|----------|---------|--------|
| `DepositUseCase` | deposit.use-case.ts | Solo comentarios |
| `WithdrawUseCase` | withdraw.use-case.ts | Solo comentarios |
| `ProcessPaymentUseCase` | process-payment.use-case.ts | Solo comentarios (saga) |
| `GetBalanceUseCase` | get-balance.use-case.ts | Solo comentarios |

### 8.3 Value Objects

**`Money`** (fin/domain/value-objects):
```typescript
Money.fromCents(150, 'USD')      // $1.50
Money.fromDecimal(1.50, 'USD')    // $1.50
money.add(other)                   // misma moneda requerida
money.subtract(other)
money.multiply(1.5)
money.toDecimal()                  // centavos → decimal
```

### 8.4 Optimistic Concurrency Control (OCC)

```sql
-- Cada wallet tiene un campo version que se incrementa en cada UPDATE
-- Los casos de uso deben:
-- 1. Leer wallet (con balance y version actual)
-- 2. Calcular nuevo balance
-- 3. UPDATE wallets SET balance = X, version = version + 1
--    WHERE id = Y AND version = Z
-- Si version cambió entre lectura y escritura → conflicto (retry)
```

### 8.5 Saga Pattern (Propuesto, no implementado)

```
Pago de viaje:
  1. AUTH_HOLD → Reservar saldo
  2. DEBIT_WALLET → Descontar saldo
  3. RECORD_TRANSACTION → Registrar transacción
  4. NOTIFY_USER → Notificar pasajero
  5. RELEASE_HOLD → Liberar reserva

Compensación (si falla algún paso):
  Paso 5 falla → RELEASE_HOLD (retry)
  Paso 4 falla → RELEASE_HOLD + NOTIFY_USER retry
  Paso 3 falla → REVERT_TRANSACTION + RELEASE_HOLD
  Paso 2 falla → REVERT_DEBIT + RELEASE_HOLD
  Paso 1 falla → nada que compensar
```

---

## 9. Módulo Trip

**Estado:** ~5% | **Solo tablas en BD**

Pendiente de implementación:
- Entidades de dominio (Trip, Payment, GpsHistory)
- Casos de uso: iniciar viaje, finalizar viaje, cancelar viaje
- Tracking GPS con WebSockets
- Cálculo dinámico de tarifas
- Historial de posiciones GPS (alta frecuencia)
- Pagos por viaje
- Calificación conductor/pasajero

---

## 10. Módulo Audit

**Estado:** ~5% | **Solo tabla audit_log en BD**

Pendiente de implementación:
- Trigger INSERT-only (ya definido en init.sql)
- Entidad AuditEntry
- Repositorio AuditLogRepository
- Endpoints de consulta y exportación
- Integración con eventos de dominio

---

## 11. Frontend

### 11.1 Estructura de Rutas (12 rutas)

| Ruta | Página | Protegida | Rol Requerido |
|------|--------|-----------|---------------|
| `/` | HomePage | No | — |
| `/login` | PassengerLoginPage | No | — |
| `/admin/login` | AdminLoginPage | No | — |
| `/register` | RegisterPage | No | — |
| `/dashboard` | DashboardPage | Sí | Cualquiera |
| `/profile` | ProfilePage | Sí | Cualquiera |
| `/profile/password` | PasswordChangePage | Sí | Cualquiera |
| `/admin/create` | AdminCreatePage | Sí | super_admin |
| `/unauthorized` | UnauthorizedPage | No | — |
| `*` | NotFoundPage | No | — |

### 11.2 Componentes (6)

| Componente | Props | Campos |
|------------|-------|--------|
| `LoginForm` | onSubmit, isLoading, error | phone, password |
| `RegisterPassengerForm` | onSubmit, isLoading, error | fullName, phone, password, email, cedula, category |
| `CreateAdminForm` | onSubmit, isLoading, error, success | phone, fullName, password, email, cedula, role |
| `ProfileForm` | user, onSubmit, isLoading, error | fullName, email, cedula, category (solo pasajero) |
| `PasswordChangeForm` | onSubmit, isLoading, error, success | currentPassword, newPassword, newPasswordConfirmation |
| `EyeIcon` | open, size | SVG toggle ojo cerrado/abierto |

### 11.3 Hooks (7)

| Hook | Retorna | Uso |
|------|---------|-----|
| `useLogin(userType)` | { execute, isLoading, error } | Login + store token |
| `useRegisterPassenger()` | { execute, isLoading, error } | Register + auto-login |
| `useCreateAdmin()` | { execute, isLoading, error, success } | Crear admin (solo super_admin) |
| `useProfile()` | { profile, isLoading, error } | Fetch profile on mount |
| `useUpdateProfile()` | { execute, isLoading, error } | Update profile + store |
| `useChangePassword()` | { execute, isLoading, error, success } | Cambiar contraseña |
| `useDeleteAccount()` | STUB | Pendiente |

### 11.4 Estado Global (Zustand)

```typescript
interface AuthState {
  token: string | null;
  user: UserProfile | null;

  userType(): UserType | null;           // 'admin' | 'passenger' | null
  login(token: string, user: UserProfile): void;
  logout(): void;
  setUser(user: UserProfile): void;
}

// Persistencia: localStorage → key "auth-storage"
// Almacena: { token, user }
```

### 11.5 Cliente HTTP

```typescript
// apiClient<T>(endpoint, options?): Promise<T>
// - URL base: VITE_API_URL o http://localhost:3000
// - JWT injection: Authorization: Bearer <token>
// - Content-Type: application/json
// - Manejo de errores: ApiError(status, message)
// - Status 204: return undefined as T
```

### 11.6 Validación Frontend (Zod)

| Schema | Reglas |
|--------|--------|
| `phoneSchema` | Regex venezolano: `+58?0?(412\|414\|416\|424\|426\|422)\d{7}` |
| `cedulaBaseSchema` | V/E + 6-10 dígitos, o pasaporte 5-20 alfanumérico |
| `passwordSchema` | Min 8, mayúscula, minúscula, número |
| `loginSchema` | phone + password (non-empty) |
| `changePasswordSchema` | currentPassword + newPassword + confirmation (con .refine) |

---

## 12. Middleware Go

**Estado:** STUB (~30 líneas funcionales)

```go
// main.go — Solo dos endpoints:
app.Get("/", func(c *fiber.Ctx) error {       // { "middleware": "hello world" }
app.Get("/health", func(c *fiber.Ctx) error {  // { "status": "healthy" }
```

Funcionalidades pendientes para el API Gateway:
- Proxy reverso hacia la API NestJS
- Validación y cacheo de JWT en Redis
- Rate limiting distribuido
- Validación HMAC de QR
- CORS management
- WAF básico
- Métricas

---

## 13. Infraestructura Docker

### 13.1 Servicios

| Servicio | Imagen Base | Puertos | Dependencias | Límites |
|----------|-------------|---------|--------------|---------|
| `postgres` | postgres:18 + PostGIS | 5432 | — | 1 CPU, 512MB |
| `redis` | redis:7-alpine | 6379 | — | 0.5 CPU, 128MB |
| `api` | node:24-alpine | 3000 (expose) | postgres, redis | 2 CPU, 1.5GB |
| `middleware` | golang:1.25 | 8080 | redis, api | 0.5 CPU, 128MB |
| `frontend` | node:24-alpine (dev) | 5173 | middleware | 0.5 CPU, 256MB |
| `pgadmin` | dpage/pgadmin4 | 5050 | postgres | — |

### 13.2 Docker Secrets

```yaml
secrets:
  pg_password:      file: ./secrets/pg_password.txt
  redis_password:   file: ./secrets/redis_password.txt
  jwt_secret:       file: ./secrets/jwt_secret.txt
  qr_hmac_secret:   file: ./secrets/qr_hmac_secret.txt
  pgadmin_password: file: ./secrets/pgadmin_password.txt
```

Las aplicaciones leen los secretos desde `/run/secrets/*` usando el patrón `*_FILE`:
```
DB_PASSWORD_FILE=/run/secrets/pg_password
JWT_SECRET_FILE=/run/secrets/jwt_secret
```

### 13.3 Makefile

| Comando | Descripción |
|---------|-------------|
| `make init` | Genera secretos + construye imágenes |
| `make up` | Levanta todos los servicios |
| `make down` | Detiene servicios (conserva volúmenes) |
| `make restart` | Reinicia todos los servicios |
| `make logs` | Sigue logs de todos los servicios |
| `make ps` | Estado de los contenedores |
| `make shell-api` | Shell en contenedor API |
| `make shell-db` | psql directo en PostgreSQL |
| `make tools` | Levanta stack + pgAdmin |
| `make clean` | Borra contenedores e imágenes |
| `make nuke` | ⚠️ Borra TODO (incluye volúmenes) |

### 13.4 Orden de Arranque

```
postgres (healthy) ──→ api (healthy) ──→ middleware (healthy) ──→ frontend
redis (healthy)    ──→ api
                   ──→ middleware
```

---

## 14. Seguridad

### 14.1 Implementado

| Medida | Ubicación | Descripción |
|--------|-----------|-------------|
| JWT per-session keys | auth.sessions | Cada login genera clave única; revocación individual |
| bcrypt (costo 10) | CryptoService | Hashing de contraseñas con sal |
| Helmet | main.ts | HTTP security headers |
| ValidationPipe | main.ts | whitelist + forbidNonWhitelisted + transform |
| Rate limiting | ThrottlerModule | 5 req/min global (login: 100 — por corregir) |
| Guards JWT | JwtAuthGuard | Protección de rutas autenticadas |
| Guards de roles | RolesGuard + @Roles() | Control de acceso por rol |
| Redes segmentadas | docker-compose | 4 redes aisladas |
| Docker Secrets | secrets/ | Credenciales en archivos, chmod 600 |
| SCRAM-SHA-256 | pg_hba.conf | Autenticación fuerte PostgreSQL |
| Redis hardening | redis.conf | Comandos peligrosos deshabilitados |
| Soft delete | users.deleted_at | Borrado lógico de usuarios |
| OCC | wallets.version | Control concurrencia optimista |
| Tablas inmutables | triggers | fin.transactions, audit.audit_log |
| Custom validators | decorators | Teléfono venezolano, cédula/pasaporte |
| CORS | main.ts | Restringido a frontend origin |
| UUID v7 | IDs | Ordenable temporalmente, sin secuenciales |

### 14.2 Pendiente / Vulnerabilidades Conocidas

| ID | Vulnerabilidad | Criticidad | Solución |
|----|---------------|------------|----------|
| H1 | Dockerfile CMD incorrecto | **Crítica** | `node dist/main.js` en vez de `nest start --watch` |
| H2 | JwtModule secret: 'unused' | **Crítica** | Documentar o eliminar placeholder |
| H3 | Token JWT en localStorage | **Crítica** | Migrar a httpOnly cookies |
| H4 | Rate limit login: 100 req/min | **Alta** | Cambiar a 5 req/min o heredar valor global |
| H5 | console.log(token) en frontend | **Alta** | Eliminar línea de depuración |
| H6 | No revoca sesiones al cambiar password | **Alta** | DeactivateAllForUser en changePassword |
| H7 | AllExceptionsFilter no registrado | **Alta** | app.useGlobalFilters() |
| H8 | Sin cleanup de sesiones expiradas | **Media** | Cron job + cap de sesiones |
| H9 | JWT sin iss/aud/typ | **Media** | Validar en JwtStrategy.validate() |
| H10 | associationId no en JWT payload | **Media** | Incluir en payload de login admin |
| H11 | Wallet creation failure silencioso | **Media** | Hacer transaccional con rollback |
| H12 | Sin refresh tokens | **Media** | Implementar refresh token rotativo |
| H13 | CORS hardcoded | **Media** | Leer de variable de entorno |
| H14 | Sin sanitización XSS | **Baja** | DOMPurify + validación server-side |

---

## 15. Pruebas

### 15.1 Tests Unitarios (39 archivos, ~3,879 líneas)

| Módulo | Archivos | Cobertura |
|--------|----------|-----------|
| Auth - use cases | 12 | Todos los casos de uso |
| Auth - controllers | 2 | admin-auth, passenger-auth |
| Auth - repositories | 3 | admin, passenger, session |
| Auth - DTOs | 1 | login.dto |
| Ops - use cases | 2 | create-association, create-route |
| Ops - controllers | 1 | route.controller |
| Ops - DTOs | 2 | create-association, create-route |
| Ops - repositories | 1 | route.repository |
| Fin - use cases | 2 | create-wallet, create-coop-fare |
| Fin - controllers | 2 | wallet, coop-fare |
| Fin - DTOs | 2 | create-wallet, create-coop-fare |
| Fin - repositories | 2 | wallet, coop-fare |
| Fin - services | 1 | wallet.service |
| Shared | 4 | crypto, roles.guard, phone.vo, health, app |

### 15.2 Tests E2E

- Configuración presente: `api/test/jest-e2e.json`
- Sin tests implementados (archivo placeholder)

### 15.3 Postman

- 2 colecciones completas con flujos de auth, ops, fin
- Cubren: registro, login, perfiles, soft delete, validaciones, duplicados

---

## 16. API Reference

### 16.1 Endpoints Públicos

| Método | Ruta | Rate Limit | Descripción |
|--------|------|------------|-------------|
| `GET` | `/` | — | Health check básico (AppController) |
| `GET` | `/health` | — | Health check (HealthController) |
| `POST` | `/auth/passenger/register` | — | Registro de pasajero |
| `POST` | `/auth/passenger/login` | 100/min* | Login pasajero |
| `POST` | `/auth/admin/login` | 100/min* | Login administrador |

*\* Debería ser 5/min — ver hallazgo H4*

### 16.2 Endpoints Protegidos (JWT)

#### Auth Module

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `GET` | `/auth/passenger/profile` | — | Perfil pasajero |
| `PUT` | `/auth/passenger/profile` | — | Actualizar perfil |
| `PUT` | `/auth/passenger/password` | — | Cambiar contraseña |
| `DELETE` | `/auth/passenger/profile` | — | Eliminar cuenta (soft) |
| `GET` | `/auth/admin/profile` | super_admin, association_admin, driver | Perfil admin |
| `PUT` | `/auth/admin/profile` | super_admin, association_admin, driver | Actualizar perfil |
| `PUT` | `/auth/admin/password` | super_admin, association_admin, driver | Cambiar contraseña |
| `DELETE` | `/auth/admin/profile` | super_admin, association_admin, driver | Eliminar cuenta (soft) |
| `POST` | `/auth/admin/create` | super_admin | Crear admin/conductor |

#### Ops Module

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `POST` | `/ops/associations` | association_admin | Crear cooperativa |
| `POST` | `/ops/routes` | association_admin | Crear ruta |

#### Fin Module

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| `POST` | `/fin/wallets` | passenger | Crear billetera |
| `GET` | `/fin/wallets/balance` | passenger | Consultar saldo |
| `POST` | `/fin/coop-fares` | association_admin | Crear tarifario |

### 16.3 Request/Response Ejemplos

#### Registro de Pasajero

```http
POST /auth/passenger/register
Content-Type: application/json

{
  "phone": "+584121234001",
  "password": "Passer123",
  "fullName": "Juan Pérez",
  "email": "juan@email.com",
  "cedula": "V-12345678",
  "category": "normal"
}

Response 201:
{
  "id": "0194f1e0-...",
  "phone": "+584121234001",
  "email": "juan@email.com",
  "fullName": "Juan Pérez",
  "cedula": "V-12345678",
  "category": "normal",
  "isActive": true,
  "createdAt": "2026-07-01T..."
}
```

#### Login de Administrador

```http
POST /auth/admin/login
Content-Type: application/json

{
  "phone": "+584121234567",
  "password": "admin123"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "0194f1e0-...",
    "phone": "+584121234567",
    "fullName": "Super Admin BOLO",
    "role": "super_admin"
  }
}
```

#### Crear Ruta

```http
POST /ops/routes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Ruta Centro - Este",
  "description": "Cubre principales avenidas",
  "coopFareId": "0194f1e2-..."
}

Response 201:
{
  "id": "0194f1e3-...",
  "associationId": "0194f1e1-...",
  "name": "Ruta Centro - Este",
  "description": "Cubre principales avenidas",
  "coopFareId": "0194f1e2-...",
  "isActive": true,
  "createdAt": "2026-07-01T...",
  "updatedAt": "2026-07-01T..."
}
```

---

## 17. Flujo de Autenticación

```
INICIO: Usuario intenta login
│
├─ ¿Teléfono válido? (IsVenezuelanPhone)
│  ├─ NO → Error 400
│  └─ SÍ → Continuar
│
├─ ¿Rate limiting permitido? (ThrottlerGuard)
│  ├─ NO → Error 429
│  └─ SÍ → Continuar
│
├─ ¿Usuario existe en BD?
│  ├─ NO → Error 401: "Credenciales inválidas"
│  └─ SÍ → Continuar
│
├─ ¿Contraseña coincide? (bcrypt.compare)
│  ├─ NO → Error 401: "Credenciales inválidas"
│  └─ SÍ → Continuar
│
├─ ¿Usuario está activo? (isActive = true)
│  ├─ NO → Error 401: "Usuario inactivo"
│  └─ SÍ → Continuar
│
├─ Desactivar sesiones anteriores del mismo usuario
│
├─ Crear nueva sesión:
│  ├─ jwtKey = randomUUID()
│  ├─ Session.create({ userId, userType, clientType, jwtKey })
│  └─ Guardar en auth.sessions
│
├─ Generar JWT:
│  ├─ sub: userId
│  ├─ phone: teléfono
│  ├─ role: rol
│  ├─ userType: admin/passenger
│  ├─ sessionId: session.id
│  └─ Firmar con jwtKey como secret
│
├─ Actualizar lastLoginAt
│
└─ RESPUESTA: { accessToken, user: { id, phone, fullName, role } }
```

---

## 18. Flujo de Autorización

```
INICIO: Request a endpoint protegido
│
├─ JwtAuthGuard.canActivate()
│  │
│  ├─ ¿Header Authorization presente?
│  │  ├─ NO → Error 401
│  │  └─ SÍ → Continuar
│  │
│  ├─ JwtStrategy.validate():
│  │  ├─ Decodificar payload (sin verificar)
│  │  ├─ Extraer sessionId
│  │  ├─ Buscar sesión en auth.sessions
│  │  ├─ ¿Sesión existe y isActive = true?
│  │  │  ├─ NO → Error 401: "Sesión inválida"
│  │  │  └─ SÍ → Usar session.jwtKey para verificar firma
│  │  │
│  │  ├─ ¿Firma JWT válida?
│  │  │  ├─ NO → Error 401: "Token inválido"
│  │  │  └─ SÍ → Construir req.user: { userId, phone, role, userType, sessionId }
│  │
│  └─ AUTENTICACIÓN OK → req.user poblado
│
├─ RolesGuard.canActivate()
│  │
│  ├─ Leer @Roles() del handler (metadatos)
│  ├─ ¿Roles requeridos?
│  │  ├─ NO → ACCESO PERMITIDO
│  │  └─ SÍ → Verificar req.user.role contra roles requeridos
│  │     ├─ ¿Coincide?
│  │     │  ├─ NO → Error 403: "Permisos insuficientes"
│  │     │  └─ SÍ → ACCESO PERMITIDO
│  │
│  └─ AUTORIZACIÓN OK
│
└─ EJECUTAR HANDLER
```

---

## 19. Roadmap

### Fase 0: Correcciones Inmediatas (Semana 1-2)

| Prioridad | Tarea | Esfuerzo |
|-----------|-------|----------|
| 🔴 P1 | Arreglar Dockerfile CMD production | 5 min |
| 🔴 P2 | Bajar rate limiting a 5 req/min | 1 min |
| 🔴 P3 | Eliminar console.log(token) | 1 min |
| 🔴 P4 | Registrar AllExceptionsFilter | 5 min |
| 🔴 P5 | Configurar CORS desde env vars | 10 min |
| 🔴 P6 | Agregar associationId a JWT payload | 15 min |
| 🟡 P7 | Revocar sesiones en changePassword | 2 h |
| 🟡 P8 | Migrar token de localStorage a cookie | 1 día |

### Fase 1: Completar Módulo Fin (Semanas 3-6)

- Implementar depósitos, retiros, balance
- Implementar sagas de transacciones
- Implementar comisiones BOLOS
- Tests de integración financieros

### Fase 2: Implementar Módulo Trip (Semanas 7-12)

- Entidades y casos de uso de viajes
- Tracking GPS con WebSockets
- Cálculo dinámico de tarifas
- Pagos por viaje e integración con fin

### Fase 3: Implementar Módulo Audit (Semanas 13-15)

- Logging de acciones sensibles
- Endpoints de consulta y exportación
- Integración con eventos de dominio

### Fase 4: Go Middleware y Producción (Semanas 16-20)

- API Gateway funcional (proxy, JWT, rate limiting)
- Monitoreo (Prometheus + Grafana)
- Logs centralizados (ELK/Loki)
- Tests de carga (k6)
- Pentesting externo
- Hardening de producción

---

## Apéndices

### A. Dependencias npm (api)

**Producción:**
`@nestjs/*`, `passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`, `helmet`, `pg`, `typeorm`, `ioredis`, `winston`, `dotenv`, `rxjs`, `reflect-metadata`, `@nestjs/swagger` (instalado, no configurado)

**Desarrollo:**
`jest`, `supertest`, `ts-jest`, `eslint`, `prettier`, `typescript`, `@types/*`

### B. Dependencias npm (frontend)

**Producción:** `react`, `react-dom`, `react-router-dom`, `react-hook-form`, `@hookform/resolvers`, `zustand`, `zod`

**Desarrollo:** `vite`, `@vitejs/plugin-react`, `typescript`, `eslint`, `@types/react`, `@types/react-dom`

### C. Dependencias Go (middleware)

`github.com/gofiber/fiber/v2`

### D. Variables de Entorno

```ini
# .env (NO sensible)
POSTGRES_DB=bolo
POSTGRES_USER=bolo_admin
PGADMIN_EMAIL=admin@bolo.com
API_PORT=3000
MIDDLEWARE_PORT=8080
FRONTEND_PORT=5173
NODE_ENV=development
LOG_LEVEL=info
```

### E. Archivos de Secretos

```bash
secrets/
├── pg_password.txt        # 20 bytes hex
├── redis_password.txt     # 20 bytes hex
├── jwt_secret.txt         # 32 bytes hex
├── qr_hmac_secret.txt     # 32 bytes hex
└── pgadmin_password.txt   # 16 bytes hex
```

### F. Códigos de Error HTTP Utilizados

| Código | Uso |
|--------|-----|
| 200 | Success (GET, PUT, POST login) |
| 201 | Created (POST register, create) |
| 204 | No Content (DELETE, PUT password) |
| 400 | Bad Request (validación DTO, negocio) |
| 401 | Unauthorized (credenciales, token) |
| 403 | Forbidden (rol insuficiente) |
| 404 | Not Found (recurso no existe) |
| 409 | Conflict (duplicado) |
| 429 | Too Many Requests (rate limiting) |
| 500 | Internal Server Error |

---

*Documentación generada el 1 de julio de 2026 — Proyecto BOLOS v0.1.0*
