// src/modules/auth/interfaces/dto/register.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * RegisterDto — DTO de Validación para POST /auth/register
 * ═══════════════════════════════════════════════════════════════
 *
 * Define la estructura y validaciones del cuerpo de la solicitud
 * de registro. Usa class-validator para validación en runtime y
 * @nestjs/swagger para documentación OpenAPI automática.
 *
 * Campos:
 *   - phone:    obligatorio, formato E.164 (+584121234567)
 *   - email:    opcional, validación de formato email
 *   - password: obligatorio, entre 6 y 50 caracteres
 *   - fullName: obligatorio, entre 2 y 255 caracteres
 *   - cedula:   opcional, cédula venezolana (V-/E-)
 *   - role:     enum (passenger, driver, association_admin, super_admin)
 *   - category: enum (normal, student, elderly)
 *
 * Capa: Interfaces (auth) — DTO de entrada
 *
 * @module RegisterDto
 * @see AuthController.register()
 */

// ApiProperty / ApiPropertyOptional generan la documentación OpenAPI
// automáticamente. Cada decorador describe un campo en /api (Swagger UI).
// - ApiProperty: campo obligatorio en la documentación
// - ApiPropertyOptional: campo opcional (no requerido en el schema OpenAPI)
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// Decoradores de class-validator: validan los datos en RUNTIME cuando
// el DTO se usa con ValidationPipe de NestJS.
// - @IsString:       el valor debe ser string
// - @IsOptional:     el campo puede omitirse (no lanza error si falta)
// - @IsPhoneNumber:  validación de formato telefónico E.164
// - @IsEmail:        validación de formato de correo electrónico
// - @MinLength / @MaxLength: restricciones de longitud mín/máx
// - @IsEnum:         el valor debe pertenecer a un conjunto cerrado
import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
// Tipos del dominio: se usan solo como type (no se importan en runtime)
import type { UserRole, UserCategory } from '../../domain/entities/user.entity';

export class RegisterDto {
  // ─── phone ───
  // @ApiProperty: documenta el campo en Swagger como obligatorio
  // @IsPhoneNumber(): valida que el string sea un número telefónico válido
  //   en formato E.164 (ej. +584121234567). Sin argumento de país, acepta
  //   cualquier código de país válido.
  @ApiProperty({
    description: 'Número de teléfono con código de país',
    example: '+584121234567',
  })
  @IsPhoneNumber()
  phone: string;

  // ─── email (opcional) ───
  // @ApiPropertyOptional: documenta el campo como opcional en Swagger
  // @IsOptional(): permite que el campo sea undefined/ausente sin error
  // @IsEmail(): si se proporciona, valida el formato de correo electrónico
  @ApiPropertyOptional({
    description: 'Correo electrónico (opcional)',
    example: 'usuario@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  // ─── password ───
  // @IsString(): asegura que el valor sea de tipo string
  // @MinLength(6): rechaza contraseñas de menos de 6 caracteres
  // @MaxLength(50): rechaza contraseñas de más de 50 caracteres
  @ApiProperty({
    description: 'Contraseña en texto plano',
    example: 'MiPassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  // ─── fullName ───
  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  // ─── cedula (opcional) ───
  // Opcional porque no todos los roles requieren cédula (ej. pasajeros).
  // Se valida como string sin formato específico; la validación de formato
  // (V-/E-) se hará en una capa superior si es necesaria.
  @ApiPropertyOptional({
    description: 'Cédula venezolana (V-/E-)',
    example: 'V12345678',
  })
  @IsOptional()
  @IsString()
  cedula?: string;

  // ─── role ───
  // @IsEnum restringe el valor a las opciones del arreglo. Si se envía un
  // valor que no está en la lista, class-validator lanza un error de validación.
  // El type UserRole se usa solo para TypeScript; la validación runtime
  // la hace @IsEnum con los strings literales.
  @ApiProperty({
    description: 'Rol del usuario',
    enum: ['passenger', 'driver', 'association_admin', 'super_admin'],
    default: 'passenger',
  })
  @IsEnum(['passenger', 'driver', 'association_admin', 'super_admin'])
  role: UserRole;

  // ─── category ───
  // Similar a role: @IsEnum valida en runtime; UserCategory es el type de TS.
  // La categoría define la tarifa aplicable (normal, estudiante, tercera edad).
  @ApiProperty({
    description: 'Categoría tarifaria',
    enum: ['normal', 'student', 'elderly'],
    default: 'normal',
  })
  @IsEnum(['normal', 'student', 'elderly'])
  category: UserCategory;
}
