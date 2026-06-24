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
 */

// ─── Excepción de dominio: Acceso no autorizado ───
// Extiende Error (y no UnauthorizedException de NestJS) para evitar que la capa de dominio
// dependa de frameworks externos. El filtro global de excepciones traduce este error a
// HTTP 401 (no autenticado) o 403 (sin permisos) según el contexto.
export class UnauthorizedException extends Error {
  // El mensaje por defecto es propositalmente genérico por seguridad;
  // los casos de uso pueden agregar detalles solo para logs internos.
  constructor(message: string = 'Unauthorized access') {
    super(message);
    // Establece el nombre explícitamente para preservar el tipo tras la transpilación
    // y permitir que el filtro de excepciones lo identifique con instanceof.
    this.name = 'UnauthorizedException';
  }
}
