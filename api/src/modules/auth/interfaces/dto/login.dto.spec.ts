import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  const validDto: LoginDto = {
    phone: '+584141234567',
    password: 'Test1234',
  };

  it('should pass with all required fields', async () => {
    const dto = plainToInstance(LoginDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('phone', () => {
    it('should fail if phone is missing', async () => {
      const { phone, ...rest } = validDto;
      const dto = plainToInstance(LoginDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    it('should fail if phone is empty', async () => {
      const dto = plainToInstance(LoginDto, { ...validDto, phone: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });
  });

  describe('password', () => {
    it('should fail if password is missing', async () => {
      const { password, ...rest } = validDto;
      const dto = plainToInstance(LoginDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail if password is too short', async () => {
      const dto = plainToInstance(LoginDto, { ...validDto, password: 'short' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });
});
