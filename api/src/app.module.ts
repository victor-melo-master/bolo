// src/app.module.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AppModule — Módulo Raíz de la Aplicación
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta todos los módulos funcionales del monolito y configura los servicios
 * globales de infraestructura:
 *
 *   - ConfigModule:  carga .env y expone ConfigService globalmente
 *   - TypeOrmModule: conecta a PostgreSQL usando la configuración compartida
 *   - AuthModule:    autenticación, usuarios, asociaciones, solicitudes de conductor
 *   - FinModule:     (pendiente) billetera digital, transacciones, tarifas
 *   - TripModule:    (pendiente) viajes, pagos, historial GPS
 *   - AuditModule:   (pendiente) logs de auditoría inmutables
 *
 * Capa: Infraestructura (composición de módulos)
 * Dependencias:
 *   - TypeORM + PostgreSQL: fuente de verdad del sistema
 *   - @nestjs/config: variables de entorno globales
 *   - AuthModule: módulo funcional implementado
 *
 * @module AppModule
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { typeOrmConfig } from './shared/infrastructure/database/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    // TODO: Activar cuando estén implementados
    // FinModule,
    // TripModule,
    // AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
