// src/modules/auth/application/use-cases/create-user.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateUserUseCase — Tests Unitarios
 * ═══════════════════════════════════════════════════════════════
 *
 * Estrategia de mocking:
 *   - Se mockean TODAS las dependencias externas (userRepo, walletService,
 *     cryptoService) con objetos planos + jest.fn().
 *   - NO se usa la implementación real de ninguna dependencia: ni base de
 *     datos, ni bcrypt, ni creación real de wallet.
 *   - El módulo de test se compila con Test.createTestingModule de NestJS
 *     para verificar que la inyección de dependencias funciona correctamente
 *     (incluyendo @Inject con token string y @Optional).
 *
 * Lo que cada test verifica:
 *   ✓ Flujo feliz: validación → hash → persistencia → wallet → retorno
 *   ✓ Error: teléfono duplicado lanza UserAlreadyExistsException y NO persiste
 *   ✓ Resiliencia: wallet opcional falla pero el registro continúa
 *
 * @module CreateUserUseceTests
 */

// ─── Imports ─────────────────────────────────────────────────────────────────
import { Test, TestingModule } from '@nestjs/testing';
// Caso de uso bajo prueba (SUT — System Under Test)
import { CreateUserUseCase } from './create-user.use-case';
// Token string para la inyección del repositorio — necesario para
// proporcionar el mock con el mismo token que usa el caso de uso
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
// Token string para la inyección del servicio de wallet (opcional)
import { WALLET_SERVICE_PORT } from '../../domain/interfaces/services/wallet.service.port';
// Clase concreta de CryptoService — se provee con useValue mock
import { CryptoService } from '../../../../shared/application/services/crypto.service';
// Excepción que esperamos recibir en el test de teléfono duplicado
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
// Entidad User usada para construir el objeto que retorna userRepo.save()
import { User } from '../../domain/entities/user.entity';

// describe: agrupa todos los tests del caso de uso CreateUserUseCase
describe('CreateUserUseCase', () => {
  // Variables compartidas: se inicializan en beforeEach y se reasignan
  // en cada test para evitar contaminación entre tests (estado limpio).
  let useCase: CreateUserUseCase;
  let userRepo: any; // mock del repositorio de usuarios
  let walletService: any; // mock del servicio de wallet (opcional)
  let cryptoService: any; // mock del servicio de hashing

  // beforeEach: se ejecuta antes de cada test. Configura el módulo de
  // NestJS con todos los mocks y extrae la instancia del caso de uso.
  beforeEach(async () => {
    // Se crean objetos mock con métodos jest.fn() para cada dependencia.
    // jest.fn() permite espiar llamadas, simular valores de retorno y
    // verificar argumentos con expect().toHaveBeenCalledWith().
    userRepo = {
      findByPhone: jest.fn(), // simula búsqueda por teléfono
      save: jest.fn(), // simula persistencia
      updateJwtKey: jest.fn(), // simula actualización de llave (no usado aquí)
    };
    walletService = {
      createWallet: jest.fn(), // simula creación de billetera
    };
    cryptoService = {
      hash: jest.fn(), // simula hashing de contraseña
      compare: jest.fn(), // simula comparación (no usado aquí)
    };

    // Test.createTestingModule: compila un módulo NestJS aislado, sin
    // importar módulos reales, solo con los providers que declaramos.
    // Esto verifica que el contenedor de DI resuelve @Inject(TOKEN)
    // correctamente con los tokens string.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase, // SUT
        { provide: USER_REPOSITORY_PORT, useValue: userRepo }, // mock con token string
        { provide: WALLET_SERVICE_PORT, useValue: walletService }, // mock con token string
        { provide: CryptoService, useValue: cryptoService }, // mock con clase concreta
      ],
    }).compile();

    // Extraer la instancia del caso de uso del módulo compilado
    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  // ── Test 1: Flujo feliz — registro exitoso ────────────────────────────────
  it('should create a user successfully', async () => {
    // Datos de entrada simulados (CreateUserDto sin decoradores)
    const dto = {
      phone: '+584141234567',
      email: 'test@test.com',
      password: 'password123',
      fullName: 'Test User',
      cedula: 'V12345678',
      role: 'passenger' as any,
      category: 'normal' as any,
    };

    // Configurar comportamiento de los mocks:
    userRepo.findByPhone.mockResolvedValue(null); // el teléfono NO existe → validación pasa
    cryptoService.hash.mockResolvedValue('hashed_password'); // hashing devuelve hash simulado
    userRepo.save.mockResolvedValue(
      // save devuelve usuario con ID asignado
      new User(
        'uuid', // id generado por la BD (simulado)
        dto.phone,
        dto.email,
        'hashed_password',
        dto.fullName,
        dto.cedula,
        dto.role,
        null,
        null,
        null, // jwtKey, qrCode, qrKey
        1, // qrVersion
        dto.category,
        false, // studentDocApproved
        true, // isActive
        null, // deletedAt
        null, // lastLoginAt
        new Date(), // createdAt
        new Date(), // updatedAt
      ),
    );

    // Ejecutar el caso de uso con el DTO de prueba
    const result = await useCase.execute(dto);

    // Verificaciones:
    // 1. Se llamó a findByPhone con el teléfono del DTO
    expect(userRepo.findByPhone).toHaveBeenCalledWith(dto.phone);
    // 2. Se llamó a hash con la contraseña en texto plano
    expect(cryptoService.hash).toHaveBeenCalledWith(dto.password);
    // 3. Se llamó a save (al menos una vez) para persistir
    expect(userRepo.save).toHaveBeenCalled();
    // 4. Se llamó a createWallet con el ID del usuario creado (side effect)
    expect(walletService.createWallet).toHaveBeenCalledWith('uuid');
    // 5. El resultado tiene el teléfono correcto
    expect(result.phone).toBe(dto.phone);
    // 6. El usuario se crea activo por defecto
    expect(result.isActive).toBe(true);
  });

  // ── Test 2: Teléfono duplicado → excepción ─────────────────────────────────
  it('should throw UserAlreadyExistsException if phone exists', async () => {
    // DTO mínimo (solo campos obligatorios)
    const dto = {
      phone: '+584141234567',
      password: 'password123',
      fullName: 'Test User',
      role: 'passenger' as any,
      category: 'normal' as any,
    };

    // Simular que el repositorio ya encontró un usuario con ese teléfono
    userRepo.findByPhone.mockResolvedValue(
      new User(
        'existing-id',
        dto.phone,
        null,
        'hash',
        dto.fullName,
        null,
        'passenger',
        null,
        null,
        null,
        1,
        'normal',
        false,
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );

    // Ejecutar y esperar que rechace con UserAlreadyExistsException
    await expect(useCase.execute(dto)).rejects.toThrow(
      UserAlreadyExistsException,
    );
    // Verificar que NUNCA se llamó a save (no se persiste nada)
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  // ── Test 3: Wallet opcional falla → registro continúa ──────────────────────
  it('should still create user even if wallet service fails (optional)', async () => {
    // DTO mínimo sin email ni cédula
    const dto = {
      phone: '+584141234567',
      password: 'password123',
      fullName: 'Test User',
      role: 'passenger' as any,
      category: 'normal' as any,
    };

    // Configurar mocks para flujo exitoso hasta la wallet
    userRepo.findByPhone.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    userRepo.save.mockResolvedValue(
      new User(
        'uuid',
        dto.phone,
        null,
        'hashed',
        dto.fullName,
        null,
        'passenger',
        null,
        null,
        null,
        1,
        'normal',
        false,
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );
    // Simular que createWallet LANZA un error (servicio de wallet caído)
    walletService.createWallet.mockRejectedValue(new Error('wallet error'));

    // El caso de uso captura el error internamente (try/catch en paso 5),
    // por lo que execute() NO debe propagar la excepción.
    const result = await useCase.execute(dto);
    // El resultado debe estar definido (usuario creado exitosamente)
    expect(result).toBeDefined();
    // Verificar que se intentó crear la wallet aunque haya fallado
    expect(walletService.createWallet).toHaveBeenCalled();
  });
});
