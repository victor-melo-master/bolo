// src/shared/application/ports/logger.port.ts — Ruta relativa desde src/
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
  // Registra un mensaje informativo estándar; context identifica el módulo origen
  log(message: string, context?: string): void;
  // Registra un error; trace puede contener el stack trace y context el módulo origen
  error(message: string, trace?: string, context?: string): void;
  // Registra una advertencia; context identifica el módulo origen
  warn(message: string, context?: string): void;
  // Registra un mensaje de depuración (solo visible en desarrollo si LOG_LEVEL lo permite)
  debug(message: string, context?: string): void;
  // Registra un mensaje detallado para trazas finas de diagnóstico
  verbose(message: string, context?: string): void;
}
