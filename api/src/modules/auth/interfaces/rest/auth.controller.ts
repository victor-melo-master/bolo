// src/modules/auth/interfaces/rest/auth.controller.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AuthController — Controlador de Autenticación
 * ═══════════════════════════════════════════════════════════════
 *
 * Endpoints públicos de autenticación:
 *
 *   POST /auth/register — Registro de nuevo usuario
 *     Body: RegisterDto (phone, password, fullName, role, category, ...)
 *     Response: 201 UserResponseDto
 *
 *   POST /auth/login — Inicio de sesión
 *     Body: LoginDto (phone, password)
 *     Response: 200 { accessToken: string, user: {...} }
 *
 *   GET /auth/profile — Perfil del usuario autenticado (JWT requerido)
 *     Header: Authorization: Bearer <token>
 *     Response: 200 payload del JWT (userId, phone, role)
 *
 * Capa: Interfaces (auth) — Controlador REST
 * Dependencias:
 *   - CreateUserUseCase: registro
 *   - LoginUseCase: autenticación
 *   - JwtAuthGuard: protección del perfil
 *
 * @module AuthController
 */

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con teléfono y contraseña' })
  @ApiResponse({ status: 200, description: 'Login exitoso (devuelve JWT)' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.phone, loginDto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProfile(@Request() req) {
    return req.user;
  }
}
