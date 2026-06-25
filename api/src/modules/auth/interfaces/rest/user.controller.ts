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

// ─── Decoradores de NestJS para definir rutas HTTP, extraer parámetros,
//     proteger endpoints con guards y manejar excepciones ──────────────────────
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
// ─── Casos de uso de la capa de aplicación ──────────────────────────────────
// Se importa CreateUserUseCase por compatibilidad con el módulo, aunque
// todavía no se usa directamente en todos los endpoints; se reemplazará
// por GetUserUseCase en el futuro para el GET /users/:id
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
// ─── Guards de autenticación y autorización ─────────────────────────────────
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
// ─── Decorador personalizado para verificación de roles ─────────────────────
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
// ─── DTO de aplicación: estructura con la que trabaja el caso de uso ────────
import { CreateUserDto } from '../../application/dto/create-user.dto';

// Prefijo base: todas las rutas empiezan con /users
@Controller('users')
export class UserController {
  constructor(
    // Inyección del caso de uso CreateUserUseCase para la creación de
    // usuarios administradores de asociación (POST /users/admins)
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

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

  // ────────────────────────────────────────────────────────────────────────────
  // POST /users/admins — Crear administrador de asociación
  // ────────────────────────────────────────────────────────────────────────────
  // Endpoint protegido: requiere JWT válido Y rol super_admin o association_admin.
  // El association_admin solo puede crear admins dentro de su propia asociación.
  // El super_admin puede crear admins sin asociación (associationId undefined).
  @Post('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'association_admin')
  async createAssociationAdmin(@Req() req: any, @Body() dto: CreateUserDto) {
    // Forza el rol del nuevo usuario a association_admin, independientemente
    // de lo que el creador haya enviado en el body (seguridad: evitar que
    // un super_admin cree usuarios con roles no deseados en este endpoint).
    dto.role = 'association_admin';

    // Si el creador es un association_admin, hereda su asociación al nuevo admin
    if (req.user.role === 'association_admin') {
      // Verifica que el creador pertenezca a una asociación; si no, rechaza
      // la operación porque no se puede crear un admin sin asociación asignada
      if (!req.user.associationId) {
        throw new BadRequestException(
          'No perteneces a ninguna asociación. Crea tu asociación primero.',
        );
      }
      // Asigna la misma associationId del creador al nuevo admin.
      // Esto garantiza que un association_admin solo pueda crear admins
      // dentro de su propia cooperativa, no en otras.
      dto.associationId = req.user.associationId;
    }
    // Si el creador es super_admin, dto.associationId queda undefined,
    // permitiendo crear admins sin asociación (se asignará después).

    return this.createUserUseCase.execute(dto);
  }
}
