# AGENTS — Módulo Auth

## Propósito
Autenticación y gestión de usuarios: pasajeros, administradores, conductores, asociaciones, sesiones JWT.

## Estado
✅ Completo — 35 archivos, 10 spec files, todos los casos de uso implementados.

## Entidades de dominio (5)
| Entidad | Esquema BD | Propósito |
|---------|-----------|-----------|
| `PassengerEntity` | `auth.passengers` | Usuarios finales, login por teléfono, categoría tarifaria |
| `AdminEntity` | `auth.admins` | Admins/conductores, roles (driver, association_admin, super_admin), QR |
| `AssociationEntity` | `auth.associations` | Cooperativas, RIF, admin asignado |
| `SessionEntity` | `auth.sessions` | Sesiones JWT por dispositivo + user_type, clave rotativa |
| `DriverRequestEntity` | `auth.driver_requests` | KYC de conductores, status (pending/approved/rejected) |

## Casos de uso implementados
- CreatePassengerUseCase / CreateAdminUseCase
- LoginPassengerUseCase / LoginAdminUseCase
- GetPassengerProfileUseCase / GetAdminProfileUseCase
- UpdatePassengerUseCase / UpdateAdminUseCase
- DeletePassengerUseCase / DeleteAdminUseCase (soft delete)
- ChangePassengerPasswordUseCase / ChangeAdminPasswordUseCase

## Endpoints REST
| Método | Ruta | Controlador |
|--------|------|-------------|
| POST | `/auth/passengers/register` | PassengerAuthController |
| POST | `/auth/passenger/login` | PassengerAuthController |
| GET | `/auth/passenger/profile` | PassengerAuthController |
| PUT | `/auth/passenger/profile` | PassengerAuthController |
| DELETE | `/auth/passenger/profile` | PassengerAuthController |
| POST | `/auth/passenger/change-password` | PassengerAuthController |
| POST | `/auth/admins/register` | AdminAuthController |
| POST | `/auth/admin/login` | AdminAuthController |
| GET | `/auth/admin/profile` | AdminAuthController |
| PUT | `/auth/admin/profile` | AdminAuthController |
| DELETE | `/auth/admin/profile` | AdminAuthController |
| POST | `/auth/admin/change-password` | AdminAuthController |

## Puertos (interfaces)
- `PASSENGER_REPOSITORY_PORT` → PassengerRepositoryImpl
- `ADMIN_REPOSITORY_PORT` → AdminRepositoryImpl
- `SESSION_REPOSITORY_PORT` → SessionRepositoryImpl
- `ASSOCIATION_REPOSITORY_PORT` → AssociationRepositoryImpl
- `DRIVER_REQUEST_REPOSITORY_PORT` → DriverRequestRepositoryImpl
- `NOTIFICATION_SERVICE_PORT` → NotificationServiceImpl

## Estructura de archivos
```
auth/
├── domain/entities/          5 entidades puras
├── domain/interfaces/        5 ports + 2 service ports
├── domain/exceptions/        3 excepciones
├── application/dto/          5 DTOs
├── application/use-cases/    12 casos de uso (+ specs)
├── infrastructure/           auth.module.ts, JWT strategy+guard, ORM entities, repos
├── interfaces/rest/          PassengerAuthController + AdminAuthController
```

## Seguridad
- JWT con clave rotativa por sesión (no global)
- bcrypt via pgcrypto (BD) + CryptoService (aplicación)
- RolesGuard: `@Roles('super_admin', 'association_admin')`
- Soft delete (`deleted_at`), sesiones expirables
- SessionCleanupService (cron) limpia sesiones vencidas cada hora

## Tests
```bash
npx jest src/modules/auth/application/use-cases/create-passenger.use-case.spec.ts
npx jest src/modules/auth  # todos los tests de auth
```
