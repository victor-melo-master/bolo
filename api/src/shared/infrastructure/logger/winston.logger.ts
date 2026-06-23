// src/shared/infrastructure/logger/winston.logger.ts
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

import { ILogger } from '../../application/ports/logger.port';
import * as winston from 'winston';

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
