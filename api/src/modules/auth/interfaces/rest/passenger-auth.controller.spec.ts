// auth/interfaces/rest/passenger-auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PassengerAuthController } from './passenger-auth.controller';
import { LoginPassengerUseCase } from '../../application/use-cases/login-passenger.use-case';
import { CreatePassengerDto } from '../../application/dto/create-passenger.dto';
import { LoginDto } from '../dto/login.dto';
import { CreatePassengerUseCase } from '../../application/use-cases/create-passanger.use-case';

describe('PassengerAuthController', () => {
  let controller: PassengerAuthController;
  let createPassengerUseCase: any;
  let loginPassengerUseCase: any;

  beforeEach(async () => {
    createPassengerUseCase = { execute: jest.fn() };
    loginPassengerUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengerAuthController],
      providers: [
        { provide: CreatePassengerUseCase, useValue: createPassengerUseCase },
        { provide: LoginPassengerUseCase, useValue: loginPassengerUseCase },
      ],
    }).compile();

    controller = module.get<PassengerAuthController>(PassengerAuthController);
  });

  describe('POST /auth/passenger/register', () => {
    it('should register a passenger and return 201', async () => {
      const dto: CreatePassengerDto = {
        phone: '+584141234500',
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
      const dto: LoginDto = { phone: '+584141234500', password: 'Test1234' };
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

      const result = await controller.login(dto);

      expect(loginPassengerUseCase.execute).toHaveBeenCalledWith(
        dto.phone,
        dto.password,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
