// src/modules/auth/interfaces/dto/login.dto.spec.ts
// ─── Estrategia de tests ───
// Se prueba que los decoradores de class-validator en LoginDto funcionan
// correctamente. Se usa plainToInstance para convertir objetos planos a
// instancias de LoginDto (necesario para que class-validator los procese)
// y validate para ejecutar las validaciones.
// Cada test modifica un solo campo del DTO base para aislar la validación
// bajo prueba.
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  // DTO base válido: ambos campos obligatorios presentes y con formato correcto
  const validDto: LoginDto = {
    phone: '+584141234567',
    password: 'Test1234',
  };

  // Caso feliz: todos los campos requeridos presentes → sin errores
  it('should pass with all required fields', async () => {
    const dto = plainToInstance(LoginDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // ─── phone ───
  describe('phone', () => {
    // phone ausente → @IsNotEmpty debe generar error
    it('should fail if phone is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { phone, ...rest } = validDto;
      const dto = plainToInstance(LoginDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    // phone con string vacío → @IsNotEmpty debe rechazarlo
    it('should fail if phone is empty', async () => {
      const dto = plainToInstance(LoginDto, { ...validDto, phone: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });
  });

  // ─── password ───
  describe('password', () => {
    // password ausente → @IsNotEmpty debe generar error
    it('should fail if password is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = validDto;
      const dto = plainToInstance(LoginDto, rest);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    // password demasiado corto (5 caracteres) → @MinLength(6) debe rechazarlo
    it('should fail if password is too short', async () => {
      const dto = plainToInstance(LoginDto, { ...validDto, password: 'short' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });
});
