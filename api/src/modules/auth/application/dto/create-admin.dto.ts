// auth/application/dto/create-admin.dto.ts
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';
import { IsVenezuelanPhone } from '../../../../shared/interfaces/decorators/is-venezuelan-phone.decorator';
import { IsCedulaOrPassport } from 'src/shared/interfaces/decorators/is-cedula-or-passport.decorator';

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
  @IsString()
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
