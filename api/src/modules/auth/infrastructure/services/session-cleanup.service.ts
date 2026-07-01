// src/modules/auth/infrastructure/services/session-cleanup.service.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * SessionCleanupService — Limpieza Automática de Sesiones Expiradas
 * ═══════════════════════════════════════════════════════════════
 *
 * Servicio programado (cron) que ejecuta una limpieza periódica de
 * sesiones expiradas en la base de datos. Previene la acumulación de
 * registros de sesión en la tabla auth.sessions y mejora el rendimiento
 * de las consultas de autenticación.
 *
 * Capa: Infraestructura (auth)
 * Dependencias:
 *   - SessionRepositoryPort: acceso a la persistencia de sesiones
 *   - @nestjs/schedule: decorador @Cron para tareas programadas
 *
 * @module SessionCleanupService
 */

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
