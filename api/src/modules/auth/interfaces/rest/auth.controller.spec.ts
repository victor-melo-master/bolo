// src/modules/auth/interfaces/rest/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserResponseDto } from '../dto/user-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: CreateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    createUserUseCase = module.get(CreateUserUseCase);
    loginUseCase = module.get(LoginUseCase);
  });

  describe('POST /auth/register', () => {
    const registerDto: RegisterDto = {
      phone: '+584141234567',
      email: 'test@test.com',
      password: 'Test1234',
      fullName: 'Test User',
      cedula: 'V12345678',
      role: 'passenger',
      category: 'normal',
    };

    const mockUserResponse: UserResponseDto = {
      id: 'uuid',
      phone: registerDto.phone,
      email: registerDto.email,
      fullName: registerDto.fullName,
      role: registerDto.role,
      category: registerDto.category,
      isActive: true,
      createdAt: new Date(),
    };

    it('should register a user and return user response', async () => {
      const executeMock = createUserUseCase.execute as jest.Mock;
      executeMock.mockResolvedValue(mockUserResponse as any);

      const result = await controller.register(registerDto);

      expect(executeMock).toHaveBeenCalledWith({
        phone: registerDto.phone,
        email: registerDto.email,
        password: registerDto.password,
        fullName: registerDto.fullName,
        cedula: registerDto.cedula,
        role: registerDto.role,
        category: registerDto.category,
      });
      expect(result).toEqual(mockUserResponse);
    });

    it('should throw ConflictException when phone already exists', async () => {
      const executeMock = createUserUseCase.execute as jest.Mock;
      executeMock.mockRejectedValue(new UserAlreadyExistsException());

      await expect(controller.register(registerDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  describe('POST /auth/login', () => {
    const loginDto: LoginDto = {
      phone: '+584141234567',
      password: 'Test1234',
    };

    const mockLoginResponse = {
      accessToken: 'token',
      user: {
        id: 'uuid',
        phone: loginDto.phone,
        fullName: 'Test',
        role: 'passenger',
      },
    };

    it('should login and return access token', async () => {
      const executeLoginMock = loginUseCase.execute as jest.Mock;
      executeLoginMock.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(executeLoginMock).toHaveBeenCalledWith(
        loginDto.phone,
        loginDto.password,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const executeLoginMock = loginUseCase.execute as jest.Mock;
      executeLoginMock.mockRejectedValue(new InvalidCredentialsException());

      await expect(controller.login(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user from request (set by guard)', () => {
      const mockRequest = {
        user: { userId: 'uuid', phone: '+584141234567', role: 'passenger' },
      };

      const result = controller.getProfile(mockRequest as any);
      expect(result).toEqual(mockRequest.user);
    });
  });
});
