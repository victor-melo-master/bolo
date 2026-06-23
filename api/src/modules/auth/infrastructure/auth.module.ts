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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      AssociationOrmEntity,
      DriverRequestOrmEntity,
    ]),
  ],
  controllers: [AuthController, UserController, AssociationController],
  providers: [
    // Casos de uso
    CreateUserUseCase,
    // Otros use-cases...

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
  ],
  exports: [
    // Exportar los tokens, NO las clases concretas
    USER_REPOSITORY_PORT,
    ASSOCIATION_REPOSITORY_PORT,
    DRIVER_REQUEST_REPOSITORY_PORT,
    NOTIFICATION_SERVICE_PORT,
    // También se pueden exportar use-cases si otros módulos los necesitan
    CreateUserUseCase,
  ],
})
export class AuthModule {}
