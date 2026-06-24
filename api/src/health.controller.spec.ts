import { HealthController } from './health.controller';
import { HealthCheckService } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;

  beforeEach(() => {
    // Mock de HealthCheckService
    healthCheckService = {
      check: jest.fn(),
    } as any;

    controller = new HealthController(healthCheckService);
  });

  it('should return health check result', async () => {
    const mockResult = { status: 'ok', details: {} };
    healthCheckService.check.mockResolvedValue(mockResult);

    const result = await controller.check();

    expect(result).toEqual(mockResult);
    expect(healthCheckService.check).toHaveBeenCalledWith([]);
  });
});
