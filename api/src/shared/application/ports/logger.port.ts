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

// ─── Puerto de salida: Sistema de Logging (Arquitectura Hexagonal) ───
// Define el contrato para el registro de logs en la aplicación. La implementación
// concreta (WinstonLogger en infraestructura) determina el destino (consola, archivos,
// sistema externo como ELK/Loki). Los casos de uso dependen de esta interfaz, no de
// la implementación específica, lo que permite cambiar el sistema de logging sin
// modificar la lógica de negocio.
export interface ILogger {
  // Nivel INFO: registra un mensaje informativo estándar (operaciones normales del sistema).
  // context identifica el módulo o clase que origina el mensaje (ej: "CreateUserUseCase").
  log(message: string, context?: string): void;

  // Nivel ERROR: registra un error del sistema. trace puede contener el stack trace
  // completo y context el módulo origen. Este nivel siempre se persiste (error.log).
  error(message: string, trace?: string, context?: string): void;

  // Nivel WARN: registra una advertencia (situaciones anómalas pero no críticas).
  // context identifica el módulo o clase que origina la advertencia.
  warn(message: string, context?: string): void;

  // Nivel DEBUG: registra mensajes de depuración para diagnóstico durante desarrollo.
  // Solo visible si LOG_LEVEL está configurado como 'debug' (oculto en producción).
  debug(message: string, context?: string): void;

  // Nivel VERBOSE: registra trazas finas de diagnóstico, más detalladas que debug.
  // Útil para rastrear flujos complejos (ej: ciclo de vida de una solicitud HTTP).
  verbose(message: string, context?: string): void;
}
