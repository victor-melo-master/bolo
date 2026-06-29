// fin/interfaces/rest/coop-fare.controller.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFareController — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el controlador de tarifas de cooperativa
 * maneje correctamente las rutas HTTP y delegue en los casos de uso.
 *
 * @module test/coop-fare.controller.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CoopFareController } from './coop-fare.controller';
import { CreateCoopFareUseCase } from '../../application/use-cases/create-coop-fare.use-case';
import { CoopFare } from '../../domain/entities/coop-fare.entity';
import { CreateCoopFareDto } from '../../application/dto';

describe('CoopFareController', () => {
  let controller: CoopFareController;
  let useCase: any;

  beforeEach(async () => {
    useCase = { execute: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoopFareController],
      providers: [{ provide: CreateCoopFareUseCase, useValue: useCase }],
    }).compile();
    controller = module.get<CoopFareController>(CoopFareController);
  });

  it('should call use case and return created fare', async () => {
    const dto = {
      name: 'Tarifa',
      baseAmountUsd: 150,
      exchangeRateId: 'rate-id',
    };
    const mockFare = new CoopFare(
      'fare-id',
      'assoc-id',
      dto.name,
      dto.baseAmountUsd,
      dto.exchangeRateId,
      0,
      0,
      0,
      true,
      new Date(),
      new Date(),
    );
    useCase.execute.mockResolvedValue(mockFare);

    const req = { user: { associationId: 'assoc-id' } };
    const result = await controller.create(req, dto);

    expect(useCase.execute).toHaveBeenCalledWith('assoc-id', dto);
    expect(result).toEqual(mockFare);
  });

  it('should propagate errors from use case', async () => {
    useCase.execute.mockRejectedValue(new Error('Invalid'));
    const req = { user: { associationId: 'assoc-id' } };
    await expect(
      controller.create(req, {} as CreateCoopFareDto),
    ).rejects.toThrow('Invalid');
  });
});
