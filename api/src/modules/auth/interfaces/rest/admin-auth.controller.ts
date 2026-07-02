// auth/interfaces/rest/admin-auth.controller.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AdminAuthController — Controlador REST de autenticación de administradores
 * ═══════════════════════════════════════════════════════════════
 *
 * Controlador que expone los endpoints públicos y protegidos para el módulo
 * de autenticación de administradores: login, creación (solo super_admin),
 * perfil, actualización, eliminación y cambio de contraseña.
 *
 * Capa: Interfaces (auth)
 * Dependencias:
 *   - CreateAdminUseCase: caso de uso de creación de admin
 *   - LoginAdminUseCase: caso de uso de login de admin
 *   - GetAdminProfileUseCase: caso de uso de obtención de perfil
 *   - UpdateAdminUseCase: caso de uso de actualización de admin
 *   - DeleteAdminUseCase: caso de uso de eliminación de admin
 *   - ChangeAdminPasswordUseCase: caso de uso de cambio de contraseña
 *
 * @module AdminAuthController
 */
import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CreateAdminUseCase } from '../../application/use-cases/create-admin.use-case';
import { CreateAdminDto } from '../../application/dto/create-admin.dto';
import { LoginAdminUseCase } from '../../application/use-cases/login-admin.use-case';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
import { GetAdminProfileUseCase } from '../../application/use-cases/get-admin-profile.use-case';
import { UpdateAdminDto } from '../../application/dto/update-admin.dto'; // ← corregido
import { UpdateAdminUseCase } from '../../application/use-cases/update-admin.use-case';
import { DeleteAdminUseCase } from '../../application/use-cases/delete-admin.use-case';
import { ChangeAdminPasswordUseCase } from '../../application/use-cases/change-admin-password.use-case';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { NotSuperAdminGuard } from '../../infrastructure/auth/not-super-admin.guard';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(
    private readonly createAdminUseCase: CreateAdminUseCase,
    private readonly loginAdminUseCase: LoginAdminUseCase,
    private readonly getProfileUseCase: GetAdminProfileUseCase,
    private readonly updateAdminUseCase: UpdateAdminUseCase,
    private readonly deleteAdminUseCase: DeleteAdminUseCase,
    private readonly changePasswordUseCase: ChangeAdminPasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  // 🚫 Registro público ELIMINADO por seguridad.
  // Solo el endpoint 'create' (protegido para super_admin) puede crear admins.

  // Login con rate limiting (5 intentos por minuto)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: any) {
    const result = await this.loginAdminUseCase.execute(
      dto.phone,
      dto.password,
    );

    // Setear la cookie httpOnly manualmente
    const cookieString = `token=${result.accessToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`;
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Set-Cookie', cookieString + '; Secure');
    } else {
      res.setHeader('Set-Cookie', cookieString);
    }

    return result;
  }
  // Crear admin (solo super_admin)
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() dto: CreateAdminDto) {
    const admin = await this.createAdminUseCase.execute(dto);
    return {
      id: admin.id,
      phone: admin.phone,
      fullName: admin.fullName,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      email: admin.email, // ← añadir
      cedula: admin.cedula, // ← añadir
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.getProfileUseCase.execute(req.user.userId as string);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateAdminDto) {
    // ← DTO corregido
    return this.updateAdminUseCase.execute(req.user.userId as string, dto);
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard, NotSuperAdminGuard) // nuevo guard
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Req() req: any) {
    await this.deleteAdminUseCase.execute(req.user.userId as string);
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.changePasswordUseCase.execute(req.user.userId as string, dto);
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    await this.logoutUseCase.execute(req.user.sessionId as string);
    res.clearCookie('token', { path: '/' });
  }
}
