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

// Importa el puerto ILogger para implementar el contrato de logging de la aplicación
import { ILogger } from '../../application/ports/logger.port';
// Importa la librería Winston 3 para logging estructurado con múltiples transportes
import * as winston from 'winston';

// Implementación concreta del puerto ILogger usando Winston
export class WinstonLogger implements ILogger {
  // Instancia interna del logger de Winston
  private logger: winston.Logger;

  // Configura Winston al construir la instancia: nivel, formato y transportes
  constructor() {
    this.logger = winston.createLogger({
      // Nivel mínimo de logging; se puede configurar vía variable de entorno LOG_LEVEL, default 'info'
      level: process.env.LOG_LEVEL || 'info',
      // Combina formato de timestamp ISO con salida JSON estructurada
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      // Transportes: consola + archivo de errores + archivo combinado
      transports: [
        // Salida a consola para todos los niveles (útil en desarrollo y Docker)
        new winston.transports.Console(),
        // Archivo error.log solo para nivel 'error' (facilita revisión de errores)
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // Archivo combined.log con todos los niveles para auditoría completa
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  // Registra un mensaje informativo; context indica el módulo que origina el log
  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  // Registra un error; trace lleva el stack trace y context el módulo origen
  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  // Registra una advertencia; context indica el módulo que origina el log
  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  // Registra mensaje de depuración para diagnóstico durante desarrollo
  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  // Registra mensaje detallado para trazas finas de diagnóstico
  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
