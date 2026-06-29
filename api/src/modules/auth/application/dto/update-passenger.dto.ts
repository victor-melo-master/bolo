// auth/application/dto/update-passenger.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UpdatePassengerDto — Actualización de pasajero
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO parcial (todos los campos opcionales) para actualizar datos
 * de un pasajero existente, incluyendo su categoría.
 *
 * Capa: Aplicación (auth)
 *
 * @module UpdatePassengerDto
 */
import { IsString, IsOptional, IsEmail, IsIn } from 'class-validator';

export class UpdatePassengerDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  cedula?: string;

  @IsOptional()
  @IsString()
  @IsIn(['normal', 'student', 'elderly'])
  category?: string;
}
