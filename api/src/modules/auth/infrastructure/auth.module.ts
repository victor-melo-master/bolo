// src/modules/auth/infrastructure/auth.module.ts — Ruta relativa desde src/
import { GetPassengerProfileUseCase } from './../application/use-cases/get-passenger-profile.use-case';
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
 * Registros clave actualizados (refactor split-users-table):
 *   - Repositorios: PassengerRepositoryImpl, AdminRepositoryImpl,
 *     SessionRepositoryImpl, AssociationRepositoryImpl,
 *     DriverRequestRepositoryImpl
 *   - Servicios: CryptoService (hashing), NotificationServiceImpl
 *   - Estrategia JWT: JwtStrategy + JwtAuthGuard
 *   - Controladores: PassengerAuthController, AdminAuthController
 *
 * Exporta los puertos y casos de uso para que otros módulos
 * puedan reutilizarlos.
 *
 * Capa: Infraestructura (auth)
 * Dependencias:
 *   - TypeOrmModule.forFeature: registra entidades ORM
 *   - PassportModule: integración Passport (estrategia jwt)
 *   - JwtModule: firma y verificación de tokens
 *
 * @module AuthModule
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// ─── Entidades ORM actualizadas ───────────────────────────────────────────
import {
  PassengerOrmEntity,
  AdminOrmEntity,
  SessionOrmEntity,
  AssociationOrmEntity,
  DriverRequestOrmEntity,
} from './orm';

// ─── Implementaciones concretas de repositorios actualizadas ──────────────
import {
  PassengerRepositoryImpl,
  AdminRepositoryImpl,
  SessionRepositoryImpl,
  AssociationRepositoryImpl,
  DriverRequestRepositoryImpl,
} from './persistence';

// ─── Servicios de infraestructura ─────────────────────────────────────────
import { NotificationServiceImpl } from './services';

// ─── Casos de uso actualizados ───────────────────────────────────────────
import { CreateAdminUseCase } from '../application/use-cases/create-admin.use-case';

// ─── Controladores REST actualizados ──────────────────────────────────────
import { PassengerAuthController } from '../interfaces/rest/passenger-auth.controller';
// import { AdminAuthController } from '../interfaces/rest/admin-auth.controller'; // Se añadirá en el siguiente paso

// ─── Puertos actualizados ─────────────────────────────────────────────────
import {
  PASSENGER_REPOSITORY_PORT,
  ADMIN_REPOSITORY_PORT,
  SESSION_REPOSITORY_PORT,
  ASSOCIATION_REPOSITORY_PORT,
  DRIVER_REQUEST_REPOSITORY_PORT,
  NOTIFICATION_SERVICE_PORT,
} from '../domain/interfaces';

// ─── Servicios compartidos ────────────────────────────────────────────────
import { CryptoService } from '../../../shared/application/services/crypto.service';

// ─── Estrategia y guard JWT ───────────────────────────────────────────────
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';
import { FinModule } from 'src/modules/fin/infrastructure/fin.module';
import { RolesGuard } from 'src/shared/infrastructure/auth/roles.guard';
import { CreatePassengerUseCase } from '../application/use-cases/create-passanger.use-case';
import { AdminAuthController } from '../interfaces/rest/admin-auth.controller';
import { LoginPassengerUseCase } from '../application/use-cases/login-passenger.use-case';
import { LoginAdminUseCase } from '../application/use-cases/login-admin.use-case';
import { GetAdminProfileUseCase } from '../application/use-cases/get-admin-profile.use-case';
import { UpdatePassengerUseCase } from '../application/use-cases/update-passenger.use-case';
import { UpdateAdminUseCase } from '../application/use-cases/update-admin.use-case';
import { DeletePassengerUseCase } from '../application/use-cases/delete-passenger.use-case';
import { DeleteAdminUseCase } from '../application/use-cases/delete-admin.use-case';
import { ChangePassengerPasswordUseCase } from '../application/use-cases/change-passenger-password.use-case';
import { ChangeAdminPasswordUseCase } from '../application/use-cases/change-admin-password.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PassengerOrmEntity,
      AdminOrmEntity,
      SessionOrmEntity,
      AssociationOrmEntity,
      DriverRequestOrmEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'unused',
      signOptions: { expiresIn: '24h' },
    }),
    FinModule,
  ],
  controllers: [
    PassengerAuthController,
    AdminAuthController,
    // AdminAuthController, // Se activará en el siguiente paso
  ],
  providers: [
    // Casos de uso
    CreatePassengerUseCase,
    CreateAdminUseCase,
    LoginPassengerUseCase,
    LoginAdminUseCase,
    GetAdminProfileUseCase,
    GetPassengerProfileUseCase,
    UpdatePassengerUseCase,
    UpdateAdminUseCase,
    DeletePassengerUseCase,
    DeleteAdminUseCase,
    ChangePassengerPasswordUseCase,
    ChangeAdminPasswordUseCase,

    // Servicios compartidos
    CryptoService,

    // Vinculación puerto → implementación
    { provide: PASSENGER_REPOSITORY_PORT, useClass: PassengerRepositoryImpl },
    { provide: ADMIN_REPOSITORY_PORT, useClass: AdminRepositoryImpl },
    { provide: SESSION_REPOSITORY_PORT, useClass: SessionRepositoryImpl },
    {
      provide: ASSOCIATION_REPOSITORY_PORT,
      useClass: AssociationRepositoryImpl,
    },
    {
      provide: DRIVER_REQUEST_REPOSITORY_PORT,
      useClass: DriverRequestRepositoryImpl,
    },
    { provide: NOTIFICATION_SERVICE_PORT, useClass: NotificationServiceImpl },

    // Seguridad
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    // Puertos de repositorio (para que otros módulos puedan inyectarlos)
    PASSENGER_REPOSITORY_PORT,
    ADMIN_REPOSITORY_PORT,
    SESSION_REPOSITORY_PORT,
    ASSOCIATION_REPOSITORY_PORT,
    DRIVER_REQUEST_REPOSITORY_PORT,
    NOTIFICATION_SERVICE_PORT,

    // Casos de uso
    CreatePassengerUseCase,
    CreateAdminUseCase,

    // Guard para proteger rutas en otros módulos
    JwtAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}
