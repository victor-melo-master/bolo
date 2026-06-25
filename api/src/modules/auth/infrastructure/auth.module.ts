// src/modules/auth/infrastructure/auth.module.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * AuthModule — Módulo de Infraestructura de Autenticación
 * ═══════════════════════════════════════════════════════════════
 *
 * Módulo NestJS que organiza toda la funcionalidad de auth.
 * Sigue Arquitectura Hexagonal: este módulo de infraestructura
 * "ata" los puertos abstractos (definidos en domain/interfaces)
 * con sus implementaciones concretas (repositorios TypeORM,
 * servicios JWT, etc.).
 *
 * Registros clave:
 *   - Repositorios: UserRepositoryImpl, AssociationRepositoryImpl,
 *     DriverRequestRepositoryImpl (cada uno vinculado a su puerto)
 *   - Servicios: CryptoService (hashing), NotificationServiceImpl
 *     (mock), WalletServicePort (mock no-op)
 *   - Estrategia JWT: JwtStrategy + JwtAuthGuard para protección
 *     de rutas
 *   - JwtModule asíncrono: lee JWT_SECRET de ConfigService
 *
 * Exporta los puertos y casos de uso para que otros módulos
 * puedan reutilizarlos (ej. fin puede consultar usuarios).
 *
 * Capa: Infraestructura (auth)
 * Dependencias:
 *   - TypeOrmModule.forFeature: registra entidades ORM
 *   - PassportModule: integración Passport (estrategia jwt)
 *   - JwtModule: firma y verificación de tokens
 *   - ConfigModule: variables de entorno
 *
 * @module AuthModule
 * @see USER_REPOSITORY_PORT
 * @see CreateUserUseCase
 */

// ─── Imports de módulos base de NestJS ─────────────────────────────────────
// Module: decorador que define un módulo de NestJS para agrupar providers,
// controladores, imports y exports en un contexto de inyección de dependencias
import { Module } from '@nestjs/common';
// TypeOrmModule: provee @InjectRepository para inyectar repositorios TypeORM
import { TypeOrmModule } from '@nestjs/typeorm';
// PassportModule: integra Passport.js como framework de autenticación en NestJS
import { PassportModule } from '@nestjs/passport';
// JwtModule: utilidades para firmar (JwtService.signAsync) y verificar tokens JWT
import { JwtModule } from '@nestjs/jwt';

// ─── Entidades ORM (TypeORM) ───────────────────────────────────────────────
// Se importan para registrarlas en TypeOrmModule.forFeature, lo que permite
// que TypeORM cree repositorios inyectables (@InjectRepository) para cada una
import {
  UserOrmEntity,
  AssociationOrmEntity,
  DriverRequestOrmEntity,
} from './orm';

// ─── Implementaciones concretas de repositorios ────────────────────────────
// Adaptadores de infraestructura que implementan los puertos del dominio.
// Cada una usa @InjectRepository con su ORM entity correspondiente
import {
  UserRepositoryImpl,
  AssociationRepositoryImpl,
  DriverRequestRepositoryImpl,
} from './persistence';

// ─── Servicios de infraestructura ──────────────────────────────────────────
// NotificationServiceImpl: implementación stub que solo registra en consola.
// Temporal hasta integrar Twilio/SendGrid/FCM
import { NotificationServiceImpl } from './services';

// ─── Casos de uso de la capa de aplicación ─────────────────────────────────
// Orquestan la lógica de negocio inyectando los puertos abstractos del dominio.
// Se registran como providers para que NestJS resuelva sus dependencias
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';

// ─── Controladores REST ────────────────────────────────────────────────────
// Exponen los endpoints HTTP que reciben las peticiones del cliente
import { UserController, AuthController } from '../interfaces/rest';

// ─── Puertos (interfaces abstractas del dominio) ───────────────────────────
// Se usan como tokens de inyección de dependencia (custom providers) para
// desacoplar la capa de aplicación de las implementaciones de infraestructura.
// Si cambia la implementación, solo se cambia el useClass aquí.
import {
  USER_REPOSITORY_PORT,
  ASSOCIATION_REPOSITORY_PORT,
  DRIVER_REQUEST_REPOSITORY_PORT,
  NOTIFICATION_SERVICE_PORT,
} from '../domain/interfaces';

// ─── Servicios compartidos ─────────────────────────────────────────────────
// CryptoService: servicio de hashing y verificación de contraseñas,
// ubicado en shared porque varios módulos pueden necesitarlo
import { CryptoService } from '../../../shared/application/services/crypto.service';

// ─── Estrategia y guard JWT ─────────────────────────────────────────────────
// JwtStrategy: lógica de validación de tokens JWT (hereda de PassportStrategy)
// JwtAuthGuard: guard de NestJS que protege rutas con autenticación JWT
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';
import { FinModule } from 'src/modules/fin/infrastructure/fin.module';
import { RolesGuard } from 'src/shared/infrastructure/auth/roles.guard';

@Module({
  imports: [
    // TypeOrmModule.forFeature registra las entidades en el contexto del módulo,
    // permitiendo inyectar sus repositorios con @InjectRepository en los
    // proveedores (UserRepositoryImpl, AssociationRepositoryImpl, etc.)
    TypeOrmModule.forFeature([
      UserOrmEntity,
      AssociationOrmEntity,
      DriverRequestOrmEntity,
    ]),
    // PassportModule.register configura 'jwt' como estrategia por defecto,
    // así que @UseGuards(AuthGuard('jwt')) se simplifica a @UseGuards(JwtAuthGuard)
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.register con secret 'unused' porque el secret aquí es dummy:
    // la verificación real de tokens usa secretOrKeyProvider en JwtStrategy
    // para obtener la clave JWT específica de cada usuario desde la BD.
    // signOptions.expiresIn define el tiempo de vida del token al firmarlo
    // con JwtService.signAsync (usado en LoginUseCase).
    JwtModule.register({
      secret: 'unused',
      signOptions: { expiresIn: '24h' },
    }),
    FinModule,
  ],
  controllers: [AuthController, UserController],
  providers: [
    // Casos de uso: NestJS los instancia e inyecta automáticamente
    // los puertos que reciben en sus constructores
    CreateUserUseCase,
    LoginUseCase,

    // CryptoService: servicio concreto inyectable para hash de contraseñas
    CryptoService,

    // ─── Vinculación puerto abstracto → implementación concreta ────────
    // Cada provide asocia un token de inyección (el puerto del dominio)
    // con una clase concreta de infraestructura mediante useClass.
    // Esto permite cambiar la implementación (ej. a Prisma) sin modificar
    // el dominio ni los casos de uso que dependen del puerto.
    { provide: USER_REPOSITORY_PORT, useClass: UserRepositoryImpl },
    {
      provide: ASSOCIATION_REPOSITORY_PORT,
      useClass: AssociationRepositoryImpl,
    },
    {
      provide: DRIVER_REQUEST_REPOSITORY_PORT,
      useClass: DriverRequestRepositoryImpl,
    },

    // NotificationServiceImpl: stub temporal que solo hace console.log.
    // Se reemplazará con implementación real (ej. Twilio para SMS,
    // SendGrid para email, FCM para push notifications).
    { provide: NOTIFICATION_SERVICE_PORT, useClass: NotificationServiceImpl },

    // JwtStrategy y JwtAuthGuard se registran como providers para que
    // NestJS los tenga disponibles en el contenedor DI y Passport pueda
    // encontrar la estrategia 'jwt' cuando JwtAuthGuard la invoca
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    // Se exportan los puertos para que otros módulos (ej. FinModule, ReportModule)
    // puedan inyectar las mismas implementaciones de repositorios sin acoplarse
    // a la implementación concreta (siguen dependiendo del puerto abstracto)
    USER_REPOSITORY_PORT,
    ASSOCIATION_REPOSITORY_PORT,
    DRIVER_REQUEST_REPOSITORY_PORT,
    NOTIFICATION_SERVICE_PORT,

    // Se exportan los casos de uso para que otros módulos puedan reutilizar
    // la lógica de negocio (ej. módulo de onboarding invoca CreateUserUseCase)
    CreateUserUseCase,
    LoginUseCase,

    // JwtAuthGuard exportado para proteger rutas en otros módulos
    // con @UseGuards(JwtAuthGuard) sin tener que redefinir el guard
    JwtAuthGuard,
    // JwtModule exportado para que otros módulos puedan usar JwtService
    // (ej. para firmar tokens de restablecimiento de contraseña)
    JwtModule,
  ],
})
export class AuthModule {}
