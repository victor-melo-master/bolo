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

// ─── Importaciones de NestJS y Terminus ───
import { Controller, Get } from '@nestjs/common'; // @Controller: define un controlador REST; @Get: asocia GET a un método
import { HealthCheckService, HealthCheck } from '@nestjs/terminus'; // HealthCheckService: ejecuta healthchecks; @HealthCheck: formatea la respuesta automáticamente

// @Controller('health'): todas las rutas de este controlador se prefijan con /health
@Controller('health')
export class HealthController {
  // Inyección del servicio de healthchecks de Terminus para ejecutar verificaciones de estado
  // HealthCheckService permite agregar indicadores (PostgreSQL, Redis, etc.) con checkers especializados
  constructor(private health: HealthCheckService) {}

  // @Get() sin subruta: responde en GET /health
  // @HealthCheck(): decorador que envuelve la respuesta con formato estándar: status, timestamp, detalles
  @Get()
  @HealthCheck()
  check() {
    // this.health.check([]) con array vacío: sin indicadores registrados aún
    // Retorna solo estado genérico "ok". Se ampliará añadiendo checkers de TypeORM, Redis, etc.
    return this.health.check([]);
  }
}
