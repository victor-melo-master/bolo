// auth/interfaces/rest/passenger-auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreatePassengerDto } from '../../application/dto/create-passenger.dto';
import { CreatePassengerUseCase } from '../../application/use-cases/create-passanger.use-case';

@Controller('auth/passenger')
export class PassengerAuthController {
  constructor(
    private readonly createPassengerUseCase: CreatePassengerUseCase,
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
}
