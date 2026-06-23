// src/shared/domain/exceptions/unauthorized.exception.ts
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

export class UnauthorizedException extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}
