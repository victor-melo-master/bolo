// auth/interfaces/rest/user.controller.spec.ts
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

  it('should force role to association_admin and call use case (super_admin)', async () => {
    const dto: CreateUserDto = {
      phone: '+584141234580',
      password: 'Test1234',
      fullName: 'Admin Asoc',
      role: 'passenger', // el controlador lo sobrescribe
      category: 'normal',
    };
    const req = { user: { role: 'super_admin' } };
    const expectedDto = { ...dto, role: 'association_admin' };
    createUserUseCase.execute.mockResolvedValue({ id: 'user-id' });

    const result = await controller.createAssociationAdmin(req, dto);

    expect(createUserUseCase.execute).toHaveBeenCalledWith(expectedDto);
    expect(result).toEqual({ id: 'user-id' });
  });

  it('should inherit associationId when created by association_admin', async () => {
    const dto: CreateUserDto = {
      phone: '+584141234581',
      password: 'Test1234',
      fullName: 'Sub Admin',
      role: 'passenger',
      category: 'normal',
    };
    const req = {
      user: {
        role: 'association_admin',
        associationId: 'assoc-123',
      },
    };
    createUserUseCase.execute.mockResolvedValue({ id: 'sub-admin-id' });

    await controller.createAssociationAdmin(req, dto);

    expect(createUserUseCase.execute).toHaveBeenCalledWith({
      ...dto,
      role: 'association_admin',
      associationId: 'assoc-123',
    });
  });
});
