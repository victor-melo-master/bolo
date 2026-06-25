// ops/interfaces/rest/association.controller.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common'; // comentado temporalmente
import { JwtAuthGuard } from '../../../auth/infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
import { CreateAssociationUseCase } from '../../application/use-cases/create-association.use-case';
import { CreateAssociationDto } from '../../application/dto/create-association.dto';

@Controller('ops/associations')
export class OpsAssociationController {
  constructor(
    private readonly createAssociationUseCase: CreateAssociationUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('association_admin')
  async create(@Req() req: any, @Body() dto: CreateAssociationDto) {
    const adminId = req.user.userId;
    return this.createAssociationUseCase.execute(adminId as string, dto);
  }
}
