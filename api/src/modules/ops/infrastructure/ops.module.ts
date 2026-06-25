// src/modules/ops/infrastructure/ops.module.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * OpsModule — Módulo NestJS de operaciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Agrupa todas las capacidades del módulo de operaciones:
 * - Rutas de transporte (CRUD)
 * - Asociaciones (delegado parcialmente a auth)
 * - Vehículos y asignaciones (pendiente)
 *
 * Importa AuthModule (para guards y entidades de usuario/asociación)
 * y FinModule (para el repositorio de tarifarios).
 * Registra la entidad RouteOrmEntity en TypeORM y vincula el puerto
 * ROUTE_REPOSITORY_PORT con su implementación concreta RouteRepositoryImpl.
 *
 * Capa: Infraestructura (ops)
 *
 * @module OpsModule
 */

// ─── Importaciones de NestJS ───

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ─── Importaciones de otros módulos ───

import { AuthModule } from '../../auth/infrastructure/auth.module';
import { FinModule } from '../../fin/infrastructure/fin.module'; // Necesita COOP_FARE_REPOSITORY_PORT

// ─── Importaciones del módulo ops ───

import { RouteOrmEntity } from './orm/route.orm-entity';
import { RouteRepositoryImpl } from './persistence/route.repository.impl';
import { ROUTE_REPOSITORY_PORT } from '../domain/interfaces/repositories/route.repository.port';

import { CreateRouteUseCase } from '../application/use-cases/create-route.use-case';
import { RouteController } from '../interfaces/rest/route.controller';

// ─── Configuración del Módulo ───

@Module({
  imports: [
    AuthModule, // Provee guards JWT, entidades de auth (User, Association)
    FinModule, // Provee COOP_FARE_REPOSITORY_PORT para validar tarifarios
    TypeOrmModule.forFeature([RouteOrmEntity]), // Registra la entidad Route en el contexto de TypeORM
  ],
  controllers: [RouteController], // Controladores REST expuestos
  providers: [
    {
      provide: ROUTE_REPOSITORY_PORT, // Token del puerto (interfaz)
      useClass: RouteRepositoryImpl, // Implementación concreta (adaptador TypeORM)
    },
    CreateRouteUseCase, // Caso de uso registrado como provider
  ],
})
export class OpsModule {} // El módulo se importa desde app.module para activar rutas y DI
