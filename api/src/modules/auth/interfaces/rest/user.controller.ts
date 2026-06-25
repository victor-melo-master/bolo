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

// Decoradores de NestJS para definir rutas y extraer parámetros de la URL
import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
// Se importa CreateUserUseCase por compatibilidad con el módulo, aunque
// todavía no se usa directamente; se reemplazará por GetUserUseCase en el futuro
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
import { CreateUserDto } from '../../application/dto/create-user.dto';
// Prefijo base: todas las rutas empiezan con /users
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  // ────────────────────────────────────────────────────────────────────────────
  // GET /users/:id — Obtener usuario por ID (PLACEHOLDER)
  // ────────────────────────────────────────────────────────────────────────────
  // Endpoint pendiente de implementación. Actualmente solo devuelve un mensaje
  // y el ID recibido. La implementación real requerirá:
  //   1. Un nuevo caso de uso (ej. GetUserUseCase)
  //   2. Un DTO de respuesta (posiblemente reutilizar UserResponseDto)
  //   3. Protección con JwtAuthGuard para usuarios autenticados
  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: 'Get user endpoint', id };
  }

  @Post('admins')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async createAssociationAdmin(@Body() dto: CreateUserDto) {
    dto.role = 'association_admin';
    return this.createUserUseCase.execute(dto); // ← usa createUserUseCase
    // return this.createAssociationUseCase.execute(adminId, dto);
    // return this.createUserUseCase.execute(dto);
  }
}
