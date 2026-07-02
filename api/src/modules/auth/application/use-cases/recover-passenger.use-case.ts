// src/modules/auth/application/use-cases/recover-passenger.use-case.ts

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt, randomUUID } from 'crypto';
import {
  PassengerRepositoryPort,
  PASSENGER_REPOSITORY_PORT,
} from '../../domain/interfaces/repositories/passenger.repository.port';
import {
  NotificationServicePort,
  NOTIFICATION_SERVICE_PORT,
} from '../../domain/interfaces/services/notification.service.port';
import {
  SESSION_REPOSITORY_PORT,
  SessionRepositoryPort,
} from '../../domain/interfaces';
import { Passenger, Session } from '../../domain/entities';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { RecoverConfirmDto } from '../dto/recover-confirm.dto';

@Injectable()
export class RecoverPassengerUseCase {
  constructor(
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
    @Inject(SESSION_REPOSITORY_PORT)
    private readonly sessionRepo: SessionRepositoryPort,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATION_SERVICE_PORT)
    private readonly notificationService: NotificationServicePort,
    private readonly cryptoService: CryptoService,
  ) {}

  async request(dto: { email?: string; phone?: string }): Promise<void> {
    let passenger: Passenger | null = null;
    if (dto.email) {
      passenger = await this.passengerRepo.findByEmailIncludeDeleted(dto.email);
    } else if (dto.phone) {
      passenger = await this.passengerRepo.findByPhoneIncludeDeleted(dto.phone);
    }

    if (!passenger) return;

    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    passenger.recoveryCode = code;
    passenger.recoveryCodeExpiresAt = expiresAt;
    await this.passengerRepo.save(passenger);

    if (passenger.email) {
      await this.notificationService.sendRecoveryCode(passenger.email, code);
    }

    console.log('######## Código de recuperación:', code); // Quitar en producción
  }

  async confirm(dto: RecoverConfirmDto): Promise<{
    accessToken: string;
    user: {
      id: string;
      phone: string;
      fullName: string;
      role: string;
    };
  }> {
    const { token, newPassword, newPasswordConfirmation } = dto;

    // 1. Validar código de recuperación
    const passenger = await this.passengerRepo.findByRecoveryCode(token);
    if (!passenger) throw new UnauthorizedException('Código inválido.');
    if (
      !passenger.recoveryCodeExpiresAt ||
      passenger.recoveryCodeExpiresAt < new Date()
    )
      throw new UnauthorizedException('El código ha expirado.');

    // 2. Validar contraseñas
    if (newPassword !== newPasswordConfirmation)
      throw new BadRequestException('Las contraseñas no coinciden.');

    // 3. Hashear y guardar (reactivar, nueva contraseña, limpiar código)
    const hashedPassword = await this.cryptoService.hash(newPassword);
    const updatedPassenger = {
      ...passenger,
      passwordHash: hashedPassword,
      deletedAt: null,
      isActive: true,
      recoveryCode: null,
      recoveryCodeExpiresAt: null,
    };
    await this.passengerRepo.save(updatedPassenger);

    // 4. Invalidar TODAS las sesiones activas del pasajero (igual que en change-password)
    await this.sessionRepo.deactivateAllForUser(passenger.id, 'passenger');

    // 5. Crear nueva sesión (login automático)
    const jwtKey = randomUUID();
    const session = Session.create({
      userId: passenger.id,
      userType: 'passenger',
      clientType: 'web', // Se puede parametrizar si lo recibís del DTO
      jwtKey,
    });
    await this.sessionRepo.save(session);

    // 6. Firmar token de acceso
    const payload = {
      sub: passenger.id,
      phone: passenger.phone,
      role: 'passenger',
      userType: 'passenger',
      sessionId: session.id,
      iss: 'bolo-api',
      aud: 'bolo-client',
      typ: 'at+jwt',
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtKey,
      expiresIn: '24h',
    });

    // 7. Retornar token + usuario
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
