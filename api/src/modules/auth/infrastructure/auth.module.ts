// src/modules/auth/infrastructure/auth.module.ts
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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserOrmEntity,
  AssociationOrmEntity,
  DriverRequestOrmEntity,
} from './orm';
import {
  UserRepositoryImpl,
  AssociationRepositoryImpl,
  DriverRequestRepositoryImpl,
} from './persistence';
import { NotificationServiceImpl } from './services';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import {
  UserController,
  AuthController,
  AssociationController,
} from '../interfaces/rest';
import {
  USER_REPOSITORY_PORT,
  ASSOCIATION_REPOSITORY_PORT,
  DRIVER_REQUEST_REPOSITORY_PORT,
  NOTIFICATION_SERVICE_PORT,
  WALLET_SERVICE_PORT,
} from '../domain/interfaces';
import { CryptoService } from '../../../shared/application/services/crypto.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      AssociationOrmEntity,
      DriverRequestOrmEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'defaultSecret',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController, UserController, AssociationController],
  providers: [
    CreateUserUseCase,
    LoginUseCase,
    CryptoService,

    { provide: USER_REPOSITORY_PORT, useClass: UserRepositoryImpl },
    {
      provide: ASSOCIATION_REPOSITORY_PORT,
      useClass: AssociationRepositoryImpl,
    },
    {
      provide: DRIVER_REQUEST_REPOSITORY_PORT,
      useClass: DriverRequestRepositoryImpl,
    },
    { provide: NOTIFICATION_SERVICE_PORT, useClass: NotificationServiceImpl },
    {
      provide: WALLET_SERVICE_PORT,
      useValue: { createWallet: async () => {} },
    },

    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    USER_REPOSITORY_PORT,
    ASSOCIATION_REPOSITORY_PORT,
    DRIVER_REQUEST_REPOSITORY_PORT,
    NOTIFICATION_SERVICE_PORT,
    WALLET_SERVICE_PORT,
    CreateUserUseCase,
    LoginUseCase,
    JwtAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}
