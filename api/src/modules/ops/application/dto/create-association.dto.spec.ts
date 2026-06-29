/**
 * ═══════════════════════════════════════════════════════════════
 * CreateAssociationDto — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que las reglas de validación de CreateAssociationDto
 * funcionen correctamente mediante class-validator.
 *
 * @module test/create-association.dto.spec
 */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateAssociationDto } from './create-association.dto';

describe('CreateAssociationDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateAssociationDto, {
      name: 'Mi Cooperativa',
      rif: 'J-12345678-9',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if name is missing', async () => {
    const dto = plainToInstance(CreateAssociationDto, {
      rif: 'J-12345678-9',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail if rif is missing', async () => {
    const dto = plainToInstance(CreateAssociationDto, {
      name: 'Mi Cooperativa',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'rif')).toBe(true);
  });

  it('should accept optional address and phone', async () => {
    const dto = plainToInstance(CreateAssociationDto, {
      name: 'Mi Cooperativa',
      rif: 'J-12345678-9',
      address: 'Calle Principal',
      phone: '+584141234568',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
