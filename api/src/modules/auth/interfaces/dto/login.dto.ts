// src/modules/auth/interfaces/dto/login.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginDto — DTO de Validación para POST /auth/login
 * ═══════════════════════════════════════════════════════════════
 *
 * Define la estructura del cuerpo de inicio de sesión.
 * Incluye un campo email opcional (reservado para futuro login
 * por correo), aunque actualmente solo se usa phone + password.
 *
 * Capa: Interfaces (auth) — DTO de entrada
 *
 * @module LoginDto
 * @see AuthController.login()
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ description: 'Correo electrónico (opcional)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Número de teléfono con código de país',
    example: '+584141234567',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Contraseña',
    example: 'MiPassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
