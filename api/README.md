# BOLO — API Backend (NestJS Monolítico)

API principal del sistema BOLO, una plataforma integral de transporte de pasajeros con tracking GPS, billetera digital y pagos.

## Stack

| Componente | Versión        |
| ---------- | -------------- |
| Node.js    | 24 Alpine      |
| NestJS     | ^11.0          |
| TypeScript | ^5.7           |
| TypeORM    | ^1.0           |
| PostgreSQL | 18 + PostGIS 3 |
| Redis      | 7 Alpine       |
| JWT        | passport-jwt   |

## Arquitectura

### Hexagonal (Puertos y Adaptadores)

```
src/
├── shared/           # Código común transversal
├── modules/
│   ├── auth/         # Autenticación y usuarios
│   │   ├── domain/          # Entidades, puertos, excepciones
│   │   ├── application/     # Casos de uso, DTOs internos
│   │   ├── infrastructure/  # ORM, repositorios, JWT, servicios
│   │   └── interfaces/      # Controladores REST, DTOs validación
│   ├── fin/          # Billetera, transacciones, tarifas 🔄
│   ├── ops/          # Rutas, vehículos, asignaciones 🔄
│   ├── trip/         # Viajes, GPS, tracking ⏳
│   └── audit/        # Logs inmutables ⏳
└── main.ts
```

### Estado de Implementación

| Módulo | Estado                                       |
| ------ | -------------------------------------------- |
| shared | ✅ Capa completa                             |
| auth   | ✅ Domain + App + Infra + Interfaces         |
| fin    | 🔄 Wallet, CoopFare, ExchangeRate (parcial)  |
| ops    | 🔄 Route entity, módulo básico (en progreso) |
| trip   | ⏳ Stub (pendiente)                          |
| audit  | ⏳ Stub (pendiente)                          |

### Endpoints Funcionales

| Método | Ruta              | Auth | Descripción                        |
| ------ | ----------------- | ---- | ---------------------------------- |
| GET    | /                 | No   | Healthcheck raíz                   |
| GET    | /health           | No   | Healthcheck Terminus               |
| POST   | /auth/register    | No   | Registro de usuario                |
| POST   | /auth/login       | No   | Inicio de sesión (JWT)             |
| GET    | /auth/profile     | JWT  | Perfil del usuario aut.            |
| GET    | /users/:id        | No   | Buscar usuario (placeholder)       |
| GET    | /associations/:id | No   | Buscar asociación (placeholder)    |
| POST   | /associations     | No   | Crear asociación (placeholder)     |
| POST   | /fin/wallets      | JWT  | Crear billetera digital            |
| POST   | /fin/coop-fares   | JWT  | Crear tarifario (admin asociación) |
| POST   | /ops/routes       | JWT  | Crear ruta (admin asociación)      |
| POST   | /ops/associations | JWT  | Crear sub-asociación (admin)       |

### Esquemas de Base de Datos

| Schema | Tabla                                                          | Módulo   |
| ------ | -------------------------------------------------------------- | -------- |
| auth   | users, associations, driver_requests                           | auth     |
| ops    | routes, vehicles, assigned_routes                              | ops 🔄   |
| fin    | exchange_rates, coop_fares, wallets, transactions, saga_states | fin 🔄   |
| trip   | trips, payments, gps_history                                   | trip ⏳  |
| audit  | audit_log                                                      | audit ⏳ |

## Scripts

```bash
npm run build          # Compilar TypeScript
npm run start          # Iniciar servidor
npm run start:dev      # Desarrollo con hot-reload
npm run test           # Tests unitarios
npm run test:e2e       # Tests end-to-end
npm run lint           # ESLint
npm run format         # Prettier
```

## Variables de Entorno

Ver `src/.env` para desarrollo local. En Docker, usar secrets montados en `/run/secrets/`.

| Variable    | Requerida | Default       | Descripción             |
| ----------- | --------- | ------------- | ----------------------- |
| DB_HOST     | No        | localhost     | Host PostgreSQL         |
| DB_PORT     | No        | 5432          | Puerto PostgreSQL       |
| DB_NAME     | No        | bolo          | Nombre de base de datos |
| DB_USER     | No        | postgres      | Usuario de BD           |
| DB_PASSWORD | No        | (vacio)       | Contraseña de BD        |
| JWT_SECRET  | No        | defaultSecret | Secreto para firmar JWT |
| REDIS_HOST  | No        | localhost     | Host de Redis           |
| REDIS_PORT  | No        | 6379          | Puerto de Redis         |
