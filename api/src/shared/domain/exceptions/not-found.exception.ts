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
 *
 * @module NotFoundException
 */

// ─── Excepción de dominio: Recurso no encontrado ───
// Extiende Error (NO NotFoundException de NestJS/@nestjs/common) para mantener la capa de dominio
// libre de acoplamientos con frameworks de infraestructura. Esto respeta el principio de Inversión
// de Dependencias (DIP): el dominio no sabe nada sobre HTTP, controladores o NestJS.
// El filtro global AllExceptionsFilter se encarga de atrapar esta excepción y traducirla a HTTP 404.
export class NotFoundException extends Error {
  // message: descripción del error. Por defecto es genérico ("Resource not found"),
  // pero cada caso de uso debe personalizarlo (ej. "Usuario con ID 123 no encontrado")
  // para facilitar la depuración y el rastreo en logs.
  constructor(message: string = 'Resource not found') {
    super(message); // Llama al constructor de Error con el mensaje descriptivo
    // this.name se asigna explícitamente porque TypeScript transpila a JavaScript y,
    // al extender Error, el nombre de la clase puede perderse en la cadena de prototipos.
    // Esto asegura que instanceof NotFoundException funcione correctamente.
    this.name = 'NotFoundException';
  }
}
