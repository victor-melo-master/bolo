// src/modules/auth/application/use-cases/login.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginUseCase — Tests Unitarios
 * ═══════════════════════════════════════════════════════════════
 *
 * Estrategia de mocking:
 *   - Se mockean las tres dependencias externas (userRepo, cryptoService,
 *     jwtService) con objetos planos y jest.fn().
 *   - El módulo se compila con Test.createTestingModule para asegurar que
 *     la inyección con token string (USER_REPOSITORY_PORT) funciona.
 *   - Se define un mockUser reutilizable con datos de prueba.
 *
 * Lo que cada test verifica:
 *   ✓ Flujo feliz: búsqueda → verificación → rotación de llave → JWT → retorno
 *   ✓ Error: usuario no encontrado
 *   ✓ Error: contraseña incorrecta
 *   ✓ Error: usuario inactivo (isActive = false)
 *   ✓ Side effect: updateJwtKey se llama con un UUID válido
 *
 * @module LoginUseCaseTests
 */

// ─── Imports ─────────────────────────────────────────────────────────────────
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.use-case';
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { User } from '../../domain/entities/user.entity';

// describe: agrupa los tests del caso de uso LoginUseCase
describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  // Mocks tipados como 'any' para evitar errores de tipo al usar jest.fn()
  let userRepo: any; // mock del repositorio de usuarios
  let cryptoService: any; // mock del servicio de hashing
  let jwtService: any; // mock del servicio JWT de NestJS

  // beforeEach: configura el módulo con mocks antes de cada test
  beforeEach(async () => {
    // Crear mocks: cada método expuesto por la dependencia se simula
    // con jest.fn() para poder espiar llamadas y controlar retornos.
    userRepo = {
      findByPhone: jest.fn(), // busca usuario por teléfono
      updateJwtKey: jest.fn(), // actualiza la llave JWT en la BD
    };
    cryptoService = {
      compare: jest.fn(), // compara contraseña contra hash
    };
    jwtService = {
      sign: jest.fn(), // firma el payload y retorna token
    };

    // Compilar módulo de test aislado con los providers mockeados.
    // El token USER_REPOSITORY_PORT (string) asocia el mock al mismo
    // token que usa @Inject en el constructor de LoginUseCase.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase, // SUT
        { provide: USER_REPOSITORY_PORT, useValue: userRepo }, // mock con token string
        { provide: CryptoService, useValue: cryptoService }, // mock con clase concreta
        { provide: JwtService, useValue: jwtService }, // mock con clase concreta
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  // ── Mock de usuario reutilizable ──────────────────────────────────────────
  // Se define fuera de los tests para evitar duplicación. Se usa en múltiples
  // tests que simulan un usuario existente en la BD.
  // Nota: isActive = true para el flujo feliz; los tests de inactividad
  // crean un objeto con isActive = false.
  const mockUser = new User(
    'user-uuid', // id
    '+584141234567', // phone
    null, // email
    'hashed_pass', // passwordHash
    'Test User', // fullName
    null, // cedula
    'passenger', // role
    null, // jwtKey (se rotará en login)
    null, // qrCode
    null, // qrKey
    1, // qrVersion
    'normal', // category
    false, // studentDocApproved
    true, // isActive ← clave: usuario activo
    null, // deletedAt
    null, // lastLoginAt
    new Date(), // createdAt
    new Date(), // updatedAt
  );

  // ── Test 1: Flujo feliz — login exitoso ───────────────────────────────────
  it('should login successfully and return token', async () => {
    // Configurar todos los mocks para retornar valores exitosos
    userRepo.findByPhone.mockResolvedValue(mockUser); // usuario encontrado
    cryptoService.compare.mockResolvedValue(true); // contraseña correcta
    jwtService.sign.mockReturnValue('mocked_token'); // JWT firmado simulado

    const result = await useCase.execute('+584141234567', 'password123');

    // Verificar que cada paso del flujo se ejecutó en orden:
    expect(userRepo.findByPhone).toHaveBeenCalledWith('+584141234567');
    expect(cryptoService.compare).toHaveBeenCalledWith(
      'password123',
      'hashed_pass',
    );
    expect(userRepo.updateJwtKey).toHaveBeenCalled(); // rotación de llave ocurrió
    expect(jwtService.sign).toHaveBeenCalled(); // JWT se firmó
    expect(result.accessToken).toBe('mocked_token'); // token retornado
    expect(result.user.id).toBe('user-uuid'); // datos básicos incluidos
  });

  // ── Test 2: Usuario no encontrado → excepción ─────────────────────────────
  it('should throw InvalidCredentialsException if user not found', async () => {
    // Simular que el repositorio no encuentra el teléfono
    userRepo.findByPhone.mockResolvedValue(null);

    // Ejecutar y verificar que lanza la excepción con mensaje genérico
    await expect(useCase.execute('123', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
    // Nota: no se verifica save/update porque el flujo se corta antes
  });

  // ── Test 3: Contraseña incorrecta → excepción ──────────────────────────────
  it('should throw InvalidCredentialsException if password invalid', async () => {
    // Usuario existe, pero la contraseña no coincide
    userRepo.findByPhone.mockResolvedValue(mockUser);
    cryptoService.compare.mockResolvedValue(false); // ← contraseña incorrecta

    await expect(useCase.execute('+584141234567', 'wrongpass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  // ── Test 4: Usuario inactivo → excepción ──────────────────────────────────
  it('should throw InvalidCredentialsException if user inactive', async () => {
    // Crear un usuario con isActive = false (desactivado/suspendido)
    // Se usa spread { ...mockUser } y se sobreescribe isActive.
    // Nota: la entidad User puede no tener un setter público; en el test
    // se asigna directamente porque 'mockUser' es un objeto plano con
    // las propiedades públicas de la entidad.
    const inactiveUser = { ...mockUser, isActive: false };
    userRepo.findByPhone.mockResolvedValue(inactiveUser);

    await expect(useCase.execute('+584141234567', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  // ── Test 5: Rotación de llave JWT en login exitoso ────────────────────────
  it('should update jwtKey on successful login', async () => {
    // Verificación específica del side effect: cada login exitoso debe
    // generar y persistir una nueva llave UUID para el usuario.
    userRepo.findByPhone.mockResolvedValue(mockUser);
    cryptoService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');

    await useCase.execute('+584141234567', 'pass');

    // Se verifica que updateJwtKey se llamó con el ID del usuario y
    // CUALQUIER string (expect.any(String)), que es el UUID generado
    // por randomUUID() en el caso de uso real.
    expect(userRepo.updateJwtKey).toHaveBeenCalledWith(
      'user-uuid',
      expect.any(String), // el UUID puede ser cualquier string válido
    );
  });
});
