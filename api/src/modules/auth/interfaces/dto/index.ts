// src/modules/auth/interfaces/dto/index.ts
/**
 * Barrel exports para DTOs de validación/Swagger del módulo auth.
 *
 * @module auth/interfaces/dto
 */

// Barrel file: re-exporta todos los DTOs desde un solo punto de entrada.
// Esto permite importar cualquier DTO con:
//   import { RegisterDto, UserResponseDto } from './interfaces/dto';
// En lugar de importar desde archivos individuales.
export { RegisterDto } from './register.dto';
// UserResponseDto se exporta porque se usa como tipo de retorno en el controlador
export { UserResponseDto } from './user-response.dto';
