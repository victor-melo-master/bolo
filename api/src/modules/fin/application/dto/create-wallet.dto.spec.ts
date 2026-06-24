// src/modules/fin/application/dto/create-wallet.dto.spec.ts
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateWalletDto } from './create-wallet.dto';

describe('CreateWalletDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateWalletDto, {
      userId: 'user-id',
      currency: 'USD',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if userId is missing', async () => {
    const dto = plainToInstance(CreateWalletDto, { currency: 'USD' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });

  it('should fail if currency is invalid', async () => {
    const dto = plainToInstance(CreateWalletDto, {
      userId: 'user-id',
      currency: 'INVALID',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'currency')).toBe(true);
  });
});
