// src/shared/application/ports/logger.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * ILogger — Puerto de Logger
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para el sistema de logging. La implementación
 * concreta usa Winston (ver WinstonLogger en infraestructura) y
 * escribe a consola y archivos rotativos.
 *
 * Niveles: log (info), error, warn, debug, verbose.
 * Cada método acepta un contexto opcional para identificar el módulo
 * o clase que origina el mensaje.
 *
 * Capa: Aplicación (shared) — Puerto de salida
 *
 * @module ILogger
 */

export interface ILogger {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;
}
