import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthController } from './admin-auth.controller';
import { CreateAdminUseCase } from '../../application/use-cases/create-admin.use-case';
import { LoginAdminUseCase } from '../../application/use-cases/login-admin.use-case';
import { GetAdminProfileUseCase } from '../../application/use-cases/get-admin-profile.use-case';
import { UpdateAdminUseCase } from '../../application/use-cases/update-admin.use-case';
import { DeleteAdminUseCase } from '../../application/use-cases/delete-admin.use-case';

describe('AdminAuthController', () => {
  let controller: AdminAuthController;
  let createAdminUseCase: any;
  let loginAdminUseCase: any;
  let getAdminProfileUseCase: any;
  let updateAdminUseCase: any;
  let deleteAdminUseCase: any;

  beforeEach(async () => {
    createAdminUseCase = { execute: jest.fn() };
    loginAdminUseCase = { execute: jest.fn() };
    getAdminProfileUseCase = { execute: jest.fn() };
    updateAdminUseCase = { execute: jest.fn() };
    deleteAdminUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [
        { provide: CreateAdminUseCase, useValue: createAdminUseCase },
        { provide: LoginAdminUseCase, useValue: loginAdminUseCase },
        { provide: GetAdminProfileUseCase, useValue: getAdminProfileUseCase },
        { provide: UpdateAdminUseCase, useValue: updateAdminUseCase },
        { provide: DeleteAdminUseCase, useValue: deleteAdminUseCase },
      ],
    }).compile();

    controller = module.get<AdminAuthController>(AdminAuthController);
  });

  describe('POST /auth/admin/register', () => {
    it('should register an admin and return 201', async () => {
      const dto = { phone: '+584141234501', password: 'Test1234', fullName: 'A1', role: 'super_admin' };
      createAdminUseCase.execute.mockResolvedValue({ id: 'uuid', phone: dto.phone });
      const result = await controller.register(dto);
      expect(createAdminUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('uuid');
    });
  });

  describe('POST /auth/admin/login', () => {
    it('should login and return token', async () => {
      const dto = { phone: '+584141234501', password: 'Test1234' };
      loginAdminUseCase.execute.mockResolvedValue({ accessToken: 'token', user: {} });
      const result = await controller.login(dto);
      expect(loginAdminUseCase.execute).toHaveBeenCalledWith(dto.phone, dto.password);
      expect(result.accessToken).toBe('token');
    });
  });

  describe('GET /auth/admin/profile', () => {
    it('should return admin profile', async () => {
      getAdminProfileUseCase.execute.mockResolvedValue({ id: 'uuid', role: 'super_admin' });
      const result = await controller.getProfile({ user: { userId: 'uuid' } });
      expect(result).toEqual({ id: 'uuid', role: 'super_admin' });
      expect(getAdminProfileUseCase.execute).toHaveBeenCalledWith('uuid');
    });
  });

  describe('PUT /auth/admin/profile', () => {
    it('should update admin profile', async () => {
      const dto = { fullName: 'Nuevo' };
      updateAdminUseCase.execute.mockResolvedValue({ id: 'uuid', fullName: 'Nuevo' });
      const result = await controller.updateProfile({ user: { userId: 'uuid' } }, dto);
      expect(result).toEqual({ id: 'uuid', fullName: 'Nuevo' });
      expect(updateAdminUseCase.execute).toHaveBeenCalledWith('uuid', dto);
    });
  });

  describe('DELETE /auth/admin/profile', () => {
    it('should soft delete admin', async () => {
      deleteAdminUseCase.execute.mockResolvedValue(undefined);
      await controller.deleteProfile({ user: { userId: 'uuid' } });
      expect(deleteAdminUseCase.execute).toHaveBeenCalledWith('uuid');
    });
  });
});
