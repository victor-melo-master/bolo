// auth/application/dto/create-passenger.dto.ts
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';

export class CreatePassengerDto {
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

  @IsOptional()
  @IsString()
  @IsIn(['normal', 'student', 'elderly'])
  category?: string;
}
