// src/app.module.ts — Ruta relativa desde src/
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

import { Module } from '@nestjs/common';              // Decorador @Module para definir módulos NestJS
import { TypeOrmModule } from '@nestjs/typeorm';      // Módulo de integración TypeORM para NestJS
import { AuthModule } from './modules/auth/infrastructure/auth.module';  // Único módulo funcional implementado
import { typeOrmConfig } from './shared/infrastructure/database/typeorm.config';  // Config compartida de PostgreSQL
import { ConfigModule } from '@nestjs/config';         // Módulo para variables de entorno
import { AppController } from './app.controller';      // Controlador raíz (GET /)
import { AppService } from './app.service';            // Servicio raíz

@Module({
  imports: [
    // ConfigModule forRoot con isGlobal:true evita tener que importarlo en cada submódulo
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // TypeOrmModule.forRoot usa la configuración compartida para conectar a PostgreSQL
    TypeOrmModule.forRoot(typeOrmConfig),
    // AuthModule es el único módulo funcional implementado; los demás están comentados
    AuthModule,
    // TODO: Activar cuando estén implementados
    // FinModule,     // Módulo financiero (billetera, tarifas, transacciones)
    // TripModule,    // Módulo de viajes (tracking GPS, pagos)
    // AuditModule,   // Módulo de auditoría (logs inmutables)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
