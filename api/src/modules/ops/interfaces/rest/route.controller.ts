// src/modules/ops/interfaces/rest/route.controller.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * RouteController — Controlador REST para operaciones de rutas
 * ═══════════════════════════════════════════════════════════════
 *
 * Expone endpoints REST para la gestión de rutas de transporte.
 * Endpoints:
 *   POST /ops/routes — Crea una nueva ruta (requiere rol association_admin)
 *
 * Todas las rutas están protegidas por JwtAuthGuard (autenticación)
 * y RolesGuard (autorización por roles).
 *
 * Capa: Interfaces (ops)
 *
 * @module RouteController
 */

// ─── Importaciones ───

import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
import { CreateRouteUseCase } from '../../application/use-cases/create-route.use-case';
import { CreateRouteDto } from '../../application/dto/create-route.dto';

// ─── Controlador ───

@Controller('ops/routes') // Prefijo base: /ops/routes
export class RouteController {
  constructor(
    private readonly createRouteUseCase: CreateRouteUseCase, // Caso de uso inyectado por DI
  ) {}

  /**
   * POST /ops/routes
   * Crea una nueva ruta para la asociación del usuario autenticado.
   *
   * @param req — Request de Express extendido con user (payload del JWT)
   * @param dto — Cuerpo de la petición validado por class-validator
   * @returns La ruta recién creada
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Autenticación JWT + autorización por rol
  @Roles('association_admin') // Solo usuarios con rol association_admin pueden crear rutas
  async create(@Req() req: any, @Body() dto: CreateRouteDto) {
    // Extrae el associationId del token JWT (inyectado por JwtAuthGuard en req.user)
    const associationId = req.user.associationId;
    if (!associationId) {
      throw new Error('No perteneces a una asociación');
    }
    // Delega la lógica de negocio al caso de uso
    return this.createRouteUseCase.execute(associationId as string, dto);
  }
}
