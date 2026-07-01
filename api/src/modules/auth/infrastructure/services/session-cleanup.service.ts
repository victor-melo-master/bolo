import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces';
import type { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';

@Injectable()
export class SessionCleanupService {
  constructor(
    @Inject(SESSION_REPOSITORY_PORT)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredSessions() {
    console.log('Ejecutando limpieza de sesiones expiradas...');
    await this.sessionRepo.deactivateExpired();
  }
}
