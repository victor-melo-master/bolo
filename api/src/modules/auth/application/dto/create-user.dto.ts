// src/modules/auth/application/dto/create-user.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateUserDto — DTO de Aplicación para Crear Usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Objeto de transferencia de datos que recibe el caso de uso
 * CreateUserUseCase desde el controlador. Contiene los datos
 * necesarios para el registro de un nuevo usuario.
 *
 * Diferencia con RegisterDto (interfaces/dto):
 *   - RegisterDto tiene decoradores de validación y Swagger
 *   - CreateUserDto es un DTO interno, sin decoradores, usado
 *     dentro de la capa de aplicación
 *
 * Capa: Aplicación (auth) — DTO de entrada
 *
 * @module CreateUserDto
 * @see RegisterDto
 */

import { UserRole, UserCategory } from '../../domain/entities/user.entity';

export class CreateUserDto {
  phone: string;
  email?: string;
  password: string;
  fullName: string;
  cedula?: string;
  role: UserRole;
  category: UserCategory;
}
