# BOLO — API Backend (NestJS Monolítico)

API principal del sistema BOLO, una plataforma integral de transporte de pasajeros con tracking GPS, billetera digital y pagos.

## Stack

| Componente  | Versión           |
|-------------|-------------------|
| Node.js     | 24 Alpine         |
| NestJS      | ^11.0             |
| TypeScript  | ^5.7              |
| TypeORM     | ^1.0              |
| PostgreSQL  | 18 + PostGIS 3    |
| Redis       | 7 Alpine          |
| JWT         | passport-jwt      |

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
│   ├── fin/          # Billetera, transacciones, tarifas (parcial)
│   ├── trip/         # Viajes, GPS, tracking (pendiente)
│   ├── ops/          # Rutas, vehículos (pendiente)
│   └── audit/        # Logs inmutables (pendiente)
└── main.ts
```

### Estado de Implementación

| Módulo | Estado         |
|--------|----------------|
| shared | ✅ Capa completa |
| auth   | ✅ Domain + App + Infra + Interfaces |
| fin    | ⚠️ Wallet entity + ORM (falta servicio real) |
| trip   | ❌ Stub         |
| ops    | ❌ Stub         |
| audit  | ❌ Stub         |

### Endpoints Funcionales

| Método | Ruta              | Auth     | Descripción                |
|--------|-------------------|----------|----------------------------|
| GET    | /                 | No       | Healthcheck raíz           |
| GET    | /health           | No       | Healthcheck Terminus       |
| POST   | /auth/register    | No       | Registro de usuario        |
| POST   | /auth/login       | No       | Inicio de sesión (JWT)     |
| GET    | /auth/profile     | JWT      | Perfil del usuario aut.    |
| GET    | /users/:id        | No       | Buscar usuario (placeholder) |
| GET    | /associations/:id | No       | Buscar asociación (placeholder) |
| POST   | /associations     | No       | Crear asociación (placeholder) |

### Esquemas de Base de Datos

| Schema | Tabla              | Módulo |
|--------|--------------------|--------|
| auth   | users, associations, driver_requests | auth |
| ops    | routes, vehicles, assigned_routes | ops (pendiente) |
| fin    | exchange_rates, coop_fares, wallets, transactions, saga_states | fin |
| trip   | trips, payments, gps_history | trip (pendiente) |
| audit  | audit_log          | audit (pendiente) |

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

| Variable         | Requerida | Default   | Descripción              |
|------------------|-----------|-----------|--------------------------|
| DB_HOST          | No        | localhost | Host PostgreSQL          |
| DB_PORT          | No        | 5432      | Puerto PostgreSQL        |
| DB_NAME          | No        | bolo      | Nombre de base de datos  |
| DB_USER          | No        | postgres  | Usuario de BD            |
| DB_PASSWORD      | No        | (vacio)   | Contraseña de BD         |
| JWT_SECRET       | No        | defaultSecret | Secreto para firmar JWT |
| REDIS_HOST       | No        | localhost | Host de Redis            |
| REDIS_PORT       | No        | 6379      | Puerto de Redis          |
