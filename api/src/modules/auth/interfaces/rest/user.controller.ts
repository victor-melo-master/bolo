// src/modules/auth/interfaces/rest/user.controller.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UserController — Controlador de Usuarios
 * ═══════════════════════════════════════════════════════════════
 *
 * Endpoints para consulta y gestión de usuarios.
 *
 *   GET /users/:id — Obtener usuario por ID (pendiente de implementar)
 *
 * NOTA: Actualmente solo es un placeholder. La funcionalidad real
 * requerirá un nuevo caso de uso (GetUserUseCase).
 *
 * Capa: Interfaces (auth) — Controlador REST
 *
 * @module UserController
 */

import { Controller, Get, Param } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { message: 'Get user endpoint', id };
  }
}
