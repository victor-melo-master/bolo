// src/modules/auth/interfaces/dto/register.dto.spec.ts
// ─── Estrategia de tests ───
// Se usa plainToInstance de class-transformer para convertir objetos planos
// a instancias de RegisterDto, y validate de class-validator para ejecutar
// las validaciones declaradas con decoradores. Esto prueba que:
//   - Los decoradores @IsString, @IsPhoneNumber, @IsEmail, etc. funcionan
//   - Las restricciones @MinLength, @MaxLength, @IsEnum se aplican
//   - Los campos @IsOptional no fallan cuando están ausentes
// No se mockea nada porque los decoradores de class-validator son la unidad
// bajo prueba y deben ejecutarse realmente.
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  // DTO base válido usado como punto de partida en todos los tests.
  // Cada test modifica un campo específico para probar una validación.
  const validDto: RegisterDto = {
    phone: '+584141234567',
    password: 'Test1234',
    fullName: 'Test User',
    role: 'passenger',
    category: 'normal',
  };

  // Caso base: todos los campos obligatorios presentes y con formato válido
  it('should pass with all required fields', async () => {
    const dto = plainToInstance(RegisterDto, validDto);
    const errors = await validate(dto);
    // Sin errores de validación → el DTO es válido
    expect(errors).toHaveLength(0);
  });

  // ─── phone ───
  describe('phone', () => {
    // phone ausente → error de validación en la propiedad "phone"
    it('should fail if phone is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { phone, ...rest } = validDto;
      const dto = plainToInstance(RegisterDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    // phone vacío → error (no es un número telefónico válido)
    it('should fail if phone is empty', async () => {
      const dto = plainToInstance(RegisterDto, { ...validDto, phone: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    // phone con formato inválido → @IsPhoneNumber debe rechazarlo
    it('should fail if phone is not a valid phone number', async () => {
      const dto = plainToInstance(RegisterDto, { ...validDto, phone: '12345' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });
  });

  // ─── password ───
  describe('password', () => {
    // password ausente → error
    it('should fail if password is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = validDto;
      const dto = plainToInstance(RegisterDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    // password demasiado corto (3 caracteres) → @MinLength(6) debe rechazarlo
    it('should fail if password is too short', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        password: 'Ab1',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });

  // ─── fullName ───
  describe('fullName', () => {
    it('should fail if fullName is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fullName, ...rest } = validDto;
      const dto = plainToInstance(RegisterDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'fullName')).toBe(true);
    });
  });

  // ─── role ───
  describe('role', () => {
    // Valor inválido (no pertenece al enum) → @IsEnum debe rechazarlo
    it('should fail if role is not a valid enum', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        role: 'invalid',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'role')).toBe(true);
    });
  });

  // ─── category ───
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

  // ─── Campos opcionales (email, cedula) ───
  describe('optional fields', () => {
    // email con formato válido → no debe generar errores
    it('should pass with valid optional email', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        email: 'test@test.com',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    // email con formato inválido → @IsEmail debe rechazarlo
    it('should fail with invalid email', async () => {
      const dto = plainToInstance(RegisterDto, {
        ...validDto,
        email: 'notanemail',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    // Sin campos opcionales (solo obligatorios) → debe pasar sin errores
    it('should pass without optional fields', async () => {
      const dto = plainToInstance(RegisterDto, validDto); // no email, cedula
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
