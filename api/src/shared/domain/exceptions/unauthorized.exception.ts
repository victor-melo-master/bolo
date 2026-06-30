// src/shared/domain/exceptions/unauthorized.exception.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * UnauthorizedException — Excepción de Autorización
 * ═══════════════════════════════════════════════════════════════
 *
 * Lanzada por casos de uso cuando el usuario no está autenticado
 * o no tiene permisos para realizar una operación. El filtro global
 * de excepciones (@see AllExceptionsFilter) la atrapa y retorna
 * un HTTP 401/403 según el contexto.
 *
 * Capa: Dominio (shared) — Excepción
 *
 * @module UnauthorizedException
 */

// ─── Excepción de dominio: Acceso no autorizado ───
// Extiende Error (NO UnauthorizedException de NestJS) para mantener la capa de dominio
// pura y sin acoplamientos a infraestructura. AllExceptionsFilter atrapa esta excepción
// y retorna HTTP 401 (no autenticado) o 403 (sin permisos) según el contexto de la aplicación.
export class UnauthorizedException extends Error {
  // message: por defecto es genérico ("Unauthorized access") por razones de seguridad —
  // no se deben exponer detalles internos al cliente. Cada caso de uso puede personalizar
  // el mensaje para logs internos sin exponer información sensible al usuario final.
  constructor(message: string = 'Unauthorized access') {
    super(message); // Pasa el mensaje al constructor de Error para que esté disponible en .message y .stack
    // this.name se asigna explícitamente para preservar el nombre de la clase tras la transpilación
    // de TypeScript a JavaScript, garantizando que instanceof UnauthorizedException funcione correctamente
    this.name = 'UnauthorizedException';
  }
}
