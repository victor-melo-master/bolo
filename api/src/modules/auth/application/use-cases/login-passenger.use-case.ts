// auth/application/use-cases/login-passenger.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginPassengerUseCase — Inicio de sesión de pasajero
 * ═══════════════════════════════════════════════════════════════
 *
 * Autentica a un pasajero por teléfono y contraseña,
 * verifica que esté activo, crea una sesión JWT y retorna
 * el token de acceso junto con los datos básicos del usuario.
 *
 * Capa: Aplicación (auth)
 * Dependencias:
 *   - PassengerRepositoryPort: persistencia de pasajeros
 *   - SessionRepositoryPort: gestión de sesiones
 *   - CryptoService: comparación de contraseñas
 *   - JwtService: generación de tokens JWT
 *
 * @module LoginPassengerUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import type { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces/repositories/session.repository.port';
import type { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { Session } from '../../domain/entities/session.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class LoginPassengerUseCase {
  constructor(
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
    @Inject(SESSION_REPOSITORY_PORT)
    private readonly sessionRepo: SessionRepositoryPort,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(phone: string, password: string, clientType: string = 'phone') {
    // 1. Buscar pasajero por teléfono
    const passenger = await this.passengerRepo.findByPhone(phone);
    if (!passenger) {
      throw new InvalidCredentialsException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isValid = await this.cryptoService.compare(
      password,
      passenger.passwordHash,
    );
    if (!isValid) {
      throw new InvalidCredentialsException('Credenciales inválidas');
    }

    // 3. Verificar que esté activo
    if (!passenger.isActive) {
      throw new InvalidCredentialsException('Usuario inactivo');
    }

    await this.sessionRepo.deactivateAllForUser(passenger.id, 'passenger');

    // 4. Crear una nueva sesión (rota la clave JWT)
    const jwtKey = randomUUID();
    const session = Session.create({
      userId: passenger.id,
      userType: 'passenger',
      clientType: clientType as any,
      jwtKey,
    });

    await this.sessionRepo.save(session);

    // 5. Construir el token JWT
    const payload = {
      sub: passenger.id,
      phone: passenger.phone,
      role: 'passenger',
      userType: 'passenger',
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtKey,
      expiresIn: '24h',
    });

    await this.passengerRepo.updateLastLogin(passenger.id);

    // 6. Retornar token y datos básicos
    return {
      accessToken,
      user: {
        id: passenger.id,
        phone: passenger.phone,
        fullName: passenger.fullName,
        role: 'passenger',
      },
    };
  }
}
