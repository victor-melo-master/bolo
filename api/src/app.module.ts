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

// ─── Módulos base de NestJS ───
import { Module } from '@nestjs/common'; // @Module: decorador que define un módulo NestJS con imports, controllers y providers
import { TypeOrmModule } from '@nestjs/typeorm'; // TypeOrmModule.forRoot(): integración de TypeORM con NestJS para PostgreSQL
import { ConfigModule } from '@nestjs/config'; // ConfigModule.forRoot(): carga variables de entorno y las expone globalmente

// ─── Módulos funcionales del monolito ───
import { AuthModule } from './modules/auth/infrastructure/auth.module'; // Autenticación (JWT, usuarios, roles, asociaciones)
// import { FinModule } from './modules/fin/infrastructure/fin.module'; // Módulo financiero (billetera digital, tarifas, transacciones)
// import { OpsModule } from './modules/ops/infrastructure/ops.module'; // Módulo operativo (rutas, geolocalización, gestión de flota)

// ─── Configuración compartida ───
import { typeOrmConfig } from './shared/infrastructure/database/typeorm.config'; // Configuración de TypeORM: host, puerto, credenciales, entidades

// ─── Controladores y servicios del módulo raíz ───
import { AppController } from './app.controller'; // Controlador raíz: responde en GET / con "Hello World!"
import { AppService } from './app.service'; // Servicio raíz: lógica del endpoint de bienvenida

@Module({
  imports: [
    // ConfigModule forRoot con isGlobal:true evita tener que importarlo en cada submódulo
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // TypeOrmModule.forRoot usa la configuración compartida para conectar a PostgreSQL
    TypeOrmModule.forRoot(typeOrmConfig),
    // AuthModule es el único módulo funcional implementado; los demás están comentados
    AuthModule,
    // FinModule, // Módulo financiero (billetera, tarifas, transacciones)
    // OpsModule,
    // TODO: Activar cuando estén implementados
    // TripModule,    // Módulo de viajes (tracking GPS, pagos)
    // AuditModule,   // Módulo de auditoría (logs inmutables)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
