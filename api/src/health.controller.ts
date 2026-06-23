// src/health.controller.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * HealthController — Healthcheck para Orquestación
 * ═══════════════════════════════════════════════════════════════
 *
 * Expone GET /health para que Docker Compose y el middleware (Go Fiber)
 * verifiquen que la API está viva antes de enrutar tráfico.
 * Actualmente solo reporta estado genérico; se ampliará con indicadores
 * de PostgreSQL, Redis y otros servicios (ver @nestjs/terminus).
 *
 * Capa: Interfaces (REST controller)
 * Dependencias:
 *   - @nestjs/terminus: HealthCheckService, @HealthCheck()
 *
 * @module HealthController
 */

import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
