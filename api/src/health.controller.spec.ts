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

import { HealthController } from './health.controller';
import { HealthCheckService } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;

  beforeEach(() => {
    // Se crea un mock manual de HealthCheckService en lugar de usar Test.createTestingModule
    // porque HealthCheckService es de una librería externa y queremos aislar el test
    healthCheckService = {
      check: jest.fn(),    // Se mockea el método check() para controlar su comportamiento en cada test
    } as any;

    // Se instancia el controlador con el mock inyectado manualmente
    controller = new HealthController(healthCheckService);
  });

  it('should return health check result', async () => {
    // Se prepara la respuesta simulada del servicio de healthcheck
    const mockResult = { status: 'ok', details: {} };
    healthCheckService.check.mockResolvedValue(mockResult);  // Simula respuesta exitosa

    const result = await controller.check();

    // Se verifica que el resultado del controlador coincida con el mock
    expect(result).toEqual(mockResult);
    // Se verifica que check() fue llamado sin argumentos (indicadores vacíos)
    expect(healthCheckService.check).toHaveBeenCalledWith([]);
  });
});
