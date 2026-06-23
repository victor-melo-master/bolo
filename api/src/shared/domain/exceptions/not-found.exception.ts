// src/shared/domain/exceptions/not-found.exception.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * NotFoundException — Excepción de Recurso no Encontrado
 * ═══════════════════════════════════════════════════════════════
 *
 * Lanzada por casos de uso o repositorios cuando una entidad no
 * existe en el sistema (ej. usuario no encontrado por ID). El filtro
 * global la traduce a HTTP 404.
 *
 * Capa: Dominio (shared) — Excepción
 */

export class NotFoundException extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundException';
  }
}
