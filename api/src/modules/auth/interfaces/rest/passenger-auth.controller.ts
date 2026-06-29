import { UpdatePassengerUseCase } from './../../application/use-cases/update-passenger.use-case';
// auth/interfaces/rest/passenger-auth.controller.ts
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
} from '@nestjs/common';
import { CreatePassengerDto } from '../../application/dto/create-passenger.dto';
import { LoginPassengerUseCase } from '../../application/use-cases/login-passenger.use-case';
import { LoginDto } from '../dto/login.dto';
import { CreatePassengerUseCase } from '../../application/use-cases/create-passanger.use-case';
import { GetPassengerProfileUseCase } from '../../application/use-cases/get-passenger-profile.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { UpdatePassengerDto } from '../../application/dto/update-passenger.dto';
import { DeletePassengerUseCase } from '../../application/use-cases/delete-passenger.use-case';
import { Throttle } from '@nestjs/throttler';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';
import { ChangePassengerPasswordUseCase } from '../../application/use-cases/change-passenger-password.use-case';

@Controller('auth/passenger')
export class PassengerAuthController {
  constructor(
    private readonly createPassengerUseCase: CreatePassengerUseCase,
    private readonly loginPassengerUseCase: LoginPassengerUseCase,
    private readonly getProfileUseCase: GetPassengerProfileUseCase,
    private readonly updatePassengerUseCase: UpdatePassengerUseCase,
    private readonly deletePassengerUseCase: DeletePassengerUseCase,
    private readonly changePasswordUseCase: ChangePassengerPasswordUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreatePassengerDto) {
    const passenger = await this.createPassengerUseCase.execute(dto);
    return {
      id: passenger.id,
      phone: passenger.phone,
      fullName: passenger.fullName,
      category: passenger.category,
      isActive: passenger.isActive,
      createdAt: passenger.createdAt,
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginPassengerUseCase.execute(dto.phone, dto.password);
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
}
