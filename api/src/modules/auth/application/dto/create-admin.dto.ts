// auth/application/dto/create-admin.dto.ts
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  cedula?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['driver', 'association_admin', 'super_admin'])
  role: string;

  @IsOptional()
  @IsString()
  associationId?: string;
}
