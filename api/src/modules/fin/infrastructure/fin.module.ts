// src/modules/fin/infrastructure/fin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletOrmEntity } from './orm/wallet.orm-entity';
import { WalletRepositoryImpl } from './persistence/wallet.repository.impl';
import { WalletServiceImpl } from './services/wallet.service.impl';
import { CreateWalletUseCase } from '../application/use-cases/create-wallet.use-case';
import { WALLET_REPOSITORY_PORT } from '../domain/interfaces/repositories/wallet.repository.port';
import { WALLET_SERVICE_PORT } from '../domain/interfaces/services/wallet.service.port';

@Module({
  imports: [TypeOrmModule.forFeature([WalletOrmEntity])],
  providers: [
    // Repositorio
    { provide: WALLET_REPOSITORY_PORT, useClass: WalletRepositoryImpl },
    // Servicio (implementa el puerto que usa auth)
    { provide: WALLET_SERVICE_PORT, useClass: WalletServiceImpl },
    // Caso de uso
    CreateWalletUseCase,
  ],
  exports: [
    // Solo exportamos el token del servicio para que auth lo inyecte
    WALLET_SERVICE_PORT,
  ],
})
export class FinModule {}
