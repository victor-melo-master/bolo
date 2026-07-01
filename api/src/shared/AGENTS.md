# AGENTS — Módulo Compartido (Shared)

## Propósito
Código transversal usado por todos los módulos: infraestructura base, seguridad, logging, caché, validación.

## Estado
✅ Completo — 20+ archivos.

## Componentes

### Infraestructura
| Componente | Archivo | Propósito |
|-----------|---------|-----------|
| TypeORM Config | `infrastructure/database/typeorm.config.ts` | Conexión PostgreSQL, entidades, logging |
| Redis Client | `infrastructure/redis/redis.client.ts` | Singleton ioredis |
| Winston Logger | `infrastructure/logger/winston.logger.ts` | Logging estructurado |
| SharedModule | `infrastructure/shared.module.ts` | Exporta CryptoService, Redis, Logger |

### Seguridad
| Componente | Archivo | Propósito |
|-----------|---------|-----------|
| RolesGuard | `infrastructure/auth/roles.guard.ts` | `@Roles()` decorator basado en X-User-Role header |
| JwtAuthGuard | (en auth module) | Validación JWT global |

### Decorators
| Decorator | Archivo | Propósito |
|-----------|---------|-----------|
| `@CurrentUser()` | `interfaces/decorators/current-user.decorator.ts` | Extrae user-id del request |
| `@Roles(...)` | `interfaces/decorators/roles.decorator.ts` | Restringe por rol |
| `@IsVenezuelanPhone()` | `interfaces/decorators/is-venezuelan-phone.decorator.ts` | Valida +58412... |
| `@IsCedulaOrPassport()` | `interfaces/decorators/is-cedula-or-passport.decorator.ts` | Valida V-/E-/P- |

### Filtros y Middleware
| Componente | Archivo | Propósito |
|-----------|---------|-----------|
| AllExceptionsFilter | `interfaces/filters/all-exceptions.filter.ts` | Error response uniforme |
| LoggingMiddleware | `interfaces/middleware/logging.middleware.ts` | Request logging |

### Application Services
| Servicio | Archivo | Propósito |
|---------|---------|-----------|
| CryptoService | `application/services/crypto.service.ts` | bcrypt hash + compare |

### Domain
| Componente | Archivo | Propósito |
|-----------|---------|-----------|
| BaseEntity | `domain/base.entity.ts` | id, createdAt, updatedAt base |
| BaseRepositoryPort | `domain/interfaces/base-repository.port.ts` | CRUD genérico |
| PhoneVO | `domain/value-objects/phone.vo.ts` | Validación formato teléfono VE |
| EmailVO | `domain/value-objects/email.vo.ts` | Validación email |
| MoneyVO | `domain/value-objects/money.vo.ts` | Montos inmutables en centavos |

### Application Ports
| Puerto | Archivo | Propósito |
|--------|---------|-----------|
| ICachePort | `application/ports/cache.port.ts` | Abstracción Redis |
| ILoggerPort | `application/ports/logger.port.ts` | Abstracción logging |
