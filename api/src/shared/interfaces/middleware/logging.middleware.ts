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

// ─── Importaciones de NestJS ───
import { Injectable, NestMiddleware, Logger } from '@nestjs/common'; // Injectable: registro en IoC; NestMiddleware: interfaz; Logger: logging nativo NestJS
// ─── Tipos de Express ───
import { Request, Response, NextFunction } from 'express'; // Request: petición entrante; Response: respuesta saliente; NextFunction: callback para continuar la cadena

// @Injectable(): registra esta clase en el contenedor IoC para que NestJS pueda inyectarla como middleware global
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP'); // Logger con contexto 'HTTP' para identificar los mensajes de este middleware en los logs

  // Método obligatorio de NestMiddleware: se ejecuta en cada petición entrante
  // req: petición HTTP entrante; res: respuesta HTTP saliente; next: función que pasa el control al siguiente middleware
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req; // Extrae método (GET, POST, PUT, DELETE) y URL solicitada (ej: /api/auth/login)
    const start = Date.now(); // Toma la marca de tiempo justo antes de procesar la petición

    // Escucha el evento 'finish' de la respuesta (se dispara automáticamente cuando Express envía la respuesta al cliente)
    res.on('finish', () => {
      const duration = Date.now() - start; // Calcula cuánto tardó la petición en milisegundos (incluye tiempo de procesamiento y DB)
      // Registro estructurado: "GET /api/users 200 - 45ms"
      this.logger.log(
        `${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
      );
    });

    next(); // Llama a next() para continuar la cadena de middleware sin interrumpir el flujo de la petición
  }
}
