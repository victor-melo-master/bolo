// ops/interfaces/rest/association.controller.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
// import { UseGuards } from '@nestjs/common'; // comentado temporalmente
// import { JwtAuthGuard } from '../../../auth/infrastructure/auth/jwt-auth.guard';
// import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
import { CreateAssociationUseCase } from '../../application/use-cases/create-association.use-case';
import { CreateAssociationDto } from '../../application/dto/create-association.dto';

@Controller('ops/associations')
export class OpsAssociationController {
  constructor(
    private readonly createAssociationUseCase: CreateAssociationUseCase,
  ) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)  // comentado temporalmente
  @Roles('association_admin')
  async create(@Req() req: any, @Body() dto: CreateAssociationDto) {
    const adminId = '84a000f2-d9e7-4808-aa10-3bf7df6d74fd'; // ID del admin creado
    return this.createAssociationUseCase.execute(adminId, dto);
  }
}
