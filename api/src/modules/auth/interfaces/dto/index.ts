// src/modules/auth/interfaces/dto/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — DTOs de Validación del Módulo Auth
 * ═══════════════════════════════════════════════════════════════
 *
 * Centraliza las exportaciones de todos los DTOs de validación y
 * respuesta del módulo auth (LoginDto, RegisterDto, etc.) para
 * simplificar las importaciones desde los controladores REST.
 *
 * @module auth/interfaces/dto
 */

// Barrel file: re-exporta todos los DTOs desde un solo punto de entrada.
// Esto permite importar cualquier DTO con:
//   import { RegisterDto, UserResponseDto } from './interfaces/dto';
// En lugar de importar desde archivos individuales.
export { LoginDto } from './login.dto';
