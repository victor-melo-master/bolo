// src/shared/interfaces/middleware/logging.middleware.ts — Ruta relativa desde src/
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

// Importa decoradores y clases de NestJS para crear un middleware inyectable
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
// Importa los tipos de Express para tipar el request, response y next function
import { Request, Response, NextFunction } from 'express';

// Decorador que marca la clase como inyectable para el sistema DI de NestJS
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  // Logger de NestJS con contexto 'HTTP' para identificar los logs de este middleware
  private logger = new Logger('HTTP');

  // Método obligatorio de NestMiddleware; se ejecuta en cada petición entrante
  use(req: Request, res: Response, next: NextFunction) {
    // Extrae el método HTTP (GET, POST, etc.) y la URL original de la petición
    const { method, originalUrl } = req;
    // Toma la marca de tiempo justo antes de procesar la petición
    const start = Date.now();

    // Escucha el evento 'finish' de la respuesta (se dispara cuando la respuesta se envía al cliente)
    res.on('finish', () => {
      // Calcula la duración total de la petición en milisegundos
      const duration = Date.now() - start;
      // Registra método, ruta, código de estado y duración en un solo mensaje
      this.logger.log(
        `${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
      );
    });

    // Llama a next() para pasar el control al siguiente middleware o manejador de ruta
    next();
  }
}
