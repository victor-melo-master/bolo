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
import { IsCedulaOrPassport } from '../../../../shared/interfaces/decorators/is-cedula-or-passport.decorator';

export class UpdatePassengerDto {
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
  @IsCedulaOrPassport()
  cedula?: string;

  @IsOptional()
  @IsString()
  @IsIn(['normal', 'student', 'elderly'])
  category?: string;
}
