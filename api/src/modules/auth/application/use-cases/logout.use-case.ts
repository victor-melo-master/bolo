import { Injectable, Inject } from '@nestjs/common';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces';
import type { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY_PORT)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute(sessionId: string): Promise<void> {
    await this.sessionRepo.deactivateSessions([sessionId]);
  }
}
