// src/modules/auth/application/dto/logint.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginDto — DTO de Aplicación para Inicio de Sesión
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO interno que transporta credenciales desde el controlador
 * hacia LoginUseCase. Notar el nombre de archivo "logint.dto.ts"
 * (typo histórico) — se mantiene por compatibilidad pero debería
 * renombrarse a "login.dto.ts" en una limpieza futura.
 *
 * Diferencia con los DTOs de interfaz (capa REST):
 *   - Los DTOs de interfaz (LoginRequestDto) usan decoradores de
 *     validación class-validator (@IsString, @IsNotEmpty) y Swagger.
 *   - LoginDto es plano, sin decoradores, usado internamente.
 *   - Los datos llegan ya validados desde el controlador.
 *
 * Capa: Aplicación (auth) — DTO de entrada
 *
 * @module LoginDto
 */

// ─── DTO de Aplicación ─────────────────────────────────────────────────────
// DTO plano sin decoradores. A diferencia de un DTO de interfaz que usaría
// @IsString() y @IsNotEmpty() de class-validator, este DTO es una estructura
// de datos simple que solo transporta las credenciales dentro de la capa de
// aplicación. La validación ya fue realizada por los pipes de NestJS en el
// controlador antes de invocar al caso de uso.
export class LoginDto {
  // Número telefónico del usuario. Debe coincidir con el almacenado en la BD
  // (con código de país, ej. +584141234567).
  phone: string;

  // Contraseña en texto plano. Se comparará contra el hash con bcrypt.
  password: string;
}
