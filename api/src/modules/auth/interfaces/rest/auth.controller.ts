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

// ─── Decoradores de NestJS para definir rutas HTTP, manejar el cuerpo de la
//     solicitud, proteger endpoints con guards y establecer códigos de estado ───
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
// ─── Decoradores de Swagger para generar documentación OpenAPI automática ───
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
// ─── DTOs de la capa de interfaces: validan la entrada/salida de la API ───
import { RegisterDto } from '../dto/register.dto';
import { UserResponseDto } from '../dto/user-response.dto';
// ─── Caso de uso de aplicación: contiene la lógica de negocio del registro ───
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
// ─── DTO de aplicación: estructura con la que trabaja la capa de aplicación,
//     independiente de cómo lleguen los datos desde HTTP ───
import { CreateUserDto } from '../../application/dto/create-user.dto';
// ─── Caso de uso de aplicación: contiene la lógica de negocio del login ───
import { LoginUseCase } from '../../application/use-cases/login.use-case';
// ─── DTO de interfaz para el login (entrada HTTP) ───
import { LoginDto } from '../dto/login.dto';
// ─── Guard personalizado que valida el token JWT en el header Authorization ───
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

// Agrupa todos los endpoints bajo la etiqueta "auth" en Swagger
@ApiTags('auth')
// Prefijo base: todas las rutas empiezan con /auth
@Controller('auth')
export class AuthController {
  constructor(
    // Inyección de dependencias: NestJS provee las instancias de los casos de uso
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  // ────────────────────────────────────────────────────────────────────────────
  // POST /auth/register — Registro de nuevo usuario
  // ────────────────────────────────────────────────────────────────────────────

  @Post('register')
  // Se establece EXPLÍCITAMENTE HttpStatus.CREATED (201) porque, aunque NestJS
  // devuelve 201 por defecto en los POST, al hacerlo explícito queda documentado
  // en Swagger y protegido ante posibles cambios de convención en el framework.
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
    // ─── Conversión de DTO de interfaz → DTO de aplicación ───
    // Se mapea el RegisterDto (lo que llega por HTTP) a un CreateUserDto
    // (la estructura que entiende el caso de uso). Esto desacopla la capa
    // de interfaz (HTTP) de la capa de aplicación (lógica de negocio),
    // permitiendo que ambas evolucionen de forma independiente.
    const createUserDto: CreateUserDto = {
      phone: registerDto.phone,
      email: registerDto.email,
      password: registerDto.password,
      fullName: registerDto.fullName,
      cedula: registerDto.cedula,
      role: registerDto.role,
      category: registerDto.category,
    };

    // Ejecuta la lógica de negocio del registro y espera el resultado
    const user = await this.createUserUseCase.execute(createUserDto);

    // ─── Conversión de entidad de aplicación → DTO de interfaz de salida ───
    // Se mapea la entidad devuelta por el caso de uso a UserResponseDto,
    // que es la estructura que se expone al cliente. Así se ocultan campos
    // sensibles (passwordHash, jwtKey, etc.) que existen en la entidad pero
    // no deben llegar al cliente.
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

  // ────────────────────────────────────────────────────────────────────────────
  // POST /auth/login — Inicio de sesión
  // ────────────────────────────────────────────────────────────────────────────

  @Post('login')
  // Se establece EXPLÍCITAMENTE HttpStatus.OK (200) porque NestJS devuelve 201
  // por defecto en todos los POST. Como login no crea un recurso, sino que
  // devuelve un token, el código correcto es 200 (OK), no 201 (Created).
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con teléfono y contraseña' })
  @ApiResponse({ status: 200, description: 'Login exitoso (devuelve JWT)' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    // Delega directamente en el caso de uso; no hay conversión de DTO porque
    // LoginUseCase.execute() acepta phone y password como parámetros primitivos
    return this.loginUseCase.execute(loginDto.phone, loginDto.password);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GET /auth/profile — Perfil del usuario autenticado
  // ────────────────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  // JwtAuthGuard protege /profile porque este endpoint solo debe ser accesible
  // con un token JWT válido. El guard:
  //   1. Extrae el token del header Authorization: Bearer <token>
  //   2. Verifica la firma y expiración del JWT
  //   3. Si es válido, inyecta el payload decodificado en req.user
  //   4. Si no es válido, lanza UnauthorizedException (401)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProfile(@Request() req) {
    // req.user es establecido por JwtAuthGuard después de validar el token.
    // Contiene el payload del JWT (userId, phone, role).
    return req.user;
  }
}
