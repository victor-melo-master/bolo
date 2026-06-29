// fin/application/dto/create-coop-fare.dto.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateCoopFareDto — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que las reglas de validación de CreateCoopFareDto
 * funcionen correctamente mediante class-validator.
 *
 * @module test/create-coop-fare.dto.spec
 */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCoopFareDto } from '.';

describe('CreateCoopFareDto', () => {
  const validDto = {
    name: 'Tarifa Estándar',
    baseAmountUsd: 150,
    exchangeRateId: '019f0049-ea46-7c4b-8f20-50f073c351ec',
  };

  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateCoopFareDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if name is missing', async () => {
    const dto = plainToInstance(CreateCoopFareDto, {
      baseAmountUsd: 150,
      exchangeRateId: '019f0049-ea46-7c4b-8f20-50f073c351ec',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should fail if baseAmountUsd is missing', async () => {
    const dto = plainToInstance(CreateCoopFareDto, {
      name: 'Tarifa',
      exchangeRateId: '019f0049-ea46-7c4b-8f20-50f073c351ec',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'baseAmountUsd')).toBe(true);
  });

  it('should fail if baseAmountUsd is negative', async () => {
    const dto = plainToInstance(CreateCoopFareDto, {
      ...validDto,
      baseAmountUsd: -10,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'baseAmountUsd')).toBe(true);
  });

  it('should fail if exchangeRateId is missing', async () => {
    const dto = plainToInstance(CreateCoopFareDto, {
      name: 'Tarifa',
      baseAmountUsd: 150,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'exchangeRateId')).toBe(true);
  });

  it('should accept optional surcharge fields', async () => {
    const dto = plainToInstance(CreateCoopFareDto, {
      ...validDto,
      surchargeNormal: 0,
      surchargeStudent: -50,
      surchargeElderly: -30,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if surchargeNormal is not integer', async () => {
    const dto = plainToInstance(CreateCoopFareDto, {
      ...validDto,
      surchargeNormal: 1.5,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'surchargeNormal')).toBe(true);
  });

  it('should fail if surchargeStudent is not integer', async () => {
    const dto = plainToInstance(CreateCoopFareDto, {
      ...validDto,
      surchargeStudent: 1.5,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'surchargeStudent')).toBe(true);
  });

  it('should fail if surchargeElderly is not integer', async () => {
    const dto = plainToInstance(CreateCoopFareDto, {
      ...validDto,
      surchargeElderly: 1.5,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'surchargeElderly')).toBe(true);
  });
});
