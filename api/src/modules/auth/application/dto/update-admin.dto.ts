// auth/application/dto/update-admin.dto.ts
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  cedula?: string;
}
