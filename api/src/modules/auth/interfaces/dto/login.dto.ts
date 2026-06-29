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

// ApiProperty / ApiPropertyOptional: decoradores de Swagger que generan
// la documentación OpenAPI automática. Sin ellos, los campos no aparecerían
// en la interfaz de Swagger UI.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// Decoradores de class-validator: validan los datos en RUNTIME.
// NestJS ejecuta estas validaciones automáticamente cuando el DTO se usa
// con ValidationPipe (configurado globalmente en main.ts).
// - @IsString:     el valor debe ser string
// - @IsNotEmpty:   el string no puede estar vacío
// - @MinLength:    longitud mínima del string
// - @IsOptional:   el campo puede omitirse
// - @IsEmail:      validación de formato de correo
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { IsVenezuelanPhone } from '../../../../shared/interfaces/decorators/is-venezuelan-phone.decorator';

export class LoginDto {
  // ─── email (opcional, reservado para uso futuro) ───
  // Actualmente el login usa solo phone + password, pero se incluye email
  // como campo opcional para permitir en el futuro inicio de sesión con correo.
  @ApiPropertyOptional({ description: 'Correo electrónico (opcional)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  // ─── phone ───
  // @IsVenezuelanPhone(): valida que sea un número móvil venezolano válido
  @ApiProperty({
    description: 'Número de teléfono con código de país',
    example: '+584141234567',
  })
  @IsVenezuelanPhone()
  phone: string;

  // ─── password ───
  // @MinLength(6): rechaza contraseñas menores a 6 caracteres como validación
  //   temprana en la capa HTTP, antes de llegar al caso de uso
  @ApiProperty({
    description: 'Contraseña',
    example: 'MiPassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
