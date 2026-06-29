// ops/application/dto/create-route.dto.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateRouteDto — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que las reglas de validación de CreateRouteDto
 * funcionen correctamente mediante class-validator.
 *
 * @module test/create-route.dto.spec
 */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRouteDto } from './create-route.dto';

describe('CreateRouteDto', () => {
  const validDto = {
    name: 'Ruta Centro',
    coopFareId: 'aa06b422-5791-4544-9e15-13590f730ee0',
  };

  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateRouteDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if name is missing', async () => {
    const dto = plainToInstance(CreateRouteDto, {
      coopFareId: validDto.coopFareId,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail if coopFareId is missing', async () => {
    const dto = plainToInstance(CreateRouteDto, {
      name: 'Ruta',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'coopFareId')).toBe(true);
  });

  it('should accept optional description', async () => {
    const dto = plainToInstance(CreateRouteDto, {
      ...validDto,
      description: 'Ruta principal',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
