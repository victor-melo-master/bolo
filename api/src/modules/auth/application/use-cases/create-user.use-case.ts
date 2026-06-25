// src/modules/auth/application/use-cases/create-user.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateUserUseCase — Caso de Uso: Registrar Usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta el registro completo de un nuevo usuario:
 *   1. Valida que el teléfono no esté registrado
 *   2. Hashea la contraseña con bcrypt (costo 10)
 *   3. Crea la entidad User mediante el método de fábrica
 *   4. Persiste mediante el repositorio
 *   5. Crea la billetera digital asociada (si WalletServicePort
 *      está disponible — actualmente es un mock)
 *
 * Dependencias inyectadas:
 *   - UserRepositoryPort (puerto de salida → UserRepositoryImpl)
 *   - CryptoService (servicio compartido de hashing)
 *   - WalletServicePort (opcional — mock hasta implementar fin)
 *
 * Capa: Aplicación (auth) — Caso de uso
 *
 * @module CreateUserUseCase
 */

// ─── Imports: decoradores de NestJS para inyección de dependencias ──────────
import { Injectable, Inject, Optional } from '@nestjs/common';
// DTO plano (sin decoradores) que transporta datos desde el controlador
import { CreateUserDto } from '../dto/create-user.dto';
// Entidad de dominio User, usada para crear instancias con el factory method
import { User } from '../../domain/entities/user.entity';
// Token string para identificar la implementación del repositorio en el DI container
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
// Tipo del puerto de salida del repositorio (solo type, se elimina en compilación)
import type { UserRepositoryPort } from '../../domain/interfaces/repositories/user.repository.port';
// Token string para identificar el servicio de wallet en el DI container
import { WALLET_SERVICE_PORT } from '../../domain/interfaces/services/wallet.service.port';
// Tipo del puerto de salida del servicio de wallet (solo type, se elimina en compilación)
import type { WalletServicePort } from '../../domain/interfaces/services/wallet.service.port';
// Servicio compartido de hashing (bcrypt) ubicado en la capa shared
import { CryptoService } from '../../../../shared/application/services/crypto.service';
// Excepción de dominio lanzada cuando el teléfono ya está registrado
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';

// @Injectable: decorador que registra esta clase como provider en NestJS
@Injectable()
export class CreateUserUseCase {
  constructor(
    // @Inject con token string en lugar del tipo directamente:
    // USER_REPOSITORY_PORT es un string único ("UserRepositoryPort") que evita
    // conflictos cuando hay múltiples implementaciones de la misma interfaz.
    // La inyección por token es necesaria porque UserRepositoryPort es una
    // interfaz de TypeScript que no existe en tiempo de ejecución.
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
    // CryptoService es una clase concreta, por lo que NestJS puede resolverla
    // directamente sin @Inject (inyección por tipo).
    private readonly cryptoService: CryptoService,
    // @Optional + @Inject: WalletServicePort es opcional porque actualmente es
    // un mock; si no está registrado en el DI container, NestJS inyecta undefined
    // en lugar de lanzar una excepción. Esto permite que el caso de uso funcione
    // aunque el módulo financiero aún no esté implementado.
    @Optional()
    @Inject(WALLET_SERVICE_PORT)
    private readonly walletService?: WalletServicePort,
  ) {}

  // execute: método público que orquesta el flujo completo de registro
  async execute(dto: CreateUserDto): Promise<User> {
    // Paso 1 — Validación de unicidad: buscar usuario por teléfono
    const existing = await this.userRepo.findByPhone(dto.phone);
    if (existing) {
      // Si ya existe un usuario con ese teléfono, lanzamos una excepción de dominio
      // que será capturada por el controlador y traducida a un 409 Conflict.
      throw new UserAlreadyExistsException(
        'User with this phone already exists',
      );
    }

    // Paso 2 — Hashing de contraseña: delegamos en CryptoService que internamente
    // usa bcrypt con salt rounds = 10. Nunca almacenamos la contraseña en texto plano.
    const hashedPassword = await this.cryptoService.hash(dto.password);

    // Paso 3 — Creación de la entidad User mediante el factory method estático.
    // User.create() aplica validaciones de dominio internas (formato de teléfono,
    // longitud de nombre, etc.) y establece valores por defecto (isActive = true,
    // jwtKey = null, qrCode = null, etc.).
    const user = User.create({
      phone: dto.phone,
      email: dto.email ?? null, // email es opcional; null si no se provee
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      cedula: dto.cedula ?? null, // cédula opcional; null si no se provee
      role: dto.role,
      category: dto.category,
      jwtKey: null, // la llave JWT se genera en el login
      qrCode: null, // QR pendiente de generación posterior
      qrKey: null, // llave del QR pendiente
      qrVersion: 0, // versión inicial del QR
      studentDocApproved: false, // documento de estudiante pendiente de verificación
      isActive: true, // usuario activo por defecto al registrarse
      deletedAt: null, // soft-delete: null significa no eliminado
      lastLoginAt: null, // aún no ha iniciado sesión
      associationId: dto.associationId ?? null, // Id de la asociacion a la que pertenece el usuario (opcional, requerido para ciertos roles)
    });

    // Paso 4 — Persistencia: guardar la entidad en la base de datos mediante el
    // repositorio. El repositorio se encarga del mapeo a la tabla correspondiente.
    const savedUser = await this.userRepo.save(user);

    // Paso 5 — Side effect: creación de billetera digital asociada al usuario.
    // Este paso es un efecto secundario: si falla, no debe impedir el registro.
    // Se chequea this.walletService porque es @Optional — puede ser undefined
    // si el WalletServicePort no está registrado en el módulo.
    if (this.walletService) {
      try {
        // Intentar crear la billetera. El servicio de wallet recibe el ID del
        // usuario recién creado para asociarle una cuenta financiera.
        await this.walletService.createWallet(savedUser.id);
      } catch (error) {
        // El try/catch asegura que un error en la creación de la billetera
        // (ej. el servicio falla, timeout, error de red) no propague una
        // excepción que cancele el registro del usuario. El error se registra
        // en consola para depuración y monitoreo, pero el flujo continúa.
        // En el futuro, esto podría encolar un trabajo de reintento.
        console.error(
          'Wallet creation failed, continuing user registration:',
          error,
        );
      }
    }

    // Retornar el usuario persistido (con ID asignado por la BD)
    return savedUser;
  }
}
