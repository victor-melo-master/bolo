// src/modules/auth/interfaces/dto/user-response.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UserResponseDto — DTO de Respuesta para Datos de Usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Define la estructura de los datos de usuario expuestos al cliente.
 * Oculta campos sensibles como passwordHash, jwtKey, qrKey, etc.
 *
 * Se usa como tipo de retorno en:
 *   - POST /auth/register
 *   - GET /auth/profile (futuro)
 *   - GET /users/:id (futuro)
 *
 * Capa: Interfaces (auth) — DTO de salida
 *
 * @module UserResponseDto
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: string;

  @ApiProperty({ description: 'Número de teléfono' })
  phone: string;

  @ApiPropertyOptional({ description: 'Correo electrónico' })
  email?: string;

  @ApiProperty({ description: 'Nombre completo' })
  fullName: string;

  @ApiProperty({ description: 'Rol del usuario' })
  role: string;

  @ApiProperty({ description: 'Categoría tarifaria' })
  category: string;

  @ApiProperty({ description: 'Si el usuario está activo' })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;
}
