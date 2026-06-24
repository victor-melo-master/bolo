// src/modules/auth/interfaces/rest/association.controller.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AssociationController — Controlador de Asociaciones/Cooperativas
 * ═══════════════════════════════════════════════════════════════
 *
 * Endpoints para gestión de cooperativas.
 *
 *   GET /associations/:id — Obtener asociación por ID (pendiente)
 *   POST /associations   — Crear nueva asociación (pendiente)
 *
 * NOTA: Ambos endpoints son placeholders. La implementación real
 * requerirá casos de uso y DTOs específicos.
 *
 * Capa: Interfaces (auth) — Controlador REST
 *
 * @module AssociationController
 */

// Decoradores de NestJS para definir rutas GET/POST y extraer parámetros/cuerpo
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

// Prefijo base: todas las rutas empiezan con /associations
@Controller('associations')
export class AssociationController {
  // ────────────────────────────────────────────────────────────────────────────
  // GET /associations/:id — Obtener asociación por ID (PLACEHOLDER)
  // ────────────────────────────────────────────────────────────────────────────
  // Endpoint pendiente. Requerirá un caso de uso específico y un DTO de salida.
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { message: 'Get association endpoint', id };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // POST /associations — Crear nueva asociación (PLACEHOLDER)
  // ────────────────────────────────────────────────────────────────────────────
  // Endpoint pendiente. Requerirá un caso de uso (ej. CreateAssociationUseCase)
  // y un DTO de entrada con validaciones (nombre, RIF, dirección, etc.).
  // Actualmente usa `any` como tipo del body como marcador de posición.
  @Post()
  async create(@Body() createAssociationDto: any) {
    return { message: 'Create association endpoint' };
  }
}
