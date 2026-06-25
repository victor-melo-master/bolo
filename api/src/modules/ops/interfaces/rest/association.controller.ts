// src/modules/ops/interfaces/rest/association.controller.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * OpsAssociationController — Controlador REST para asociaciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Expone endpoints REST para la gestión de asociaciones desde el
 * módulo de operaciones. Actualmente solo expone la creación.
 *
 * Endpoints:
 *   POST /ops/associations — Crea una nueva asociación (requiere rol association_admin)
 *
 * Protegido por JwtAuthGuard + RolesGuard.
 *
 * Nota: Este controlador sirve como fachada del módulo auth para
 * operaciones de asociaciones desde el contexto de ops.
 *
 * Capa: Interfaces (ops)
 *
 * @module OpsAssociationController
 */

// ─── Importaciones ───

import { Controller, Post, Body, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common'; // import de guards aún activo
import { JwtAuthGuard } from '../../../auth/infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
import { CreateAssociationUseCase } from '../../application/use-cases/create-association.use-case';
import { CreateAssociationDto } from '../../application/dto/create-association.dto';

// ─── Controlador ───

@Controller('ops/associations') // Prefijo base: /ops/associations
export class OpsAssociationController {
  constructor(
    private readonly createAssociationUseCase: CreateAssociationUseCase, // Caso de uso inyectado por DI
  ) {}

  /**
   * POST /ops/associations
   * Crea una nueva asociación de transporte.
   *
   * @param req — Request de Express con user (payload JWT)
   * @param dto — Datos de la asociación validados por class-validator
   * @returns La asociación recién creada
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Autenticación + autorización por roles
  @Roles('association_admin') // Solo association_admin puede ejecutar esta acción
  async create(@Req() req: any, @Body() dto: CreateAssociationDto) {
    // Extrae el userId del token JWT para identificar al admin solicitante
    const adminId = req.user.userId;
    // Delega la lógica de negocio al caso de uso correspondiente
    return this.createAssociationUseCase.execute(adminId as string, dto);
  }
}
