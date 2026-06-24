// src/shared/domain/exceptions/not-found.exception.ts — Ruta relativa desde src/
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

// ─── Excepción de dominio: Recurso no encontrado ───
// Extiende Error (y no NotFoundException de NestJS) para mantener la capa de dominio
// limpia de acoplamientos con infraestructura. El filtro global de excepciones se encarga
// de traducir este error a un HTTP 404 en el momento de la respuesta.
export class NotFoundException extends Error {
  // El mensaje por defecto es genérico; cada caso de uso puede personalizarlo
  // (ej. "Usuario con ID 123 no encontrado") para dar contexto en los logs.
  constructor(message: string = 'Resource not found') {
    super(message);
    // Asigna el nombre de la clase explícitamente para que instanceof funcione
    // correctamente incluso tras la transpilación de TypeScript.
    this.name = 'NotFoundException';
  }
}
