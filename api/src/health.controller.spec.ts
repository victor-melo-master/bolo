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
import { HealthController } from './health.controller';
import { HealthCheckService } from '@nestjs/terminus';

// describe: agrupa tests relacionados con HealthController
describe('HealthController', () => {
  let controller: HealthController; // Instancia del controlador bajo prueba
  let healthCheckService: jest.Mocked<HealthCheckService>; // Mock tipado del servicio externo de Terminus

  // beforeEach: se ejecuta antes de cada test para tener un mock fresco
  beforeEach(() => {
    // Se mockea manualmente HealthCheckService en lugar de usar Test.createTestingModule
    // porque queremos control total sobre el comportamiento del mock y evitar la inicialización
    // completa del módulo de Terminus (que requiere dependencias adicionales)
    healthCheckService = {
      check: jest.fn(), // jest.fn() crea una función mockeada; mockResolvedValue controla su retorno
    } as any; // Cast a any para evitar errores de tipado por propiedades no implementadas del mock

    // Inyección manual del mock en el controlador (no usa el contenedor DI de NestJS)
    controller = new HealthController(healthCheckService);
  });

  // it: caso de prueba individual — verifica que el healthcheck delegue correctamente en Terminus
  it('should return health check result', async () => {
    // mockResult simula la respuesta que Terminus devolvería en un escenario normal
    const mockResult = { status: 'ok', details: {} };
    // mockResolvedValue: hace que check() retorne una Promise resuelta con el mockResult
    healthCheckService.check.mockResolvedValue(mockResult);

    // Ejecuta el método check() del controlador (que internamente llama a health.check([]))
    const result = await controller.check();

    // Assert 1: el valor retornado por el controlador debe ser exactamente el mock proporcionado
    expect(result).toEqual(mockResult);
    // Assert 2: verifica que health.check() fue invocado con un array vacío (sin indicadores registrados)
    expect(healthCheckService.check).toHaveBeenCalledWith([]);
  });
});
