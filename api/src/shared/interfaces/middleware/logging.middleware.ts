// src/shared/interfaces/middleware/logging.middleware.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoggingMiddleware — Middleware de Logging HTTP
 * ═══════════════════════════════════════════════════════════════
 *
 * Middleware global que registra todas las peticiones HTTP entrantes:
 * método, ruta, código de estado y duración en milisegundos.
 * Se ejecuta para cada endpoint de la API.
 *
 * Capa: Interfaces (shared/middleware)
 * Dependencias:
 *   - @nestjs/common: NestMiddleware, Logger
 *   - express: Request, Response, NextFunction
 *
 * @module LoggingMiddleware
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(
        `${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
