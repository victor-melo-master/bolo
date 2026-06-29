// auth/application/use-cases/login-admin.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import type { AdminRepositoryPort } from '../../domain/interfaces/repositories/admin.repository.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces/repositories/session.repository.port';
import type { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { Session } from '../../domain/entities/session.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class LoginAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT)
    private readonly adminRepo: AdminRepositoryPort,
    @Inject(SESSION_REPOSITORY_PORT)
    private readonly sessionRepo: SessionRepositoryPort,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(phone: string, password: string, clientType: string = 'phone') {
    // 1. Buscar admin por teléfono
    const admin = await this.adminRepo.findByPhone(phone);
    if (!admin) {
      throw new InvalidCredentialsException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isValid = await this.cryptoService.compare(
      password,
      admin.passwordHash,
    );
    if (!isValid) {
      throw new InvalidCredentialsException('Credenciales inválidas');
    }

    // 3. Verificar que esté activo
    if (!admin.isActive) {
      throw new InvalidCredentialsException('Usuario inactivo');
    }

    // 4. Crear una nueva sesión (rota la clave JWT)
    const jwtKey = randomUUID();
    const session = Session.create({
      userId: admin.id,
      userType: 'admin',
      clientType: clientType as any,
      jwtKey,
    });

    await this.sessionRepo.save(session);

    // 5. Construir el token JWT
    const payload = {
      sub: admin.id,
      phone: admin.phone,
      role: admin.role,
      userType: 'admin',
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtKey,
      expiresIn: '24h',
    });

    // 6. Retornar token y datos básicos
    return {
      accessToken,
      user: {
        id: admin.id,
        phone: admin.phone,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }
}
