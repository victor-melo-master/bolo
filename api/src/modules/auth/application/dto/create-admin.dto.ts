// auth/application/dto/create-admin.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateAdminDto — Creación de administrador/conductor
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO que valida los datos de entrada para registrar un nuevo admin
 * (driver, association_admin o super_admin) mediante class-validator.
 *
 * Capa: Aplicación (auth)
 *
 * @module CreateAdminDto
 */
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsIn,
  Matches,
  IsEmail,
} from 'class-validator';
import { IsVenezuelanPhone } from '../../../../shared/interfaces/decorators/is-venezuelan-phone.decorator';
import { IsCedulaOrPassport } from '../../../../shared/interfaces/decorators/is-cedula-or-passport.decorator';

export class CreateAdminDto {
  @IsVenezuelanPhone()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsEmail(
    { require_tld: true, allow_ip_domain: false },
    { message: 'El email no tiene un formato válido' },
  )
  email?: string;

  @IsOptional()
  @IsCedulaOrPassport()
  cedula?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['driver', 'association_admin', 'super_admin'])
  role: string;

  @IsOptional()
  @IsString()
  associationId?: string;
}
