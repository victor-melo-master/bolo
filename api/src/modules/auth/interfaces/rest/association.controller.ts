// src/modules/auth/interfaces/rest/association.controller.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * AssociationController — Controlador de Asociaciones/Cooperativas
 * ═══════════════════════════════════════════════════════════════
 *
 * Endpoints para la gestión de asociaciones/cooperativas de transporte.
 *
 *   POST /ops/associations — Crear nueva asociación
 *     Body: CreateAssociationDto
 *     Response: 201 Association creada
 *
 * NOTA: Este controlador pertenece al módulo auth porque las asociaciones
 * se consideran parte del dominio de autenticación y usuarios (relacionadas
 * con roles association_admin y driver). La ruta /ops/associations se
 * mantiene por compatibilidad con la estructura original de la API.
 *
 * Capa: Interfaces (auth) — Controlador REST
 *
 * @module AssociationController
 * @see CreateAssociationUseCase
 */

// ─── Decoradores de NestJS ─────────────────────────────────────────────────
import { Controller, Post, Body, Req } from '@nestjs/common';
// NOTA: Los guards JwtAuthGuard y RolesGuard están comentados temporalmente
// mientras se completa la integración del flujo de autenticación.
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../../../auth/infrastructure/auth/jwt-auth.guard';
// import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
// ─── Decorador personalizado para roles ─────────────────────────────────────
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
// ─── Caso de uso de aplicación: contiene la lógica de negocio ───────────────
import { CreateAssociationUseCase } from 'src/modules/ops/application/use-cases/create-association.use-case';
// ─── DTO de aplicación de ops (módulo externo) ──────────────────────────────
import { CreateAssociationDto } from 'src/modules/ops/application/dto/create-association.dto';

// Prefijo base: /ops/associations — aunque el controlador está en auth,
// la ruta expuesta es /ops/associations por razones de legado/UX de API.
@Controller('ops/associations')
export class AssociationController {
  constructor(
    // Inyección del caso de uso de creación de asociaciones, definido en
    // el módulo ops. Se importa con ruta absoluta (src/modules/ops/...) para
    // evitar dependencias circulares y mantener la claridad del origen.
    private readonly createAssociationUseCase: CreateAssociationUseCase,
  ) {}

  // ────────────────────────────────────────────────────────────────────────────
  // POST /ops/associations — Crear nueva asociación
  // ────────────────────────────────────────────────────────────────────────────
  // Endpoint para que un association_admin cree una cooperativa.
  // @Roles('association_admin') es un decorador personalizado que verifica
  // el rol en runtime (sin guard activo actualmente porque los guards
  // están comentados temporalmente).
  @Post()
  // TODO: Re-activar cuando JwtAuthGuard y RolesGuard estén operativos:
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('association_admin')
  async create(@Req() req: any, @Body() dto: CreateAssociationDto) {
    // ─── ID fijo temporal ───
    // Mientras no se active la autenticación JWT, se usa un admin ID hardcodeado
    // para poder avanzar con el desarrollo. El admin ID real vendrá de req.user.userId
    // una vez que JwtAuthGuard esté operativo.
    const adminId = '3790a434-b745-4e27-84a3-3452365cb51f';
    return this.createAssociationUseCase.execute(adminId, dto);
  }
}
