// src/health.controller.ts — Ruta relativa desde src/
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

import { Controller, Get } from '@nestjs/common';            // Decoradores NestJS para controladores REST
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';  // Servicio de healthchecks de Terminus

@Controller('health')   // Todas las rutas de este controlador empiezan con /health
export class HealthController {
  // Se inyecta HealthCheckService de Terminus para ejecutar los checks
  constructor(private health: HealthCheckService) {}

  @Get()                // GET /health
  @HealthCheck()        // Decorador que formatea automáticamente la respuesta con status, timestamp, etc.
  check() {
    // Array vacío = sin indicadores registrados. Solo retorna estado genérico "ok"
    return this.health.check([]);
  }
}
