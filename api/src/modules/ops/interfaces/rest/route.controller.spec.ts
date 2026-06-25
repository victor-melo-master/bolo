// ops/interfaces/rest/route.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RouteController } from './route.controller';
import { CreateRouteUseCase } from '../../application/use-cases/create-route.use-case';
import { Route } from '../../domain/entities/route.entity';
import { CreateRouteDto } from '../../application/dto/create-route.dto';

describe('RouteController', () => {
  let controller: RouteController;
  let useCase: any;

  beforeEach(async () => {
    useCase = { execute: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [{ provide: CreateRouteUseCase, useValue: useCase }],
    }).compile();
    controller = module.get<RouteController>(RouteController);
  });

  it('should call use case and return created route', async () => {
    const dto = { name: 'Ruta', coopFareId: 'fare-id' };
    const mockRoute = new Route(
      'route-id',
      'assoc-id',
      dto.name,
      null,
      dto.coopFareId,
      true,
      new Date(),
      new Date(),
    );
    useCase.execute.mockResolvedValue(mockRoute);

    const req = { user: { associationId: 'assoc-id' } };
    const result = await controller.create(req, dto);

    expect(useCase.execute).toHaveBeenCalledWith('assoc-id', dto);
    expect(result).toEqual(mockRoute);
  });

  it('should propagate errors from use case', async () => {
    useCase.execute.mockRejectedValue(new Error('Invalid'));
    const req = { user: { associationId: 'assoc-id' } };
    await expect(controller.create(req, {} as CreateRouteDto)).rejects.toThrow(
      'Invalid',
    );
  });
});
