// src/modules/auth/interfaces/dto/register.dto.spec.ts
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  const validDto: RegisterDto = {
    phone: '+584141234567',
    password: 'Test1234',
    fullName: 'Test User',
    role: 'passenger',
    category: 'normal',
  };

  it('should pass with all required fields', async () => {
    const dto = plainToInstance(RegisterDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('phone', () => {
    it('should fail if phone is missing', async () => {
      const { phone, ...rest } = validDto;
      const dto = plainToInstance(RegisterDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    it('should fail if phone is empty', async () => {
      const dto = plainToInstance(RegisterDto, { ...validDto, phone: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    it('should fail if phone is not a valid phone number', async () => {
      const dto = plainToInstance(RegisterDto, { ...validDto, phone: '12345' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });
  });

  describe('password', () => {
    it('should fail if password is missing', async () => {
      const { password, ...rest } = validDto;
      const dto = plainToInstance(RegisterDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail if password is too short', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        password: 'Ab1',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });

  describe('fullName', () => {
    it('should fail if fullName is missing', async () => {
      const { fullName, ...rest } = validDto;
      const dto = plainToInstance(RegisterDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'fullName')).toBe(true);
    });
  });

  describe('role', () => {
    it('should fail if role is not a valid enum', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        role: 'invalid',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'role')).toBe(true);
    });
  });

  describe('category', () => {
    it('should fail if category is not a valid enum', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        category: 'invalid',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'category')).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('should pass with valid optional email', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        email: 'test@test.com',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid email', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        email: 'notanemail',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should pass without optional fields', async () => {
      const dto = plainToInstance(RegisterDto, validDto); // no email, cedula
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
