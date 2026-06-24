// src/modules/auth/interfaces/rest/auth.controller.spec.ts
// ─── Estrategia de mocks ───
// Se mockean los casos de uso (CreateUserUseCase, LoginUseCase) para aislar
// el controlador de la lógica de negocio. Así solo se prueba la capa HTTP:
//   - Que el controlador llame al caso de uso con los parámetros correctos
//   - Que transforme correctamente las excepciones del dominio
//   - Que devuelva la respuesta con la estructura esperada
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
// Excepciones del dominio: se usan para simular errores y verificar que
// el controlador las propaga sin modificarlas
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserResponseDto } from '../dto/user-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  // Variables tipadas como mocks para acceder a las funciones jest.fn()
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;

  beforeEach(async () => {
    // Configura el módulo de testing de NestJS inyectando mocks en lugar de
    // las implementaciones reales de los casos de uso
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // Se provee un objeto con execute: jest.fn() simulando la interfaz
        // del caso de uso sin ejecutar su lógica real
        { provide: CreateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: LoginUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    createUserUseCase = module.get(CreateUserUseCase);
    loginUseCase = module.get(LoginUseCase);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // POST /auth/register — Pruebas del registro
  // ────────────────────────────────────────────────────────────────────────────
  describe('POST /auth/register', () => {
    // DTO de entrada válido usado en todos los tests de registro
    const registerDto: RegisterDto = {
      phone: '+584141234567',
      email: 'test@test.com',
      password: 'Test1234',
      fullName: 'Test User',
      cedula: 'V12345678',
      role: 'passenger',
      category: 'normal',
    };

    // Respuesta simulada que devolvería el caso de uso en caso de éxito
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

    // Caso feliz: el caso de uso crea el usuario y el controlador devuelve
    // la respuesta en el formato esperado (UserResponseDto)
    it('should register a user and return user response', async () => {
      const executeMock = createUserUseCase.execute as jest.Mock;
      // Simula que el caso de uso retorna un usuario exitosamente
      executeMock.mockResolvedValue(mockUserResponse as any);

      const result = await controller.register(registerDto);

      // Verifica que el caso de uso fue llamado con los campos mapeados
      // correctamente desde RegisterDto a CreateUserDto
      expect(executeMock).toHaveBeenCalledWith({
        phone: registerDto.phone,
        email: registerDto.email,
        password: registerDto.password,
        fullName: registerDto.fullName,
        cedula: registerDto.cedula,
        role: registerDto.role,
        category: registerDto.category,
      });
      // Verifica que la respuesta del controlador coincide con la del caso de uso
      expect(result).toEqual(mockUserResponse);
    });

    // Caso de error: el caso de uso lanza UserAlreadyExistsException cuando
    // el teléfono ya está registrado. Se verifica que el controlador propague
    // la excepción sin atraparla (el filtro global de excepciones la convertirá
    // en un 409 Conflict)
    it('should throw ConflictException when phone already exists', async () => {
      const executeMock = createUserUseCase.execute as jest.Mock;
      executeMock.mockRejectedValue(new UserAlreadyExistsException());

      await expect(controller.register(registerDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // POST /auth/login — Pruebas del inicio de sesión
  // ────────────────────────────────────────────────────────────────────────────
  describe('POST /auth/login', () => {
    const loginDto: LoginDto = {
      phone: '+584141234567',
      password: 'Test1234',
    };

    // Respuesta simulada del login: un token JWT y los datos básicos del usuario
    const mockLoginResponse = {
      accessToken: 'token',
      user: {
        id: 'uuid',
        phone: loginDto.phone,
        fullName: 'Test',
        role: 'passenger',
      },
    };

    // Caso feliz: credenciales correctas, el controlador devuelve el token
    it('should login and return access token', async () => {
      const executeLoginMock = loginUseCase.execute as jest.Mock;
      executeLoginMock.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      // Verifica que el caso de uso recibe phone y password por separado
      expect(executeLoginMock).toHaveBeenCalledWith(
        loginDto.phone,
        loginDto.password,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    // Caso de error: credenciales inválidas. El caso de uso lanza
    // InvalidCredentialsException y el controlador debe propagarla
    // (el filtro global la convertirá en un 401 Unauthorized)
    it('should throw UnauthorizedException on invalid credentials', async () => {
      const executeLoginMock = loginUseCase.execute as jest.Mock;
      executeLoginMock.mockRejectedValue(new InvalidCredentialsException());

      await expect(controller.login(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // GET /auth/profile — Pruebas del perfil autenticado
  // ────────────────────────────────────────────────────────────────────────────
  describe('GET /auth/profile', () => {
    // Simula el objeto req.user que JwtAuthGuard inyectaría después de validar
    // el token. No se prueba el guard aquí (se prueba por separado), solo se
    // verifica que el controlador devuelva lo que el guard puso en req.user.
    it('should return user from request (set by guard)', () => {
      const mockRequest = {
        user: { userId: 'uuid', phone: '+584141234567', role: 'passenger' },
      };

      const result = controller.getProfile(mockRequest as any);
      expect(result).toEqual(mockRequest.user);
    });
  });
});
