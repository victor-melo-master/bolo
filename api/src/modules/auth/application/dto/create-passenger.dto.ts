// auth/application/dto/create-passenger.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreatePassengerDto — Creación de pasajero
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO que valida los datos de entrada para registrar un nuevo pasajero
 * mediante class-validator. Soporta categorías: normal, student, elderly.
 *
 * Capa: Aplicación (auth)
 *
 * @module CreatePassengerDto
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

export class CreatePassengerDto {
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

  @IsOptional()
  @IsString()
  @IsIn(['normal', 'student', 'elderly'])
  category?: string;
}
