// ops/interfaces/rest/route.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
import { CreateRouteUseCase } from '../../application/use-cases/create-route.use-case';
import { CreateRouteDto } from '../../application/dto/create-route.dto';

@Controller('ops/routes')
export class RouteController {
  constructor(private readonly createRouteUseCase: CreateRouteUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('association_admin')
  async create(@Req() req: any, @Body() dto: CreateRouteDto) {
    const associationId = req.user.associationId;
    if (!associationId) {
      throw new Error('No perteneces a una asociación');
    }
    return this.createRouteUseCase.execute(associationId as string, dto);
  }
}
