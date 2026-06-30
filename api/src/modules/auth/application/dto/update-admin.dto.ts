// auth/application/dto/update-admin.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UpdateAdminDto — Actualización de administrador
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO parcial (todos los campos opcionales) para actualizar datos
 * de un administrador existente.
 *
 * Capa: Aplicación (auth)
 *
 * @module UpdateAdminDto
 */
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsEmail(
    { require_tld: true, allow_ip_domain: false },
    { message: 'El email no tiene un formato válido' },
  )
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  cedula?: string;
}
