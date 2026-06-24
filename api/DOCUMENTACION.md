# DOCUMENTACIÓN DETALLADA — BOLO API

> Cada archivo se documenta con su **ruta relativa** desde `src/`, explicando **qué** hace cada bloque de código y **por qué** está ahí.

---

## `src/main.ts` — Punto de entrada (bootstrap)

```typescript
import 'dotenv/config';                        // Carga .env ANTES que nada para que todas las variables de entorno estén disponibles
import { NestFactory } from '@nestjs/core';    // Fábrica que crea el contenedor IoC de NestJS
import { AppModule } from './app.module';      // Módulo raíz que importa toda la app

async function bootstrap() {                   // Función asíncrona auto-ejecutada
  const app = await NestFactory.create(AppModule);  // Crea la app NestJS compilando el módulo raíz y todas sus dependencias
  await app.listen(process.env.PORT ?? 3000);       // Escucha en el puerto de la variable PORT, o 3000 por defecto
}
bootstrap();                                   // Ejecuta el bootstrap
```

**¿Por qué?**: `dotenv` debe cargarse antes de NestFactory para que las variables de entorno estén disponibles durante la inicialización del contenedor (TypeORM, JWT, etc.).

---

## `src/app.module.ts` — Módulo raíz

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),  // Carga .env y lo hace global para no repetirlo en cada módulo
    TypeOrmModule.forRoot(typeOrmConfig),                           // Configura TypeORM con PostgreSQL usando la configuración compartida
    AuthModule,                                                      // Módulo de autenticación (usuarios, login, JWT)
    // FinModule, TripModule, AuditModule (comentados — pendientes de implementar)
  ],
  controllers: [AppController],   // Controlador raíz (GET /)
  providers: [AppService],        // Servicio raíz
})
```

**¿Por qué?**: `ConfigModule.forRoot({ isGlobal: true })` evita tener que importar ConfigModule en cada submódulo. TypeORM se configura a nivel raíz porque la conexión a BD es única.

---

## `src/app.controller.ts` — Controlador raíz

```typescript
@Controller()                    // Prefijo vacío → responde en /
export class AppController {
  constructor(private readonly appService: AppService) {}  // Inyección de dependencia del servicio

  @Get()                         // GET /
  getHello(): string {
    return this.appService.getHello();  // Delega la respuesta al servicio
  }
}
```

**¿Por qué?**: Separar controlador de servicio permite testear la lógica sin el decorador HTTP. El controlador es solo un adaptador HTTP.

---

## `src/app.service.ts` — Servicio raíz

```typescript
@Injectable()                    // Decorador que permite inyectar esta clase en otros componentes
export class AppService {
  getHello(): string {
    return 'Hello World!';       // Placeholder: será reemplazado por Swagger o redirección
  }
}
```

**¿Por qué?**: `@Injectable()` registra la clase en el contenedor de IoC de NestJS para que pueda ser inyectada donde se declare.

---

## `src/health.controller.ts` — Healthcheck

```typescript
@Controller('health')            // Prefijo /health
export class HealthController {
  constructor(private health: HealthCheckService) {}  // Servicio de Terminus para healthchecks

  @Get()
  @HealthCheck()                 // Decorador que formatea la respuesta de healthcheck
  check() {
    return this.health.check([]);  // Array vacío = sin indicadores registrados (solo reporta estado genérico)
  }
}
```

**¿Por qué?**: Docker Compose y el middleware Go Fiber usan este endpoint para verificar que la API está viva antes de enrutar tráfico.

---

## `src/app.controller.spec.ts` — Test del controlador raíz

```typescript
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();                                   // Compila un módulo de testing aislado (sin infraestructura real)
    appController = app.get<AppController>(AppController);  // Obtiene la instancia del controlador desde el contenedor de testing
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');  // Verifica que el endpoint raíz devuelva el mensaje esperado
    });
  });
});
```

**¿Por qué?**: `Test.createTestingModule` crea un módulo NestJS mínimo para testing sin necesidad de arrancar el servidor. Verifica que el controlador y el servicio estén correctamente conectados.

---

## `src/health.controller.spec.ts` — Test del healthcheck

```typescript
describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;  // Mock tipado del servicio

  beforeEach(() => {
    healthCheckService = {      // Mock manual del HealthCheckService
      check: jest.fn(),         // Simula el método check()
    } as any;
    controller = new HealthController(healthCheckService);  // Inyecta el mock

  it('should return health check result', async () => {
    const mockResult = { status: 'ok', details: {} };
    healthCheckService.check.mockResolvedValue(mockResult);   // Simula respuesta exitosa

    const result = await controller.check();

    expect(result).toEqual(mockResult);
    expect(healthCheckService.check).toHaveBeenCalledWith([]);  // Verifica que se llamó sin argumentos
  });
});
```

**¿Por qué?**: Se usa mock en lugar del módulo de testing NestJS porque HealthCheckService es de una librería externa (Terminus). Se mockea manualmente para aislar el test.

---

## `src/.env` — Variables de entorno locales

Archivo con variables para desarrollo local (no se incluye su contenido por seguridad).

**¿Por qué?**: NestJS usa `ConfigModule` para leer este archivo y exponer las variables mediante `ConfigService`.

---

# SHARED — Código común transversal

---

## `src/shared/domain/base.entity.ts` — Entidad base abstracta

```typescript
export abstract class BaseEntity {
  id: string;          // UUID v7 — identificador único universal
  createdAt: Date;     // Timestamp de creación (clock_timestamp() en PostgreSQL)
  updatedAt: Date;     // Timestamp de última modificación

  constructor(id: string) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
```

**¿Por qué?**: Clase abstracta para que todas las entidades de dominio compartan campos auditables. Se usa herencia en lugar de composición para asegurar que toda entidad tenga estos campos. NOTA: Las entidades actuales (User, Association, etc.) NO extienden BaseEntity (probablemente por refactor pendiente).

---

## `src/shared/domain/interfaces/base-repository.port.ts` — Puerto genérico de repositorio

```typescript
export interface IBaseRepository<T> {  // Interfaz genérica con tipo T (la entidad de dominio)
  findById(id: string): Promise<T | null>;   // Buscar por UUID
  findAll(): Promise<T[]>;                    // Obtener todos
  create(entity: T): Promise<T>;              // Crear nuevo
  update(id: string, entity: Partial<T>): Promise<T>;  // Actualizar parcialmente
  delete(id: string): Promise<void>;          // Eliminar (soft-delete según implementación)
}
```

**¿Por qué?**: Puerto genérico que define el contrato mínimo de cualquier repositorio. Cada módulo lo extiende con métodos específicos (findByPhone, findByRif, etc.). Sigue el patrón Puertos-Adaptadores.

---

## `src/shared/domain/exceptions/not-found.exception.ts` — Excepción 404

```typescript
export class NotFoundException extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundException';  // Nombre personalizado para identificar en filtros
  }
}
```

**¿Por qué?**: Excepción de dominio que el filtro global traduce a HTTP 404. Separar del `NotFoundException` de NestJS mantiene el dominio puro (sin dependencias de framework).

---

## `src/shared/domain/exceptions/unauthorized.exception.ts` — Excepción 401

```typescript
export class UnauthorizedException extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}
```

**¿Por qué?**: Similar a NotFoundException, pero para errores de autenticación/autorización. Traducida a HTTP 401/403 por el filtro global.

---

## `src/shared/domain/value-objects/email.vo.ts` — Value Object Email (stub)

```typescript
// TODO: Implementar value object inmutable para direcciones de email.
// - Validar formato en construcción (regex RFC 5322 simplificado)
// - Normalizar a minúsculas
```

**¿Por qué?**: Stub preparado para implementar un VO de email. Los VOs son inmutables y auto-validados, lo que garantiza que nunca exista un email inválido en el dominio.

---

## `src/shared/domain/value-objects/money.vo.ts` — Value Object Money (stub)

```typescript
// TODO: Implementar value object inmutable para manejo de montos.
// - Almacenar en centavos (BIGINT) para evitar errores de precisión
```

**¿Por qué?**: Los montos financieros nunca deben manejarse como floats (pérdida de precisión). Este VO almacenará en centavos y proveerá operaciones aritméticas seguras.

---

## `src/shared/domain/value-objects/phone.vo.ts` — Value Object Phone (stub)

```typescript
// TODO: Implementar value object inmutable para números de teléfono.
// - Validar formato E.164 (+584121234567)
```

**¿Por qué?**: Validación y normalización centralizada de números telefónicos. E.164 es el estándar internacional.

---

## `src/shared/application/ports/cache.port.ts` — Puerto de caché

```typescript
export interface ICache {
  get(key: string): Promise<string | null>;          // Obtener valor por clave
  set(key: string, value: string, ttl?: number): Promise<void>;  // Guardar con TTL opcional
  del(key: string): Promise<void>;                   // Eliminar clave
  delPattern(pattern: string): Promise<void>;         // Eliminar por patrón (ej: "sessions:*")
  flushAll(): Promise<void>;                          // Limpiar toda la caché
}
```

**¿Por qué?**: Define el contrato para el sistema de caché (Redis). `delPattern` es útil para invalidar grupos de claves relacionadas.

---

## `src/shared/application/ports/logger.port.ts` — Puerto de logger

```typescript
export interface ILogger {
  log(message: string, context?: string): void;       // Info
  error(message: string, trace?: string, context?: string): void;  // Error con stack trace
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;
}
```

**¿Por qué?**: Abstracción del logger para no acoplar el dominio a Winston u otra librería. `context` identifica el módulo/clase que origina el mensaje.

---

## `src/shared/application/services/crypto.service.ts` — Servicio de criptografía

```typescript
import * as bcrypt from 'bcrypt';  // Librería de hashing de contraseñas

export class CryptoService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);  // Genera sal con costo 10 (balance seguridad/rendimiento)
    return bcrypt.hash(password, salt);     // Retorna hash en formato $2b$10$...
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);  // Compara contraseña contra hash (extrae la sal del hash automáticamente)
  }
}
```

**¿Por qué?**: Servicio de aplicación (no de infraestructura) porque el hashing es lógica de negocio, no un adaptador externo. Costo 10 de bcrypt es el estándar recomendado.

---

## `src/shared/infrastructure/database/typeorm.config.ts` — Configuración TypeORM

```typescript
function readSecret(fileEnvKey: string, fallbackEnvKey?: string): string {
  const filePath = process.env[fileEnvKey];     // Busca variable que contiene RUTA a un archivo secreto
  if (filePath) {
    try {
      return readFileSync(filePath, 'utf8').trim();  // Lee el archivo (Docker Swarm/K8s montan secrets como archivos)
    } catch {
      console.error(`Error reading secret from ${filePath}`);
    }
  }
  return process.env[fallbackEnvKey ?? ''] ?? '';   // Fallback a variable de entorno directa (desarrollo local)
}

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',                   // Driver PostgreSQL
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: readSecret('DB_PASSWORD_FILE', 'DB_PASSWORD'),  // Intenta archivo secreto, luego variable
  database: process.env.DB_NAME ?? 'bolo',
  entities: [UserOrmEntity, AssociationOrmEntity, DriverRequestOrmEntity],  // Solo entidades registradas
  synchronize: false,                 // ¡Deshabilitado! Los cambios de esquema son manuales (init.sql)
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
};
```

**¿Por qué?**: `readSecret` permite usar secrets de Docker Swarm (archivos en `/run/secrets/`) en producción y variables de entorno en desarrollo. `synchronize: false` evita que TypeORM modifique el esquema automáticamente (podría borrar datos en producción).

---

## `src/shared/infrastructure/logger/winston.logger.ts` — Logger Winston

```typescript
export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',      // Nivel mínimo desde variable de entorno
      format: winston.format.combine(
        winston.format.timestamp(),                  // Añade timestamp ISO a cada log
        winston.format.json(),                       // Formato JSON estructurado
      ),
      transports: [
        new winston.transports.Console(),             // Salida a consola (stdout/stderr)
        new winston.transports.File({ filename: 'error.log', level: 'error' }),  // Solo errores
        new winston.transports.File({ filename: 'combined.log' }),               // Todos los niveles
      ],
    });
  }
  // Cada método delega al logger de Winston con el nivel correspondiente
}
```

**¿Por qué?**: Winston 3 permite múltiples transportes simultáneamente. JSON estructurado facilita el parsing por herramientas como Elasticsearch, Datadog, etc.

---

## `src/shared/infrastructure/redis/redis.client.ts` — Cliente Redis singleton

```typescript
export class RedisClient {
  private static instance: Redis;    // Variable estática para el singleton

  static getInstance(): Redis {
    if (!RedisClient.instance) {      // Si no existe instancia, la crea
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      });
    }
    return RedisClient.instance;      // Siempre retorna la misma instancia
  }
}
```

**¿Por qué?**: Patrón Singleton para reusar la misma conexión Redis en toda la app. ioredis maneja reconexión automática.

---

## `src/shared/interfaces/decorators/current-user.decorator.ts` — Decorador @CurrentUser

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();  // Obtiene el request HTTP del contexto de ejecución
    return request.user;                               // Retorna el objeto user inyectado por Passport tras validar JWT
  },
);
```

**¿Por qué?**: Evita escribir `@Request() req` y acceder a `req.user` manualmente. Mejora legibilidad y testabilidad.

---

## `src/shared/interfaces/decorators/roles.decorator.ts` — Decorador @Roles

```typescript
export const ROLES_KEY = 'roles';                                   // Clave para almacenar metadatos
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);  // Asigna roles como metadatos de la ruta
```

**¿Por qué?**: Los metadatos son leídos por un guard (RolesGuard, no implementado) para verificar que el usuario tenga uno de los roles permitidos.

---

## `src/shared/interfaces/filters/all-exceptions.filter.ts` — Filtro global de excepciones

```typescript
@Catch()                           // Atrapa TODAS las excepciones (sin filtro de tipo)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()                    // Si es HttpException, usa su código HTTP
      : HttpStatus.INTERNAL_SERVER_ERROR;        // Si no, 500

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),        // Momento exacto del error
      path: request.url,                           // Ruta que originó el error
      message,
    });
  }
}
```

**¿Por qué?**: Captura cualquier error no manejado y devuelve una respuesta JSON estandarizada. `@Catch()` sin argumentos atrapa todo, incluyendo errores inesperados.

---

## `src/shared/interfaces/middleware/logging.middleware.ts` — Middleware de logging HTTP

```typescript
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');       // Logger de NestJS con contexto "HTTP"

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();                  // Marca de tiempo inicial

    res.on('finish', () => {                   // Evento cuando la respuesta se envía
      const duration = Date.now() - start;     // Duración de la petición
      this.logger.log(`${method} ${originalUrl} ${res.statusCode} - ${duration}ms`);
    });

    next();                                    // Continúa al siguiente middleware/handler
  }
}
```

**¿Por qué?**: Logging asíncrono: no bloquea la respuesta. Se ejecuta cuando la respuesta termina, capturando el código de estado real.

---

# MÓDULO AUTH

---

## `src/modules/auth/index.ts` — Barrel exports del módulo auth

```typescript
export * from './domain/entities';        // User, Association, DriverRequest
export * from './domain/interfaces';      // Puertos (repositorios y servicios)
export * from './application/dto';        // CreateUserDto (DTO interno)
export * from './infrastructure/auth.module';  // Módulo NestJS de infraestructura
```

**¿Por qué?**: Barrel file para centralizar exports y simplificar importaciones desde otros módulos. Lo comentado está pendiente de implementación.

---

## `src/modules/auth/domain/entities/user.entity.ts` — Entidad User

```typescript
export type UserRole = 'passenger' | 'driver' | 'association_admin' | 'super_admin';
export type UserCategory = 'normal' | 'student' | 'elderly';

export class User {
  constructor(
    // Campos de identidad
    public readonly id: string,                  // UUID v7
    public readonly phone: string,               // Teléfono único (formato E.164)
    public readonly email: string | null,        // Email único nullable
    public readonly passwordHash: string,        // Hash bcrypt (nunca texto plano)
    public readonly fullName: string,            // Nombre completo
    public readonly cedula: string | null,       // Cédula venezolana (V-/E-)
    public readonly role: UserRole,              // Rol del usuario
    // Seguridad
    public readonly jwtKey: string | null,       // Clave de firma JWT (rota en cada login)
    // QR para identificación de conductores
    public readonly qrCode: string | null,       // Código QR único
    public readonly qrKey: string | null,        // Clave para encriptar datos del QR
    public readonly qrVersion: number,           // Versión del formato QR
    // Categoría y estado
    public readonly category: UserCategory,      // Categoría tarifaria
    public readonly studentDocApproved: boolean, // Documento estudiantil aprobado?
    public readonly isActive: boolean,           // Usuario activo?
    // Auditoría
    public readonly deletedAt: Date | null,      // Soft-delete
    public readonly lastLoginAt: Date | null,    // Último inicio de sesión
    public readonly createdAt: Date,             // Fecha de creación
    public readonly updatedAt: Date,             // Fecha de última modificación
  ) {}

  static create(data: /* ... */): User {         // Método de fábrica
    return new User(
      data.id ?? crypto.randomUUID(),            // Si no se provee ID, genera UUID aleatorio
      // ... con defaults sensatos (isActive: true, qrVersion: 1, etc.)
    );
  }
}
```

**¿Por qué?**: Entidad de dominio pura (POCO) sin decoradores. `readonly` hace que sea inmutable después de creada. `static create` es el método de fábrica que aplica defaults y reglas de construcción. La separación de roles y categorías permite tarifas diferenciadas.

---

## `src/modules/auth/domain/entities/association.entity.ts` — Entidad Association

```typescript
export class Association {
  constructor(
    public readonly id: string,                  // UUID v7
    public readonly name: string,                // Nombre único de la cooperativa
    public readonly rif: string,                 // RIF (registro fiscal venezolano, único)
    public readonly address: string | null,      // Dirección física
    public readonly phone: string | null,        // Teléfono de contacto
    public readonly adminId: string | null,      // ID del administrador (referencia a User)
    public readonly isActive: boolean,           // Cooperativa activa?
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
  // static create similar a User
}
```

**¿Por qué?**: Las cooperativas agrupan conductores y definen tarifarios. `adminId` referencia a un usuario con rol `association_admin`.

---

## `src/modules/auth/domain/entities/driver-request.entity.ts` — Solicitud de afiliación

```typescript
export type DriverRequestStatus = 'pending' | 'approved' | 'rejected';

export class DriverRequest {
  constructor(
    public readonly id: string,                  // UUID v7
    public readonly driverId: string,            // ID del conductor solicitante
    public readonly associationId: string,       // ID de la cooperativa destino
    public readonly status: DriverRequestStatus, // Estado actual
    public readonly documentsUrls: Record<string, any> | null,  // JSONB con URLs de documentos
    public readonly rejectionReason: string | null,             // Razón de rechazo (si aplica)
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
  // static create con status default 'pending'
}
```

**¿Por qué?**: Flujo de afiliación: conductor solicita unirse → admin revisa documentos → aprueba/rechaza. `documentsUrls` como JSONB permite flexibilidad en tipos de documentos.

---

## `src/modules/auth/domain/entities/index.ts` — Barrel de entidades

```typescript
export { User } from './user.entity';
export { Association } from './association.entity';
export { DriverRequest } from './driver-request.entity';
```

---

## `src/modules/auth/domain/exceptions/invalid-credentials.exception.ts` — Credenciales inválidas

```typescript
export class InvalidCredentialsException extends UnauthorizedException {  // Extiende HttpException de NestJS
  constructor(message: string = 'Credenciales inválidas') {
    super(message);
  }
}
```

**¿Por qué?**: Extiende `UnauthorizedException` de NestJS (HTTP 401) para que el framework la maneje automáticamente sin necesidad de un filtro específico.

---

## `src/modules/auth/domain/exceptions/user-already-exists.exception.ts` — Usuario duplicado

```typescript
export class UserAlreadyExistsException extends ConflictException {  // Extiende ConflictException (HTTP 409)
  constructor(message: string = 'El teléfono ya está registrado') {
    super(message);
  }
}
```

**¿Por qué?**: HTTP 409 Conflict es el código apropiado para violación de unicidad.

---

## `src/modules/auth/domain/exceptions/user-not-found.exception.ts` — Usuario no encontrado

```typescript
export class UserNotFoundException extends NotFoundException {  // Extiende NotFoundException de NestJS (HTTP 404)
  constructor(message: string = 'Usuario no encontrado') {
    super(message);
  }
}
```

---

## `src/modules/auth/domain/interfaces/repositories/user.repository.port.ts` — Puerto de repositorio de usuarios

```typescript
export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';  // Token de inyección (string único)

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;          // Buscar por UUID
  findByPhone(phone: string): Promise<User | null>;    // Buscar por teléfono (único)
  save(user: User): Promise<User>;                     // Persistir (insert o update)
  updateJwtKey(userId: string, jwtKey: string): Promise<void>;  // Rotar clave JWT
}
```

**¿Por qué?**: El token de inyección (`USER_REPOSITORY_PORT`) es un string para evitar conflictos con otras interfaces que puedan tener el mismo nombre de clase. El puerto define el contrato sin importar la implementación (TypeORM, mock, etc.).

---

## `src/modules/auth/domain/interfaces/repositories/association.repository.port.ts` — Puerto de asociaciones

```typescript
export interface AssociationRepositoryPort {
  findById(id: string): Promise<Association | null>;
  findByRif(rif: string): Promise<Association | null>;   // Búsqueda por RIF (único)
  save(association: Association): Promise<Association>;
}
```

---

## `src/modules/auth/domain/interfaces/repositories/driver-request.repository.port.ts` — Puerto de solicitudes

```typescript
export interface DriverRequestRepositoryPort {
  findById(id: string): Promise<DriverRequest | null>;
  findByDriverAndAssociation(driverId: string, associationId: string): Promise<DriverRequest | null>;  // Evita solicitudes duplicadas
  save(request: DriverRequest): Promise<DriverRequest>;
}
```

---

## `src/modules/auth/domain/interfaces/repositories/index.ts` — Barrel de repositorios

```typescript
export * from './user.repository.port';
export * from './association.repository.port';
export * from './driver-request.repository.port';
```

---

## `src/modules/auth/domain/interfaces/services/notification.service.port.ts` — Puerto de notificaciones

```typescript
export interface NotificationServicePort {
  sendEmail(to: string, subject: string, body: string): Promise<void>;  // Email
  sendSms(phone: string, message: string): Promise<void>;                // SMS
}
```

**¿Por qué?**: Define cómo el sistema se comunica con usuarios. La implementación puede ser SendGrid, Twilio, etc.

---

## `src/modules/auth/domain/interfaces/services/wallet.service.port.ts` — Puerto de billetera

```typescript
export interface WalletServicePort {
  createWallet(userId: string): Promise<void>;  // Crea billetera al registrar usuario
}
```

**¿Por qué?**: El módulo auth necesita crear una billetera al registrar un usuario, pero la implementación real está en el módulo fin. Este puerto desacopla ambos módulos.

---

## `src/modules/auth/domain/interfaces/services/index.ts` — Barrel de servicios

```typescript
export * from './notification.service.port';
export * from './wallet.service.port';
```

---

## `src/modules/auth/application/dto/create-user.dto.ts` — DTO interno para crear usuario

```typescript
export class CreateUserDto {
  phone: string;             // Teléfono obligatorio
  email?: string;            // Email opcional
  password: string;          // Contraseña en texto plano (se hashea en el use case)
  fullName: string;          // Nombre completo
  cedula?: string;           // Cédula opcional
  role: UserRole;            // Rol (enum)
  category: UserCategory;    // Categoría tarifaria (enum)
}
```

**¿Por qué?**: DTO de aplicación (sin decoradores) usado internamente entre el controlador y el caso de uso. No tiene decoradores de validación porque esos pertenecen a la capa de interfaces (RegisterDto). Esta separación evita acoplar la aplicación a librerías de validación.

---

## `src/modules/auth/application/dto/logint.dto.ts` — DTO de login (con typo histórico)

```typescript
export class LoginDto {
  phone: string;       // Teléfono
  password: string;    // Contraseña
}
```

**¿Por qué?**: Notar el nombre de archivo `logint.dto.ts` (typo histórico). Se mantiene por compatibilidad pero debería renombrarse a `login.dto.ts`.

---

## `src/modules/auth/application/dto/index.ts` — Barrel

```typescript
export { CreateUserDto } from './create-user.dto';
```

**¿Por qué?**: Solo exporta CreateUserDto. LoginDto no se exporta desde aquí porque se usa directamente en el controlador (importación directa desde interfaces/dto/login.dto.ts).

---

## `src/modules/auth/application/use-cases/create-user.use-case.ts` — Caso de uso: registro

```typescript
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
    //                                          ↑ Inyecta por token (permite cambiar implementación)
    private readonly cryptoService: CryptoService,      // Servicio de hashing
    @Optional()                                          // Opcional: puede no estar disponible
    @Inject(WALLET_SERVICE_PORT)
    private readonly walletService?: WalletServicePort, // Mock hasta implementar fin
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // 1. Verificar que el teléfono no exista (unicidad)
    const existing = await this.userRepo.findByPhone(dto.phone);
    if (existing) throw new UserAlreadyExistsException('User with this phone already exists');

    // 2. Hashear contraseña (nunca almacenar en texto plano)
    const hashedPassword = await this.cryptoService.hash(dto.password);

    // 3. Crear entidad User mediante fábrica (aplica defaults)
    const user = User.create({ /* ... datos del dto + hash */ });

    // 4. Persistir
    const savedUser = await this.userRepo.save(user);

    // 5. Crear billetera (si el servicio está disponible — opcional)
    if (this.walletService) {
      try {
        await this.walletService.createWallet(savedUser.id);
      } catch (error) {
        // No debe fallar el registro si la wallet falla
        console.error('Wallet creation failed:', error);
      }
    }

    return savedUser;
  }
}
```

**¿Por qué?**: 
- `@Inject(USER_REPOSITORY_PORT)` usa el token string en lugar del tipo para desacoplar.
- `@Optional()` en walletService permite que el módulo fin no esté implementado sin romper auth.
- El bloque try-catch en wallet asegura que un error en fin no impida el registro.
- La contraseña se hashea ANTES de crear la entidad por seguridad.

---

## `src/modules/auth/application/use-cases/login.use-case.ts` — Caso de uso: login

```typescript
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
    private readonly cryptoService: CryptoService,  // Para comparar contraseñas
    private readonly jwtService: JwtService,         // Para firmar token
  ) {}

  async execute(phone: string, password: string): Promise<{ accessToken: string; user: any }> {
    // 1. Buscar usuario por teléfono
    const user = await this.userRepo.findByPhone(phone);
    if (!user) throw new InvalidCredentialsException('Invalid credentials');

    // 2. Verificar contraseña contra hash almacenado
    const isValid = await this.cryptoService.compare(password, user.passwordHash);
    if (!isValid) throw new InvalidCredentialsException('Invalid credentials');

    // 3. Verificar que el usuario esté activo
    if (!user.isActive) throw new InvalidCredentialsException('User is inactive');

    // 4. Rotar clave JWT (nueva clave por cada login — invalida tokens anteriores)
    const newJwtKey = randomUUID();
    await this.userRepo.updateJwtKey(user.id, newJwtKey);

    // 5. Firmar token con payload estándar
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: { id: user.id, phone: user.phone, fullName: user.fullName, role: user.role },
    };
  }
}
```

**¿Por qué?**: 
- Se usan mensajes de error genéricos ("Invalid credentials") para no filtrar si el usuario existe o no (seguridad).
- Rotación de JWT key: cada login genera una nueva clave, invalidando tokens anteriores. Esto permite revocar sesiones.
- `InvalidCredentialsException` extiende `UnauthorizedException` (HTTP 401).

---

## `src/modules/auth/infrastructure/auth.module.ts` — Módulo de infraestructura

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, AssociationOrmEntity, DriverRequestOrmEntity]),
    //    ↑ Registra los repositorios TypeORM para estas entidades
    PassportModule.register({ defaultStrategy: 'jwt' }),  // Configura Passport con JWT por defecto
    JwtModule.register({
      secret: 'unused',  // No se usa porque cada token se firma con la clave del usuario
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController, UserController, AssociationController],
  providers: [
    CreateUserUseCase, LoginUseCase, CryptoService,
    { provide: USER_REPOSITORY_PORT, useClass: UserRepositoryImpl },     // Puerto → Implementación
    { provide: ASSOCIATION_REPOSITORY_PORT, useClass: AssociationRepositoryImpl },
    { provide: DRIVER_REQUEST_REPOSITORY_PORT, useClass: DriverRequestRepositoryImpl },
    { provide: NOTIFICATION_SERVICE_PORT, useClass: NotificationServiceImpl },
    { provide: WALLET_SERVICE_PORT, useValue: { createWallet: async () => {} } },  // Mock no-op
    JwtStrategy, JwtAuthGuard,
  ],
  exports: [ /* puertos, casos de uso, guards */ ],  // Exporta para que otros módulos los usen
})
```

**¿Por qué?**: Este módulo "ata" los puertos abstractos a implementaciones concretas (Dependency Injection). El mock de `WALLET_SERVICE_PORT` es un objeto literal en lugar de una clase completa. `JwtModule.register` con `secret: 'unused'` porque la estrategia personalizada usa la clave del usuario (jwtKey), no un secreto global.

---

## `src/modules/auth/infrastructure/auth/jwt.strategy.ts` — Estrategia JWT personalizada

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extrae token del header Authorization
      ignoreExpiration: false,                                     // Rechaza tokens expirados
      secretOrKeyProvider: (request, rawJwtToken, done) => {       // Proveedor DINÁMICO de clave secreta
        this.resolveSecretKey(rawJwtToken)
          .then((key) => done(null, key))
          .catch((err) => done(err));
      },
    });
  }

  private async resolveSecretKey(rawJwtToken: string): Promise<string> {
    // Decodifica el payload del token (sin verificar firma aún)
    const payload = JSON.parse(
      Buffer.from(rawJwtToken.split('.')[1], 'base64').toString(),
    );
    const userId: string = payload.sub;
    if (!userId) throw new Error('Token sin sub');

    // Busca al usuario y usa su jwtKey personal como SECRETO para verificar la firma
    const user = await this.userRepo.findById(userId);
    if (!user || !user.jwtKey) throw new Error('Usuario no encontrado o sin llave');

    return user.jwtKey;  // ← Clave secreta individual por usuario
  }

  validate(payload: any) {
    return { userId: payload.sub, phone: payload.phone, role: payload.role };  // Objeto inyectado en req.user
  }
}
```

**¿Por qué?**: Estrategia JWT personalizada que usa `secretOrKeyProvider` en lugar de `secretOrKey` estático. Cada usuario tiene su propia clave de firma (`jwtKey`), lo que permite invalidar tokens individualmente. Esto es más seguro que un secreto global.

---

## `src/modules/auth/infrastructure/auth/jwt-auth.guard.ts` — Guard JWT

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}  // Simplemente extiende el guard genérico de Passport
```

**¿Por qué?**: NestJS Passport provee `AuthGuard('jwt')` que automáticamente usa JwtStrategy. Esta clase permite inyectarlo como dependencia y añadir lógica adicional si es necesario.

---

## `src/modules/auth/infrastructure/orm/user.orm-entity.ts` — Entidad TypeORM de usuario

```typescript
@Entity({ name: 'users', schema: 'auth' })  // Tabla auth.users
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;                      // Teléfono único

  @Column({ type: 'text', name: 'password_hash' })  // name: define nombre real en BD (snake_case)
  passwordHash: string;               // Hash de contraseña

  @Column({ type: 'enum', enum: ['passenger', 'driver', 'association_admin', 'super_admin'] })
  role: UserRole;                     // Enumerado de PostgreSQL

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'clock_timestamp()' })
  createdAt: Date;                    // clock_timestamp() de PG, no la fecha del servidor Node
  // ... más columnas
}
```

**¿Por qué?**: Separación de entidad de dominio (User) y entidad ORM (UserOrmEntity) permite:
1. Dominio puro sin decoradores TypeORM
2. Cambiar de ORM sin afectar dominio
3. Nombres de columna en snake_case en BD vs camelCase en TypeScript
4. `clock_timestamp()` retorna el timestamp real de PostgreSQL, no el del servidor Node

---

## `src/modules/auth/infrastructure/orm/association.orm-entity.ts` — ORM de asociación

Similar a UserOrmEntity, mapea la tabla `auth.associations`. Columnas: id (UUID), name (único), rif (único), address, phone, admin_id, is_active, created_at, updated_at.

---

## `src/modules/auth/infrastructure/orm/driver-request.orm-entity.ts` — ORM de solicitud

Similar, mapea `auth.driver_requests`. Destaca:

```typescript
@Column({ type: 'jsonb', name: 'documents_urls', nullable: true })
documentsUrls: Record<string, any> | null;  // JSONB nativo de PostgreSQL
```

**¿Por qué?**: JSONB permite almacenar documentos de forma flexible sin crear tablas adicionales. PostgreSQL soporta índices y consultas sobre JSONB.

---

## `src/modules/auth/infrastructure/orm/index.ts` — Barrel

```typescript
export { UserOrmEntity } from './user.orm-entity';
export { AssociationOrmEntity } from './association.orm-entity';
export { DriverRequestOrmEntity } from './driver-request.orm-entity';
```

---

## `src/modules/auth/infrastructure/persistence/user.repository.impl.ts` — Implementación del repositorio

```typescript
@Injectable()
export class UserRepositoryImpl implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)  // Inyecta el repositorio TypeORM para UserOrmEntity
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const ormUser = this.toOrm(user);           // Convierte de dominio → ORM
    const savedOrmUser = await this.userRepository.save(ormUser);  // Persiste
    return this.toDomain(savedOrmUser);          // Convierte de ORM → dominio
  }

  async findById(id: string): Promise<User | null> {
    const ormUser = await this.userRepository.findOne({ where: { id } });
    return ormUser ? this.toDomain(ormUser) : null;  // Siempre retorna entidad de dominio
  }

  // Mappers privados para convertir entre representaciones
  private toOrm(user: User): UserOrmEntity {
    const ormUser = new UserOrmEntity();
    ormUser.id = user.id;
    ormUser.phone = user.phone;
    // ... mapea campo por campo
    return ormUser;
  }

  private toDomain(ormUser: UserOrmEntity): User {
    return new User(/* ... todos los campos */);
  }

  async updateJwtKey(userId: string, jwtKey: string): Promise<void> {
    await this.userRepository.update(userId, { jwtKey });  // Update directo sin mapeo
  }
}
```

**¿Por qué?**: Implementación concreta del puerto. Los mappers `toOrm`/`toDomain` son necesarios por la separación dominio/ORM. `updateJwtKey` usa `update()` directamente porque es una operación simple sin necesidad de mapeo completo.

---

## `src/modules/auth/infrastructure/persistence/association.repository.impl.ts` — Repositorio de asociaciones

Mismo patrón que UserRepositoryImpl. Mapea entre Association ↔ AssociationOrmEntity.

---

## `src/modules/auth/infrastructure/persistence/driver-request.repository.impl.ts` — Repositorio de solicitudes

Mismo patrón. Implementa `findByDriverAndAssociation` que busca por dos campos.

---

## `src/modules/auth/infrastructure/persistence/index.ts` — Barrel

```typescript
export { UserRepositoryImpl } from './user.repository.impl';
export { AssociationRepositoryImpl } from './association.repository.impl';
export { DriverRequestRepositoryImpl } from './driver-request.repository.impl';
```

---

## `src/modules/auth/infrastructure/services/notification.service.impl.ts` — Notificaciones (stub)

```typescript
@Injectable()
export class NotificationServiceImpl implements NotificationServicePort {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`Sending email to ${to}: ${subject}`);  // Solo log, no envía realmente
  }
  async sendSms(to: string, message: string): Promise<void> {
    console.log(`Sending SMS to ${to}: ${message}`);
  }
  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    console.log(`Sending push to user ${userId}: ${title}`);
  }
}
```

**¿Por qué?**: Stub que implementa el puerto pero solo hace console.log. Método `sendPushNotification` extra que no está en el puerto (extensión no contractual). Pendiente integrar Twilio/SendGrid/FCM.

---

## `src/modules/auth/infrastructure/services/index.ts` — Barrel

```typescript
export { NotificationServiceImpl } from './notification.service.impl';
```

---

## `src/modules/auth/interfaces/rest/auth.controller.ts` — Controlador de autenticación

```typescript
@ApiTags('auth')       // Agrupa endpoints en Swagger
@Controller('auth')    // Prefijo /auth
export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,  // Caso de uso de registro
    private readonly loginUseCase: LoginUseCase,             // Caso de uso de login
  ) {}

  @Post('register')              // POST /auth/register
  @HttpCode(HttpStatus.CREATED)  // 201 Created
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    // Convierte DTO de validación (RegisterDto) a DTO interno (CreateUserDto)
    const createUserDto: CreateUserDto = {
      phone: registerDto.phone,
      email: registerDto.email,
      password: registerDto.password,
      // ...
    };
    const user = await this.createUserUseCase.execute(createUserDto);
    // Mapea a DTO de respuesta (nunca expone passwordHash, jwtKey, etc.)
    return { id: user.id, phone: user.phone, /* ... campos seguros */ };
  }

  @Post('login')                 // POST /auth/login
  @HttpCode(HttpStatus.OK)       // 200 OK
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.phone, loginDto.password);
  }

  @ApiBearerAuth()               // Swagger: requiere token
  @UseGuards(JwtAuthGuard)       // Protege la ruta con JWT
  @Get('profile')                // GET /auth/profile
  getProfile(@Request() req) {
    return req.user;             // Datos inyectados por JwtStrategy.validate()
  }
}
```

**¿Por qué?**: El controlador es un adaptador HTTP delgado (solo orquesta validación → caso de uso → respuesta). La conversión de RegisterDto a CreateUserDto separa la validación (interfaces) de los datos internos (aplicación). UserResponseDto omite campos sensibles.

---

## `src/modules/auth/interfaces/rest/user.controller.ts` — Controlador de usuarios (placeholder)

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { message: 'Get user endpoint', id };  // Placeholder
  }
}
```

**¿Por qué?**: Placeholder. Tiene el caso de uso inyectado pero no lo usa. Pendiente implementar GetUserUseCase.

---

## `src/modules/auth/interfaces/rest/association.controller.ts` — Controlador de asociaciones (placeholder)

```typescript
@Controller('associations')
export class AssociationController {
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { message: 'Get association endpoint', id };  // Placeholder
  }
  @Post()
  async create(@Body() createAssociationDto: any) {
    return { message: 'Create association endpoint' };   // Placeholder
  }
}
```

---

## `src/modules/auth/interfaces/rest/index.ts` — Barrel

```typescript
export { AuthController } from './auth.controller';
export { UserController } from './user.controller';
export { AssociationController } from './association.controller';
```

---

## `src/modules/auth/interfaces/dto/register.dto.ts` — DTO de validación para registro

```typescript
export class RegisterDto {
  @ApiProperty({ description: 'Número de teléfono', example: '+584121234567' })
  @IsPhoneNumber()             // Valida formato E.164
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()                   // Valida formato email
  email?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @IsOptional()
  @IsString()
  cedula?: string;

  @IsEnum(['passenger', 'driver', 'association_admin', 'super_admin'])
  role: UserRole;

  @IsEnum(['normal', 'student', 'elderly'])
  category: UserCategory;
}
```

**¿Por qué?**: Los decoradores `@ApiProperty` generan documentación Swagger automática. `@IsPhoneNumber()`, `@IsEmail()`, `@MinLength()`, `@IsEnum()` son validaciones en runtime de class-validator. El DTO se valida automáticamente gracias al `ValidationPipe` global de NestJS.

---

## `src/modules/auth/interfaces/dto/login.dto.ts` — DTO de validación para login

```typescript
export class LoginDto {
  @IsOptional() @IsEmail()
  email?: string;               // Reservado para futuro login por email

  @IsString() @IsNotEmpty()
  phone: string;                // Teléfono obligatorio

  @IsString() @IsNotEmpty() @MinLength(6)
  password: string;             // Contraseña
}
```

---

## `src/modules/auth/interfaces/dto/user-response.dto.ts` — DTO de respuesta

```typescript
export class UserResponseDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  role: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  // NOTA: No incluye passwordHash, jwtKey, qrKey, etc. (seguridad)
}
```

**¿Por qué?**: DTO de salida que expone solo campos seguros. Oculta passwordHash, jwtKey, qrKey y otros datos sensibles.

---

## `src/modules/auth/interfaces/dto/index.ts` — Barrel

```typescript
export { RegisterDto } from './register.dto';
export { UserResponseDto } from './user-response.dto';
// NOTA: LoginDto no se exporta desde aquí (se importa directamente)
```

---

# TEST FILES DEL MÓDULO AUTH

---

## `src/modules/auth/application/use-cases/create-user.use-case.spec.ts`

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepo: any;        // Mock del repositorio
  let walletService: any;   // Mock del servicio de billetera
  let cryptoService: any;   // Mock del servicio de criptografía

  beforeEach(async () => {
    // Crea mocks con Jest
    userRepo = { findByPhone: jest.fn(), save: jest.fn(), updateJwtKey: jest.fn() };
    walletService = { createWallet: jest.fn() };
    cryptoService = { hash: jest.fn(), compare: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: USER_REPOSITORY_PORT, useValue: userRepo },  // Mock del puerto
        { provide: WALLET_SERVICE_PORT, useValue: walletService },
        { provide: CryptoService, useValue: cryptoService },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should create a user successfully', async () => {
    userRepo.findByPhone.mockResolvedValue(null);              // Teléfono no existe
    cryptoService.hash.mockResolvedValue('hashed_password');   // Hash simulado
    userRepo.save.mockResolvedValue(/* User simulado */);      // Save exitoso

    const result = await useCase.execute(dto);

    expect(walletService.createWallet).toHaveBeenCalledWith('uuid');  // Wallet creada
    expect(result.phone).toBe(dto.phone);
  });

  it('should throw UserAlreadyExistsException if phone exists', async () => {
    userRepo.findByPhone.mockResolvedValue(mockUser);  // Usuario ya existe
    await expect(useCase.execute(dto)).rejects.toThrow(UserAlreadyExistsException);
    expect(userRepo.save).not.toHaveBeenCalled();      // No debe persistir
  });
});
```

**¿Por qué?**: Tests del caso de uso con mocks de las dependencias. Verifica el flujo completo: validación → hash → persistencia → wallet. El test de error verifica que no se persista si el teléfono ya existe.

---

## `src/modules/auth/application/use-cases/login.use-case.spec.ts`

Verifica login exitoso (retorna token y datos), credenciales inválidas (usuario no encontrado, contraseña incorrecta, usuario inactivo), y que se llame a `updateJwtKey` para rotar la clave.

**¿Por qué?**: Cubre todos los caminos del login: éxito, error por usuario inexistente, error por contraseña incorrecta, error por usuario inactivo, y verifica la rotación de clave JWT.

---

## `src/modules/auth/infrastructure/auth/jwt.strategy.spec.ts`

```typescript
describe('JwtStrategy', () => {
  // Helper que genera un token JWT falso pero con estructura decodificable
  const createFakeToken = (payload: any) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'fake-signature';
    return `${header}.${body}.${signature}`;
  };

  it('should return jwtKey when user exists and has key', async () => {
    const token = createFakeToken({ sub: 'user-id' });
    userRepo.findById.mockResolvedValue(mockUser);  // Usuario con jwtKey

    const key = await (strategy as any).resolveSecretKey(token);
    expect(key).toBe('current-jwt-key');
  });

  it('should throw error if token has no sub', async () => { /* ... */ });
  it('should throw error if user not found', async () => { /* ... */ });
  it('should throw error if user has no jwtKey', async () => { /* ... */ });
});
```

**¿Por qué?**: El helper `createFakeToken` genera tokens con estructura JWT válida para decodificar el payload sin verificar firma. Se usa `(strategy as any)` para acceder al método privado `resolveSecretKey`. Cubre casos de borde: token sin `sub`, usuario no encontrado, usuario sin clave.

---

## `src/modules/auth/infrastructure/persistence/user.repository.impl.spec.ts`

```typescript
describe('UserRepositoryImpl', () => {
  let repo: UserRepositoryImpl;
  let mockTypeOrmRepo: any;  // Mock del TypeORM Repository

  beforeEach(() => {
    mockTypeOrmRepo = { findOne: jest.fn(), save: jest.fn(), update: jest.fn() };
    repo = new UserRepositoryImpl(mockTypeOrmRepo);  // Inyecta mock directamente
  });

  it('should convert domain to orm and save', async () => {
    mockTypeOrmRepo.save.mockResolvedValue(mockOrmUser);
    const result = await repo.save(mockDomainUser);
    expect(result).toBeInstanceOf(User);           // Retorna entidad de dominio
    expect(mockTypeOrmRepo.save).toHaveBeenCalled();  // TypeORM fue llamado
  });

  it('should find user by phone', async () => { /* ... */ });
  it('should call update with correct params', async => { /* ... */ });
});
```

**¿Por qué?**: Tests unitarios del repositorio sin base de datos real. Mockea TypeORM Repository y verifica que los mappers (toOrm/toDomain) funcionen correctamente. Verifica que `save` recibe un UserOrmEntity y retorna un User.

---

## `src/modules/auth/interfaces/rest/auth.controller.spec.ts`

```typescript
describe('AuthController', () => {
  // Mock de casos de uso
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: CreateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();
  });

  it('should register a user and return user response', async () => {
    createUserUseCase.execute.mockResolvedValue(mockUserResponse);
    const result = await controller.register(registerDto);
    expect(result).toEqual(mockUserResponse);
  });

  it('should throw ConflictException when phone already exists', async () => { /* ... */ });
  it('should login and return access token', async () => { /* ... */ });
  it('should return user from request (set by guard)', async () => { /* ... */ });
});
```

**¿Por qué?**: Tests del controlador con casos de uso mockeados. Verifica que el controlador convierta correctamente RegisterDto a CreateUserDto, maneje excepciones, y retorne datos del perfil. El test de profile usa un request mockeado (sin pasar por el guard real).

---

## `src/modules/auth/interfaces/dto/register.dto.spec.ts`

```typescript
describe('RegisterDto', () => {
  it('should pass with all required fields', async () => {
    const dto = plainToInstance(RegisterDto, validDto);  // plainToInstance para activar decoradores
    const errors = await validate(dto);                   // class-validator validate()
    expect(errors).toHaveLength(0);                       // Sin errores = válido
  });

  it('should fail if phone is missing', async () => { /* phone ausente → error */ });
  it('should fail if phone is empty', async () => { /* phone vacío → error */ });
  it('should fail if phone is not valid phone number', async () => { /* formato inválido → error */ });
  it('should fail if password is too short', async () => { /* < 6 caracteres → error */ });
  it('should fail if role is not valid enum', async () => { /* rol inválido → error */ });
  it('should pass with valid optional email', async () => { /* email válido → sin error */ });
  it('should fail with invalid email', async () => { /* email inválido → error */ });
});
```

**¿Por qué?**: `plainToInstance` es necesario porque class-validator funciona sobre instancias de clase, no objetos planos. Verifica cada decorador de validación individualmente y los campos opcionales.

---

## `src/modules/auth/interfaces/dto/login.dto.spec.ts`

Similar a register.dto.spec.ts pero para LoginDto. Verifica phone (requerido, no vacío), password (requerida, mínimo 6 caracteres).

---

# MÓDULOS PENDIENTES (STUBS)

---

## `src/modules/audit/index.ts` — Auditoría (stub)

```typescript
// Pendiente: Log de acciones críticas en audit.audit_log
// - Triggers de BD para INSERT-only (no UPDATE/DELETE)
// - Consulta de historial de cambios por entidad
export {};
```

**¿Por qué?**: La tabla `audit_log` debe ser inmutable. Los triggers a nivel de BD previenen UPDATE y DELETE. Solo INSERT está permitido.

---

## `src/modules/fin/index.ts` — Financiero (parcial)

```typescript
export * from './domain/entities';  // Exporta Wallet
// Lo demás comentado (pendiente de implementación)
```

---

## `src/modules/fin/domain/entities/wallet.entity.ts` — Billetera digital

```typescript
export class Wallet {
  constructor(
    public readonly id: string,
    public readonly userId: string,           // Usuario propietario (1 wallet por usuario)
    public readonly balance: number,          // Saldo en centavos (BIGINT, no float)
    public readonly debtBalance: number,      // Crédito de emergencia usado
    public readonly creditUsed: boolean,      // ¿Ya usó el crédito de emergencia?
    public readonly currency: string,         // Código ISO 4217 (USD, VED, etc.)
    public readonly lastTransactionAt: Date | null,
    public readonly version: number,          // Control concurrencia optimista (OCC)
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
```

**¿Por qué?**: `balance` en centavos (entero) evita errores de redondeo por punto flotante. `version` se usa para optimistic concurrency control: si dos operaciones concurrentes leen distinta versión, una debe reintentar.

---

## `src/modules/fin/domain/entities/index.ts` — Barrel

```typescript
export { Wallet } from './wallet.entity';
```

---

## `src/modules/fin/infrastructure/orm/wallet.orm-entity.ts` — ORM de billetera

```typescript
@Entity({ name: 'wallets', schema: 'fin' })
export class WalletOrmEntity {
  @Column({ type: 'bigint', default: 0 })
  balance: number;              // BIGINT en PostgreSQL (centavos)
  @Column({ type: 'int', default: 1 })
  version: number;              // Para OCC
  // ...
}
```

---

## `src/modules/fin/infrastructure/orm/index.ts` — Barrel

```typescript
export { WalletOrmEntity } from './wallet.orm-entity';
```

---

## `src/modules/ops/index.ts` — Operaciones (stub)

```typescript
// Pendiente:
// - CRUD de rutas (ops.routes) con referencia a fin.coop_fares
// - CRUD de vehículos (ops.vehicles)
// - Asignación de rutas a conductores (ops.assigned_routes)
export {};
```

---

## `src/modules/trip/index.ts` — Viajes (stub)

```typescript
// Pendiente:
// - Inicio/finalización de viajes (trip.trips)
// - Procesamiento de pagos (trip.payments)
// - Historial GPS (trip.gps_history)
// - Integración WebSockets para tracking en tiempo real
export {};
```

---

# ARCHIVOS DE CONFIGURACIÓN

---

## `package.json` — Dependencias y scripts del proyecto

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",     // Hot-reload para desarrollo
    "start:prod": "node dist/main",        // Sin NestJS CLI, solo Node
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.1",           // Decoradores, pipes, guards
    "@nestjs/config": "^4.0.4",            // Variables de entorno
    "@nestjs/core": "^11.0.1",             // Contenedor IoC
    "@nestjs/jwt": "^11.0.2",              // JWT module
    "@nestjs/passport": "^11.0.5",         // Integración Passport
    "@nestjs/platform-express": "^11.0.1", // Servidor HTTP Express
    "@nestjs/swagger": "^11.4.4",          // Documentación OpenAPI
    "@nestjs/terminus": "^11.1.1",         // Healthchecks
    "@nestjs/typeorm": "^11.0.2",          // TypeORM integration
    "bcrypt": "^6.0.0",                    // Hashing de contraseñas
    "class-transformer": "^0.5.1",         // Transformar planos a clases
    "class-validator": "^0.15.1",          // Validación por decoradores
    "ioredis": "^5.11.1",                 // Cliente Redis
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",             // Estrategia JWT para Passport
    "pg": "^8.22.0",                      // Driver PostgreSQL
    "typeorm": "^1.0.0",                  // ORM
    "winston": "^3.19.0"                  // Logger
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",                     // Tests buscan desde src/
    "testRegex": ".*\\.spec\\.ts$",       // Patrón de archivos de test
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "testEnvironment": "node"
  }
}
```

---

## `nest-cli.json` — Configuración NestJS CLI

Define opciones del CLI: compilador, directorio de entrada, etc.

---

## `tsconfig.json` — Configuración TypeScript

Define strict mode, decoradores experimentales (necesarios para NestJS), rutas de módulos, etc.

---

## `tsconfig.build.json` — TypeScript para build

Extiende tsconfig.json pero excluye tests y archivos spec.

---

## `Dockerfile` — Docker multi-stage

Tres etapas: dev (hot-reload con nodemon), build (compila TS), prod (ejecuta dist/main con Node limpio y minimizado).

---

## `eslint.config.mjs` — ESLint flat config

Configuración moderna de ESLint (flat config, formato .mjs). Extiende recomendaciones de TypeScript y Prettier.

---

## `.prettierrc` — Configuración Prettier

Define reglas de formato: tab宽度, comillas, punto y coma, etc.

---

## `PROYECTO.md` — Documentación técnica del proyecto en español

Documentación exhaustiva del proyecto: stack, arquitectura, estructura, endpoints, tablas, estado de implementación.

---

## `README.md` — README en inglés

README simplificado con stack, endpoints funcionales, esquemas de BD y scripts.

---

**Fin de la documentación — 83 archivos documentados.**
