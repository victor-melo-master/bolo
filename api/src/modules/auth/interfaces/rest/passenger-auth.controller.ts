// src/modules/auth/interfaces/rest/passenger-auth.controller.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * PassengerAuthController — Controlador REST de autenticación de pasajeros
 * ═══════════════════════════════════════════════════════════════
 *
 * Controlador que expone los endpoints públicos y protegidos para el módulo
 * de autenticación de pasajeros: registro, login, perfil, actualización,
 * eliminación y cambio de contraseña.
 *
 * Capa: Interfaces (auth)
 * Dependencias:
 *   - CreatePassengerUseCase: caso de uso de registro de pasajero
 *   - LoginPassengerUseCase: caso de uso de login de pasajero
 *   - GetPassengerProfileUseCase: caso de uso de obtención de perfil
 *   - UpdatePassengerUseCase: caso de uso de actualización de pasajero
 *   - DeletePassengerUseCase: caso de uso de eliminación de pasajero
 *   - ChangePassengerPasswordUseCase: caso de uso de cambio de contraseña
 *
 * @module PassengerAuthController
 */
import { UpdatePassengerUseCase } from './../../application/use-cases/update-passenger.use-case';
import {
  Controller,
  Post,
  Body,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Delete,
  Res,
} from '@nestjs/common';
import { CreatePassengerDto } from '../../application/dto/create-passenger.dto';
import { LoginPassengerUseCase } from '../../application/use-cases/login-passenger.use-case';
import { LoginDto } from '../dto/login.dto';
import { CreatePassengerUseCase } from '../../application/use-cases/create-passanger.use-case';
import { GetPassengerProfileUseCase } from '../../application/use-cases/get-passenger-profile.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { UpdatePassengerDto } from '../../application/dto/update-passenger.dto';
import { DeletePassengerUseCase } from '../../application/use-cases/delete-passenger.use-case';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';
import { ChangePassengerPasswordUseCase } from '../../application/use-cases/change-passenger-password.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RecoverPassengerUseCase } from '../../application/use-cases/recover-passenger.use-case';
import { RecoverConfirmDto, RecoverRequestDto } from '../../application/dto';

@Controller('auth/passenger')
export class PassengerAuthController {
  constructor(
    private readonly createPassengerUseCase: CreatePassengerUseCase,
    private readonly loginPassengerUseCase: LoginPassengerUseCase,
    private readonly getProfileUseCase: GetPassengerProfileUseCase,
    private readonly updatePassengerUseCase: UpdatePassengerUseCase,
    private readonly deletePassengerUseCase: DeletePassengerUseCase,
    private readonly changePasswordUseCase: ChangePassengerPasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly recoverPassengerUseCase: RecoverPassengerUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreatePassengerDto) {
    const passenger = await this.createPassengerUseCase.execute(dto);
    return {
      id: passenger.id,
      phone: passenger.phone,
      email: passenger.email, // ← añadir
      fullName: passenger.fullName,
      cedula: passenger.cedula, // ← añadir (si también falta)
      category: passenger.category,
      isActive: passenger.isActive,
      createdAt: passenger.createdAt,
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: any, // ← cambiamos el tipo a any para evitar el error
  ) {
    const result = await this.loginPassengerUseCase.execute(
      dto.phone,
      dto.password,
    );

    // Setear la cookie httpOnly manualmente
    const cookieString = `token=${result.accessToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`;
    if (process.env.NODE_ENV === 'production') {
      // En producción agregar Secure
      res.setHeader('Set-Cookie', cookieString + '; Secure');
    } else {
      res.setHeader('Set-Cookie', cookieString);
    }

    return result;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.getProfileUseCase.execute(req.user.userId as string);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdatePassengerDto) {
    return this.updatePassengerUseCase.execute(req.user.userId as string, dto);
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Req() req: any) {
    await this.deletePassengerUseCase.execute(req.user.userId as string);
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

  /**
   * Solicitar recuperación de cuenta eliminada.
   * Público: no requiere autenticación.
   */
  @Post('recover')
  async requestRecover(@Body() dto: RecoverRequestDto) {
    await this.recoverPassengerUseCase.request(dto);
    return {
      message:
        'Si la cuenta existe y fue eliminada, recibirás un código de recuperación.',
    };
  }

  /**
   * Confirmar recuperación con código numérico.
   * Público: no requiere autenticación.
   * Devuelve token de acceso si el código es válido.
   */
  @Post('recover/confirm')
  async confirmRecover(@Body() dto: RecoverConfirmDto) {
    try {
      return await this.recoverPassengerUseCase.confirm(dto);
    } catch (error) {
      console.error('[Confirm] Error:', error);
      throw error;
    }
  }
}
