// src/shared/interfaces/filters/all-exceptions.filter.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AllExceptionsFilter — Filtro Global de Excepciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Captura cualquier excepción no manejada en la aplicación y la
 * transforma en una respuesta JSON estandarizada con:
 *   - statusCode: código HTTP
 *   - timestamp: momento del error
 *   - path: ruta que originó el error
 *   - message: descripción del error
 *
 * Si la excepción es una HttpException de NestJS, usa su código y
 * mensaje. Si es desconocida, retorna 500 Internal Server Error.
 *
 * Capa: Interfaces (shared/filters)
 *
 * @module AllExceptionsFilter
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
