// auth/interfaces/rest/admin-auth.controller.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AdminAuthController — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el controlador de autenticación de administradores
 * maneje correctamente las rutas HTTP y delegue en los casos de uso.
 *
 * @module test/admin-auth.controller.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthController } from './admin-auth.controller';
import { CreateAdminUseCase } from '../../application/use-cases/create-admin.use-case';
import { LoginAdminUseCase } from '../../application/use-cases/login-admin.use-case';
import { GetAdminProfileUseCase } from '../../application/use-cases/get-admin-profile.use-case';
import { UpdateAdminUseCase } from '../../application/use-cases/update-admin.use-case';
import { DeleteAdminUseCase } from '../../application/use-cases/delete-admin.use-case';
import { ChangeAdminPasswordUseCase } from '../../application/use-cases/change-admin-password.use-case';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';

describe('AdminAuthController', () => {
  let controller: AdminAuthController;
  let createAdminUseCase: any;
  let loginAdminUseCase: any;
  let getAdminProfileUseCase: any;
  let updateAdminUseCase: any;
  let deleteAdminUseCase: any;
  let changePasswordUseCase: any;

  beforeEach(async () => {
    createAdminUseCase = { execute: jest.fn() };
    loginAdminUseCase = { execute: jest.fn() };
    getAdminProfileUseCase = { execute: jest.fn() };
    updateAdminUseCase = { execute: jest.fn() };
    deleteAdminUseCase = { execute: jest.fn() };
    changePasswordUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [
        { provide: CreateAdminUseCase, useValue: createAdminUseCase },
        { provide: LoginAdminUseCase, useValue: loginAdminUseCase },
        { provide: GetAdminProfileUseCase, useValue: getAdminProfileUseCase },
        { provide: UpdateAdminUseCase, useValue: updateAdminUseCase },
        { provide: DeleteAdminUseCase, useValue: deleteAdminUseCase },
        {
          provide: ChangeAdminPasswordUseCase,
          useValue: changePasswordUseCase,
        },
      ],
    }).compile();

    controller = module.get<AdminAuthController>(AdminAuthController);
  });

  // ─── Login ──────────────────────────────────────────────
  describe('POST /auth/admin/login', () => {
    it('should login and return token', async () => {
      const dto = { phone: '04141234501', password: 'Test1234' };
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

  // ─── Crear admin (protegido) ───────────────────────────
  describe('POST /auth/admin/create', () => {
    it('should create an admin and return 201', async () => {
      const dto = {
        phone: '04141234501',
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
      const result = await controller.createAdmin(dto);
      expect(createAdminUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockAdmin);
    });
  });

  // ─── Perfil ─────────────────────────────────────────────
  describe('GET /auth/admin/profile', () => {
    it('should return admin profile', async () => {
      const mockProfile = {
        id: 'uuid',
        phone: '+584141234501',
        role: 'super_admin',
      };
      getAdminProfileUseCase.execute.mockResolvedValue(mockProfile);
      const result = await controller.getProfile({ user: { userId: 'uuid' } });
      expect(result).toEqual(mockProfile);
      expect(getAdminProfileUseCase.execute).toHaveBeenCalledWith('uuid');
    });
  });

  // ─── Actualizar perfil ─────────────────────────────────
  describe('PUT /auth/admin/profile', () => {
    it('should update admin profile', async () => {
      const dto = { fullName: 'Nuevo' };
      const mockUpdated = { id: 'uuid', fullName: 'Nuevo' };
      updateAdminUseCase.execute.mockResolvedValue(mockUpdated);
      const result = await controller.updateProfile(
        { user: { userId: 'uuid' } },
        dto,
      );
      expect(result).toEqual(mockUpdated);
      expect(updateAdminUseCase.execute).toHaveBeenCalledWith('uuid', dto);
    });
  });

  // ─── Soft delete ───────────────────────────────────────
  describe('DELETE /auth/admin/profile', () => {
    it('should soft delete admin', async () => {
      deleteAdminUseCase.execute.mockResolvedValue(undefined);
      await controller.deleteProfile({ user: { userId: 'uuid' } });
      expect(deleteAdminUseCase.execute).toHaveBeenCalledWith('uuid');
    });
  });

  // ─── Cambio de contraseña ──────────────────────────────
  describe('PUT /auth/admin/password', () => {
    it('should change password', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPass1',
        newPassword: 'NewPass2',
      };
      changePasswordUseCase.execute.mockResolvedValue(undefined);

      await controller.changePassword({ user: { userId: 'uuid' } }, dto);

      expect(changePasswordUseCase.execute).toHaveBeenCalledWith('uuid', dto);
    });
  });
});
