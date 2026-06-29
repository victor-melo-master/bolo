// auth/interfaces/rest/admin-auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateAdminUseCase } from '../../application/use-cases/create-admin.use-case';
import { CreateAdminDto } from '../../application/dto/create-admin.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly createAdminUseCase: CreateAdminUseCase) {}

  // Registro público para el primer admin (luego se protegerá)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateAdminDto) {
    // Por ahora permitimos cualquier registro. Más adelante
    // añadiremos @UseGuards(JwtAuthGuard, RolesGuard) y @Roles('super_admin')
    // para restringir quién puede crear ciertos roles.
    const admin = await this.createAdminUseCase.execute(dto);
    return {
      id: admin.id,
      phone: admin.phone,
      fullName: admin.fullName,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    };
  }

  // Endpoint protegido para que super_admin cree otros admins
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
    };
  }
}
