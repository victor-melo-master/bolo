// fin/interfaces/rest/coop-fare.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/infrastructure/auth/roles.guard';
import { Roles } from '../../../../shared/interfaces/decorators/roles.decorator';
import { CreateCoopFareUseCase } from '../../application/use-cases/create-coop-fare.use-case';
import { CreateCoopFareDto } from '../../application/dto/create-coop-fare.dto';

@Controller('fin/coop-fares')
export class CoopFareController {
  constructor(private readonly createCoopFareUseCase: CreateCoopFareUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('association_admin')
  async create(@Req() req: any, @Body() dto: CreateCoopFareDto) {
    const associationId = req.user.associationId;
    if (!associationId) {
      throw new Error('No perteneces a una asociación');
    }
    return this.createCoopFareUseCase.execute(associationId as string, dto);
  }
}
