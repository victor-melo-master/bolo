import { Injectable, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces/repositories/session.repository.port';

@Injectable()
export class SessionCleanupService {
  constructor(
    @Inject(SESSION_REPOSITORY_PORT)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  @Cron('0 * * * *') // se ejecuta cada hora en el minuto 0
  async handleExpiredSessions() {
    await this.sessionRepo.deactivateExpired();
  }
}
