// auth/infrastructure/auth.module.ts
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
    // Casos de uso
    CreateUserUseCase,
    LoginUseCase,

    // Servicios compartidos
    CryptoService,

    // Enlazar puertos abstractos con implementaciones
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
    JwtStrategy, // ← agregar (debe ser provider)
    JwtAuthGuard, // ← agregar (debe ser provider)
  ],
  exports: [
    USER_REPOSITORY_PORT,
    ASSOCIATION_REPOSITORY_PORT,
    DRIVER_REQUEST_REPOSITORY_PORT,
    NOTIFICATION_SERVICE_PORT,
    WALLET_SERVICE_PORT, // ← añadir
    CreateUserUseCase,
    LoginUseCase, // ← añadir
    JwtAuthGuard, // ← añadir (opcional)
    JwtModule, // ← añadir (opcional, para que otros módulos puedan firmar tokens)
  ],
})
export class AuthModule {}
