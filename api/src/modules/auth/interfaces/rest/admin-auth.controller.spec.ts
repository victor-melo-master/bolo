// auth/interfaces/rest/admin-auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthController } from './admin-auth.controller';
import { CreateAdminUseCase } from '../../application/use-cases/create-admin.use-case';
import { LoginAdminUseCase } from '../../application/use-cases/login-admin.use-case';
import { CreateAdminDto } from '../../application/dto/create-admin.dto';
import { LoginDto } from '../dto/login.dto';

describe('AdminAuthController', () => {
  let controller: AdminAuthController;
  let createAdminUseCase: any;
  let loginAdminUseCase: any;

  beforeEach(async () => {
    createAdminUseCase = { execute: jest.fn() };
    loginAdminUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [
        { provide: CreateAdminUseCase, useValue: createAdminUseCase },
        { provide: LoginAdminUseCase, useValue: loginAdminUseCase },
      ],
    }).compile();

    controller = module.get<AdminAuthController>(AdminAuthController);
  });

  describe('POST /auth/admin/register', () => {
    it('should register an admin and return 201', async () => {
      const dto: CreateAdminDto = {
        phone: '+584141234501',
        password: 'Test1234',
        fullName: 'Admin Uno',
        role: 'super_admin',
      };

      const mockAdmin = {
        id: 'uuid',
        phone: dto.phone,
        fullName: dto.fullName,
        role: dto.role,
        isActive: true,
        createdAt: new Date(),
      };
      createAdminUseCase.execute.mockResolvedValue(mockAdmin);

      const result = await controller.register(dto);

      expect(createAdminUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAdmin);
    });
  });

  describe('POST /auth/admin/login', () => {
    it('should login and return token', async () => {
      const dto: LoginDto = { phone: '+584141234501', password: 'Test1234' };
      const mockResponse = {
        accessToken: 'token',
        user: {
          id: 'uuid',
          phone: dto.phone,
          fullName: 'Admin Uno',
          role: 'super_admin',
        },
      };
      loginAdminUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.login(dto);

      expect(loginAdminUseCase.execute).toHaveBeenCalledWith(
        dto.phone,
        dto.password,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
