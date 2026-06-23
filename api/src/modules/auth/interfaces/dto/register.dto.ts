import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import type { UserRole, UserCategory } from '../../domain/entities/user.entity';
export class RegisterDto {
  @ApiProperty({
    description: 'Número de teléfono con código de país',
    example: '+584121234567',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico (opcional)',
    example: 'usuario@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Contraseña en texto plano',
    example: 'MiPassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({
    description: 'Cédula venezolana (V-/E-)',
    example: 'V12345678',
  })
  @IsOptional()
  @IsString()
  cedula?: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: ['passenger', 'driver', 'association_admin', 'super_admin'],
    default: 'passenger',
  })
  @IsEnum(['passenger', 'driver', 'association_admin', 'super_admin'])
  role: UserRole;

  @ApiProperty({
    description: 'Categoría tarifaria',
    enum: ['normal', 'student', 'elderly'],
    default: 'normal',
  })
  @IsEnum(['normal', 'student', 'elderly'])
  category: UserCategory;
}
