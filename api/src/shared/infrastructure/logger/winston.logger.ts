// src/shared/infrastructure/logger/winston.logger.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WinstonLogger — Implementación de Logger con Winston
 * ═══════════════════════════════════════════════════════════════
 *
 * Adaptador concreto del puerto ILogger que utiliza Winston 3.
 * Características:
 *   - Salida JSON estructurada con timestamp
 *   - Transporte a consola (todos los niveles)
 *   - Archivo error.log solo para errores
 *   - Archivo combined.log para todos los niveles
 *   - Nivel configurable via LOG_LEVEL env var (default: info)
 *
 * Capa: Infraestructura (shared/logger)
 * Dependencias:
 *   - ILogger (puerto)
 *   - winston ^3.19
 *
 * @module WinstonLogger
 * @see ILogger
 */

// ─── Importaciones ───
import { ILogger } from '../../application/ports/logger.port'; // Puerto ILogger: contrato que esta clase implementa
import * as winston from 'winston'; // Winston 3: librería de logging con múltiples transportes

// ─── Implementación concreta del puerto ILogger usando Winston 3 ───
// Esta clase es el adaptador de infraestructura que conecta el contrato ILogger
// (capa de aplicación) con Winston (librería externa). Sigue el patrón Puerto-Adaptador.
export class WinstonLogger implements ILogger {
  private logger: winston.Logger; // Instancia interna del logger de Winston configurada en el constructor

  // Constructor: configura Winston con nivel, formato JSON y tres transportes de salida
  constructor() {
    this.logger = winston.createLogger({
      // Nivel mínimo de logging: se lee de LOG_LEVEL (default 'info').
      // Niveles disponibles: error, warn, info, http, verbose, debug, silly
      level: process.env.LOG_LEVEL || 'info',
      // Formato combinado: timestamp ISO 8601 + salida JSON estructurada para facilitar
      // el parseo por sistemas centralizados de logs (ELK, Loki, Datadog, etc.)
      format: winston.format.combine(
        winston.format.timestamp(), // Agrega campo @timestamp con la hora actual en formato ISO
        winston.format.json(), // Serializa el mensaje como objeto JSON
      ),
      // Transportes definen DÓNDE se escriben los logs
      transports: [
        new winston.transports.Console(), // Consola: útil en desarrollo y Docker (stdout/stderr)
        new winston.transports.File({ filename: 'error.log', level: 'error' }), // error.log: solo errores, para revisión rápida de fallos
        new winston.transports.File({ filename: 'combined.log' }), // combined.log: todos los niveles, para auditoría completa
      ],
    });
  }

  // Nivel INFO: operaciones normales del sistema
  log(message: string, context?: string): void {
    this.logger.info(message, { context }); // context identifica el módulo/clase que origina el log
  }

  // Nivel ERROR: fallos críticos que requieren atención
  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context }); // trace contiene el stack trace del error
  }

  // Nivel WARN: situaciones anómalas pero no críticas
  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  // Nivel DEBUG: diagnóstico detallado solo visible en desarrollo
  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  // Nivel VERBOSE: trazas muy finas para depuración profunda
  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
