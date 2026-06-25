import { Test, TestingModule } from '@nestjs/testing';
import { CreateAssociationUseCase } from './create-association.use-case';

import { ForbiddenException, ConflictException } from '@nestjs/common';
import { ASSOCIATION_REPOSITORY_PORT } from '../../../auth/domain/interfaces';
import { USER_REPOSITORY_PORT } from '../../../auth/domain/interfaces';
import { Association, User } from '../../../auth/domain/entities';

describe('CreateAssociationUseCase', () => {
  let useCase: CreateAssociationUseCase;
  let associationRepo: any;
  let userRepo: any;

  // Usuario admin mock (sin asociación previa)
  const mockAdmin = new User(
    'admin-id',
    '+584141234567',
    null,
    'hashed',
    'Admin',
    null,
    'association_admin',
    null, // associationId: null → sin asociación
    null,
    null,
    null,
    1,
    'normal',
    false,
    true,
    null,
    null,
    new Date(),
    new Date(),
  );

  // DTO de entrada válido
  const validDto = {
    name: 'Mi Cooperativa',
    rif: 'J-12345678-9',
    address: 'Calle Principal',
    phone: '+584141234568',
  };

  beforeEach(async () => {
    associationRepo = {
      findByRif: jest.fn(),
      save: jest.fn(),
    };
    userRepo = {
      findById: jest.fn(),
      updateAssociationId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAssociationUseCase,
        { provide: ASSOCIATION_REPOSITORY_PORT, useValue: associationRepo },
        { provide: USER_REPOSITORY_PORT, useValue: userRepo },
      ],
    }).compile();

    useCase = module.get<CreateAssociationUseCase>(CreateAssociationUseCase);
  });

  it('should create association and update admin', async () => {
    userRepo.findById.mockResolvedValue(mockAdmin);
    associationRepo.findByRif.mockResolvedValue(null);
    associationRepo.save.mockResolvedValue(
      new Association(
        'assoc-id',
        validDto.name,
        validDto.rif,
        validDto.address ?? null,
        validDto.phone ?? null,
        mockAdmin.id,
        true,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute(mockAdmin.id, validDto);

    expect(userRepo.findById).toHaveBeenCalledWith('admin-id');
    expect(associationRepo.findByRif).toHaveBeenCalledWith(validDto.rif);
    expect(associationRepo.save).toHaveBeenCalled();
    expect(userRepo.updateAssociationId).toHaveBeenCalledWith(
      'admin-id',
      'assoc-id',
    );
    expect(result.name).toBe(validDto.name);
  });

  it('should throw ForbiddenException if admin not found', async () => {
    userRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('unknown', validDto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException if user is not association_admin', async () => {
    const passenger = { ...mockAdmin, role: 'passenger' };
    userRepo.findById.mockResolvedValue(passenger);
    await expect(useCase.execute('admin-id', validDto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw ConflictException if admin already has association', async () => {
    const adminWithAssoc = { ...mockAdmin, associationId: 'existing-assoc' };
    userRepo.findById.mockResolvedValue(adminWithAssoc);
    await expect(useCase.execute('admin-id', validDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should throw ConflictException if RIF already exists', async () => {
    userRepo.findById.mockResolvedValue(mockAdmin);
    associationRepo.findByRif.mockResolvedValue(
      new Association(
        'assoc-id',
        'Otra',
        validDto.rif,
        null,
        null,
        'other-admin',
        true,
        new Date(),
        new Date(),
      ),
    );
    await expect(useCase.execute('admin-id', validDto)).rejects.toThrow(
      ConflictException,
    );
  });
});
