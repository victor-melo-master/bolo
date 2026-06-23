import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario (pasajero o conductor)',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'El teléfono ya está registrado' })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    // Transformar de RegisterDto a CreateUserDto
    const createUserDto: CreateUserDto = {
      phone: registerDto.phone,
      email: registerDto.email,
      password: registerDto.password,
      fullName: registerDto.fullName,
      cedula: registerDto.cedula,
      role: registerDto.role,
      category: registerDto.category,
    };

    const user = await this.createUserUseCase.execute(createUserDto);

    // Transformar entidad de dominio a DTO de respuesta
    return {
      id: user.id,
      phone: user.phone,
      email: user.email ?? undefined,
      fullName: user.fullName,
      role: user.role,
      category: user.category,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
