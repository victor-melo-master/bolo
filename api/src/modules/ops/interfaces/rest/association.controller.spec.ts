// ops/interfaces/rest/association.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AssociationController } from './association.controller';
import { CreateAssociationUseCase } from '../../application/use-cases/create-association.use-case';
import { CreateAssociationDto } from '../../application/dto/create-association.dto';

describe('AssociationController', () => {
  let controller: AssociationController;
  let createAssociationUseCase: any;

  // Usamos un objeto plano en lugar de instanciar Association para evitar importaciones problemáticas
  const mockAssociation = {
    id: 'assoc-id',
    name: 'Mi Cooperativa',
    rif: 'J-12345678-9',
    address: 'Calle Principal',
    phone: '+584141234568',
    adminId: 'admin-id',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    createAssociationUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociationController],
      providers: [
        {
          provide: CreateAssociationUseCase,
          useValue: createAssociationUseCase,
        },
      ],
    }).compile();

    controller = module.get<AssociationController>(AssociationController);
  });

  it('should call use case with adminId from token and return association', async () => {
    const dto: CreateAssociationDto = {
      name: 'Mi Cooperativa',
      rif: 'J-12345678-9',
      address: 'Calle Principal',
      phone: '+584141234568',
    };

    const mockReq = { user: { userId: 'admin-id' } };
    createAssociationUseCase.execute.mockResolvedValue(mockAssociation);

    const result = await controller.create(mockReq, dto);

    expect(createAssociationUseCase.execute).toHaveBeenCalledWith(
      'admin-id',
      dto,
    );
    expect(result).toEqual(mockAssociation);
  });

  it('should propagate errors from use case', async () => {
    const dto: CreateAssociationDto = {
      name: 'Otra',
      rif: 'J-98765432-1',
    };

    const mockReq = { user: { userId: 'admin-id' } };
    createAssociationUseCase.execute.mockRejectedValue(
      new Error('RIF duplicado'),
    );

    await expect(controller.create(mockReq, dto)).rejects.toThrow(
      'RIF duplicado',
    );
  });
});
