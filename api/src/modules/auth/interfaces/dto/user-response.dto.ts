import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: string;

  @ApiProperty({ description: 'Número de teléfono' })
  phone: string;

  @ApiPropertyOptional({ description: 'Correo electrónico' })
  email?: string;

  @ApiProperty({ description: 'Nombre completo' })
  fullName: string;

  @ApiProperty({ description: 'Rol del usuario' })
  role: string;

  @ApiProperty({ description: 'Categoría tarifaria' })
  category: string;

  @ApiProperty({ description: 'Si el usuario está activo' })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;
}
