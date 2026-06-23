import { Controller, Get, Param } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // TODO: Implement get user by id
    return { message: 'Get user endpoint', id };
  }
}
