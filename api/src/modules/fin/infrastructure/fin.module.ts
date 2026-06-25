// src/modules/fin/infrastructure/fin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM entities
import { WalletOrmEntity } from './orm/wallet.orm-entity';
import { CoopFareOrmEntity } from './orm/coop-fare.orm-entity';
import { ExchangeRateOrmEntity } from './orm/exchange-rate.orm-entity';

// Repositorios (implementaciones)
import { WalletRepositoryImpl } from './persistence/wallet.repository.impl';
import { CoopFareRepositoryImpl } from './persistence/coop-fare.repository.impl';
import { ExchangeRateRepositoryImpl } from './persistence/exchange-rate.repository.impl';

// Tokens de los puertos
import { WALLET_REPOSITORY_PORT } from '../domain/interfaces/repositories/wallet.repository.port';
import { COOP_FARE_REPOSITORY_PORT } from '../domain/interfaces/repositories/coop-fare.repository.port';
import { EXCHANGE_RATE_REPOSITORY_PORT } from '../domain/interfaces/repositories/exchange-rate.repository.port';
import { WALLET_SERVICE_PORT } from '../domain/interfaces/services/wallet.service.port';

// Casos de uso
import { CreateWalletUseCase } from '../application/use-cases/create-wallet.use-case';
import { CreateCoopFareUseCase } from '../application/use-cases/create-coop-fare.use-case';

// Servicios
import { WalletServiceImpl } from './services/wallet.service.impl';

// Controladores
import { WalletController } from '../interfaces/rest/wallet.controller';
import { CoopFareController } from '../interfaces/rest/coop-fare.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletOrmEntity,
      CoopFareOrmEntity,
      ExchangeRateOrmEntity,
    ]),
  ],
  controllers: [WalletController, CoopFareController],
  providers: [
    // Vinculación puerto → implementación
    { provide: WALLET_REPOSITORY_PORT, useClass: WalletRepositoryImpl },
    { provide: COOP_FARE_REPOSITORY_PORT, useClass: CoopFareRepositoryImpl },
    {
      provide: EXCHANGE_RATE_REPOSITORY_PORT,
      useClass: ExchangeRateRepositoryImpl,
    },

    // Servicio de wallet (puerto de servicio)
    { provide: WALLET_SERVICE_PORT, useClass: WalletServiceImpl },

    // Casos de uso
    CreateWalletUseCase,
    CreateCoopFareUseCase,
  ],
  exports: [
    // Exportamos los tokens que otros módulos necesitan inyectar
    WALLET_SERVICE_PORT,
    COOP_FARE_REPOSITORY_PORT, // ← para que OpsModule pueda usar el repositorio de tarifas
    EXCHANGE_RATE_REPOSITORY_PORT,
  ],
})
export class FinModule {}
