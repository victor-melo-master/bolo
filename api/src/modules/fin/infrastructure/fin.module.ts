// src/modules/fin/infrastructure/fin.module.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * FinModule — Módulo NestJS del Sistema Financiero
 * ═══════════════════════════════════════════════════════════════
 *
 * Módulo raíz de la funcionalidad financiera. Configura el registro
 * de entidades TypeORM, la inyección de dependencias (puerto ↔
 * implementación), los controladores REST y los casos de uso.
 *
 * Sigue la arquitectura hexagonal:
 *   - Domain:   entidades, puertos y excepciones
 *   - Application: casos de uso y DTOs
 *   - Infrastructure: ORM, repositorios concretos, servicios
 *   - Interfaces: controladores REST y DTOs de validación
 *
 * Capa: Infraestructura (fin)
 *
 * @module FinModule
 */

// ─── Importaciones de NestJS ───
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ─── Entidades ORM ───
import { WalletOrmEntity } from './orm/wallet.orm-entity';
import { CoopFareOrmEntity } from './orm/coop-fare.orm-entity';
import { ExchangeRateOrmEntity } from './orm/exchange-rate.orm-entity';

// ─── Repositorios (implementaciones concretas) ───
import { WalletRepositoryImpl } from './persistence/wallet.repository.impl';
import { CoopFareRepositoryImpl } from './persistence/coop-fare.repository.impl';
import { ExchangeRateRepositoryImpl } from './persistence/exchange-rate.repository.impl';

// ─── Tokens de puertos (inyección de dependencias) ───
import { WALLET_REPOSITORY_PORT } from '../domain/interfaces/repositories/wallet.repository.port';
import { COOP_FARE_REPOSITORY_PORT } from '../domain/interfaces/repositories/coop-fare.repository.port';
import { EXCHANGE_RATE_REPOSITORY_PORT } from '../domain/interfaces/repositories/exchange-rate.repository.port';
import { WALLET_SERVICE_PORT } from '../domain/interfaces/services/wallet.service.port';

// ─── Casos de uso ───
import { CreateWalletUseCase } from '../application/use-cases/create-wallet.use-case';
import { CreateCoopFareUseCase } from '../application/use-cases/create-coop-fare.use-case';

// ─── Servicios ───
import { WalletServiceImpl } from './services/wallet.service.impl';

// ─── Controladores REST ───
import { WalletController } from '../interfaces/rest/wallet.controller';
import { CoopFareController } from '../interfaces/rest/coop-fare.controller';

@Module({
  imports: [
    // Registra las entidades TypeORM para que estén disponibles
    // via InjectRepository en los repositorios de persistencia.
    TypeOrmModule.forFeature([
      WalletOrmEntity,
      CoopFareOrmEntity,
      ExchangeRateOrmEntity,
    ]),
  ],
  controllers: [
    WalletController, // Endpoints: POST /fin/wallets
    CoopFareController, // Endpoints: POST /fin/coop-fares
  ],
  providers: [
    // ─── Enlace puerto → implementación concreta ───
    // NestJS inyecta la implementación donde se use @Inject(TOKEN)
    { provide: WALLET_REPOSITORY_PORT, useClass: WalletRepositoryImpl },
    { provide: COOP_FARE_REPOSITORY_PORT, useClass: CoopFareRepositoryImpl },
    {
      provide: EXCHANGE_RATE_REPOSITORY_PORT,
      useClass: ExchangeRateRepositoryImpl,
    },

    // Servicio de wallet (implementación concreta del puerto de servicio)
    { provide: WALLET_SERVICE_PORT, useClass: WalletServiceImpl },

    // ─── Casos de uso ───
    CreateWalletUseCase, // Inyecta WalletRepositoryPort automáticamente
    CreateCoopFareUseCase, // Inyecta CoopFareRepositoryPort y ExchangeRateRepositoryPort
  ],
  exports: [
    // Expone los tokens para que otros módulos (ej: OpsModule) puedan
    // inyectar las implementaciones sin acoplarse a la infraestructura.
    WALLET_SERVICE_PORT, // Para crear wallets desde otros módulos
    COOP_FARE_REPOSITORY_PORT, // Para que OpsModule lea tarifas de cooperativa
    EXCHANGE_RATE_REPOSITORY_PORT, // Para consultar tasas de cambio vigentes
  ],
})
export class FinModule {}
