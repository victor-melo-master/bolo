// src/health.controller.spec.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * HealthController — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el controlador de healthcheck retorne el resultado
 * del servicio HealthCheckService de Terminus.
 * Se usa mock manual porque HealthCheckService es una dependencia externa.
 *
 * @module test/health.controller.spec
 */

// ─── Importaciones del proyecto y de NestJS Terminus ───
// src/health.controller.spec.ts
// src/health.controller.spec.ts

// src/health.controller.spec.ts

import { HealthController } from './health.controller';
import {
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  HealthIndicatorStatus,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;

  beforeEach(() => {
    healthCheckService = {
      check: jest.fn(),
    } as any;

    const dbIndicator = {} as TypeOrmHealthIndicator; // no lo usamos directamente
    controller = new HealthController(healthCheckService, dbIndicator);
  });

  it('should delegate to health.check with an array and return its result', async () => {
    const mockResult = {
      status: 'ok',
      details: { database: { status: 'up' } },
    };
    healthCheckService.check.mockResolvedValue(
      mockResult as HealthCheckResult<
        HealthIndicatorResult<
          string,
          HealthIndicatorStatus,
          Record<string, any>
        >
      >,
    );

    const result = await controller.check();

    expect(healthCheckService.check).toHaveBeenCalledWith(expect.any(Array));
    expect(result).toEqual(mockResult);
  });
});
