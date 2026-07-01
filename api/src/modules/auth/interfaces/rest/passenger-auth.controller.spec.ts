// auth/interfaces/rest/passenger-auth.controller.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * PassengerAuthController — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el controlador de autenticación de pasajeros
 * maneje correctamente las rutas HTTP y delegue en los casos de uso.
 *
 * @module test/passenger-auth.controller.spec
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PassengerAuthController } from './passenger-auth.controller';
import { LoginPassengerUseCase } from '../../application/use-cases/login-passenger.use-case';
import { GetPassengerProfileUseCase } from '../../application/use-cases/get-passenger-profile.use-case';
import { UpdatePassengerUseCase } from '../../application/use-cases/update-passenger.use-case';
import { DeletePassengerUseCase } from '../../application/use-cases/delete-passenger.use-case';
import { ChangePassengerPasswordUseCase } from '../../application/use-cases/change-passenger-password.use-case';
import { ChangePasswordDto } from '../../application/dto/change-password.dto';
import { CreatePassengerUseCase } from '../../application/use-cases/create-passanger.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

describe('PassengerAuthController', () => {
  let controller: PassengerAuthController;
  let createPassengerUseCase: any;
  let loginPassengerUseCase: any;
  let getProfileUseCase: any;
  let updatePassengerUseCase: any;
  let deletePassengerUseCase: any;
  let changePasswordUseCase: any;

  beforeEach(async () => {
    createPassengerUseCase = { execute: jest.fn() };
    loginPassengerUseCase = { execute: jest.fn() };
    getProfileUseCase = { execute: jest.fn() };
    updatePassengerUseCase = { execute: jest.fn() };
    deletePassengerUseCase = { execute: jest.fn() };
    changePasswordUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengerAuthController],
      providers: [
        { provide: CreatePassengerUseCase, useValue: createPassengerUseCase },
        { provide: LoginPassengerUseCase, useValue: loginPassengerUseCase },
        { provide: GetPassengerProfileUseCase, useValue: getProfileUseCase },
        { provide: UpdatePassengerUseCase, useValue: updatePassengerUseCase },
        { provide: DeletePassengerUseCase, useValue: deletePassengerUseCase },
        {
          provide: ChangePassengerPasswordUseCase,
          useValue: changePasswordUseCase,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PassengerAuthController>(PassengerAuthController);
  });

  describe('POST /auth/passenger/register', () => {
    it('should register a passenger and return 201', async () => {
      const dto = {
        phone: '04141234500',
        password: 'Test1234',
        fullName: 'Pasajero Uno',
        category: 'normal',
      };
      const mockPassenger = {
        id: 'uuid',
        phone: dto.phone,
        fullName: dto.fullName,
        category: dto.category,
        isActive: true,
        createdAt: new Date(),
      };
      createPassengerUseCase.execute.mockResolvedValue(mockPassenger);

      const result = await controller.register(dto);

      expect(createPassengerUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPassenger);
    });
  });

  describe('POST /auth/passenger/login', () => {
    it('should login and return token', async () => {
      const dto = { phone: '+584141234500', password: 'Test1234' };
      const mockResponse = {
        accessToken: 'token',
        user: {
          id: 'uuid',
          phone: dto.phone,
          fullName: 'Pasajero Uno',
          role: 'passenger',
        },
      };
      loginPassengerUseCase.execute.mockResolvedValue(mockResponse);

      const res = { setHeader: jest.fn() }; // ← objeto respuesta simulado
      const result = await controller.login(dto, res);

      expect(loginPassengerUseCase.execute).toHaveBeenCalledWith(
        dto.phone,
        dto.password,
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        expect.any(String),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('GET /auth/passenger/profile', () => {
    it('should return passenger profile', async () => {
      const mockProfile = { id: 'uuid', phone: '+584141234500' };
      getProfileUseCase.execute.mockResolvedValue(mockProfile);

      const result = await controller.getProfile({ user: { userId: 'uuid' } });

      expect(result).toEqual(mockProfile);
      expect(getProfileUseCase.execute).toHaveBeenCalledWith('uuid');
    });
  });

  describe('PUT /auth/passenger/profile', () => {
    it('should update passenger profile', async () => {
      const dto = { fullName: 'Nuevo' };
      const mockUpdated = { id: 'uuid', fullName: 'Nuevo' };
      updatePassengerUseCase.execute.mockResolvedValue(mockUpdated);

      const result = await controller.updateProfile(
        { user: { userId: 'uuid' } },
        dto,
      );

      expect(result).toEqual(mockUpdated);
      expect(updatePassengerUseCase.execute).toHaveBeenCalledWith('uuid', dto);
    });
  });

  describe('DELETE /auth/passenger/profile', () => {
    it('should soft delete passenger', async () => {
      deletePassengerUseCase.execute.mockResolvedValue(undefined);

      await controller.deleteProfile({ user: { userId: 'uuid' } });

      expect(deletePassengerUseCase.execute).toHaveBeenCalledWith('uuid');
    });
  });

  describe('PUT /auth/passenger/password', () => {
    it('should change password', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPass1',
        newPassword: 'NewPass2',
        newPasswordConfirmation: 'NewPass2',
      };
      changePasswordUseCase.execute.mockResolvedValue(undefined);

      await controller.changePassword({ user: { userId: 'uuid' } }, dto);

      expect(changePasswordUseCase.execute).toHaveBeenCalledWith('uuid', dto);
    });
  });
});
