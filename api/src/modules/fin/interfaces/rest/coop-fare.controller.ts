// src/modules/fin/interfaces/rest/coop-fare.controller.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFareController — Controlador REST de Tarifarios
 * ═══════════════════════════════════════════════════════════════
 *
 * Expone endpoints para la gestión de tarifarios de cooperativas.
 * Ruta base: /fin/coop-fares
 *
 * Requiere autenticación JWT y rol 'association_admin'.
 *
 * Capa: Interfaces (fin/rest)
 *
 * @module CoopFareController
 */

// ─── Importaciones de NestJS ───
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

// ─── Guards de autenticación y autorización ───
import { JwtAuthGuard } from '../../../auth/infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';

// ─── Casos de uso ───
import { CreateCoopFareUseCase } from '../../application/use-cases/create-coop-fare.use-case';

// ─── DTOs de aplicación ───
import { CreateCoopFareDto } from '../../application/dto/create-coop-fare.dto';

@Controller('fin/coop-fares')
export class CoopFareController {
  constructor(
    // Inyecta directamente el caso de uso (no pasa por servicio/puerto)
    private readonly createCoopFareUseCase: CreateCoopFareUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // Retorna 201 Created en lugar de 200 OK
  @UseGuards(JwtAuthGuard, RolesGuard) // Requiere token JWT válido y rol específico
  @Roles('association_admin') // Solo administradores de asociación pueden crear tarifarios
  async create(@Req() req: any, @Body() dto: CreateCoopFareDto) {
    // Extrae el associationId del token JWT (inyectado por JwtAuthGuard)
    const associationId = req.user.associationId;
    if (!associationId) {
      throw new Error('No perteneces a una asociación');
    }
    return this.createCoopFareUseCase.execute(associationId as string, dto);
  }
}
