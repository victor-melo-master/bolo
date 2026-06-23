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
 * Capa: Aplicación (auth) — DTO de entrada
 *
 * @module LoginDto
 */

export class LoginDto {
  phone: string;
  password: string;
}
