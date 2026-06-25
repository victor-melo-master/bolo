import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let createUserUseCase: any;

  beforeEach(async () => {
    createUserUseCase = { execute: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: CreateUserUseCase, useValue: createUserUseCase }],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('should force role to association_admin and call use case', async () => {
    const dto: CreateUserDto = {
      phone: '+584141234580',
      password: 'Test1234',
      fullName: 'Admin Asoc',
      role: 'passenger', // el controlador lo sobrescribe
      category: 'normal',
    };
    const expectedDto = { ...dto, role: 'association_admin' };
    createUserUseCase.execute.mockResolvedValue({ id: 'user-id' });

    const result = await controller.createAssociationAdmin(dto);

    expect(createUserUseCase.execute).toHaveBeenCalledWith(expectedDto);
    expect(result).toEqual({ id: 'user-id' });
  });
});
