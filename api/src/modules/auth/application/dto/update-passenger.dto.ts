// auth/application/dto/update-passenger.dto.ts
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
