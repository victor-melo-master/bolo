// src/shared/interfaces/filters/all-exceptions.filter.ts — Ruta relativa desde src/
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

// Importa las interfaces y clases necesarias de NestJS para el filtro de excepciones
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// Importa los tipos Request y Response de Express para tipar el contexto HTTP
import { Request, Response } from 'express';

// Decorador @Catch() sin argumentos: captura cualquier excepción sin importar su tipo
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Método obligatorio de ExceptionFilter; exception es el error lanzado, host el contexto de ejecución
  catch(exception: unknown, host: ArgumentsHost) {
    // Cambia al contexto HTTP para acceder a request y response de Express
    const ctx = host.switchToHttp();
    // Obtiene el objeto Response para enviar la respuesta de error
    const response = ctx.getResponse<Response>();
    // Obtiene el objeto Request para incluir la ruta en la respuesta de error
    const request = ctx.getRequest<Request>();

    // Determina el código HTTP: si es HttpException usa su código, si no, 500 Internal Server Error
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determina el mensaje: si es HttpException usa su mensaje, si no, mensaje genérico
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Envía respuesta JSON estandarizada con código, timestamp, ruta y mensaje de error
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
