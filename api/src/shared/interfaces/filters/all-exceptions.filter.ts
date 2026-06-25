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

// ─── Importaciones de NestJS ───
import {
  ExceptionFilter, // Interfaz que deben implementar los filtros de excepción de NestJS
  Catch, // Decorador que indica qué tipo(s) de excepción capturar
  ArgumentsHost, // Contexto de ejecución (HTTP, RPC, WebSockets)
  HttpException, // Clase base para excepciones HTTP de NestJS (BadRequestException, NotFoundException, etc.)
  HttpStatus, // Enumeración de códigos HTTP estándar (200, 400, 401, 404, 500, etc.)
} from '@nestjs/common';
// ─── Tipos de Express para el contexto HTTP ───
import { Request, Response } from 'express'; // Request y Response de Express para acceder a la URL y enviar la respuesta JSON

// ─── Filtro global de excepciones — Captura TODAS las excepciones no manejadas ───
// @Catch() sin argumentos: captura cualquier excepción (Error, HttpException, excepciones de dominio, etc.)
// Si se especificara @Catch(HttpException) solo capturaría HttpException y sus subclases.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Método obligatorio de la interfaz ExceptionFilter
  // exception: el error lanzado (unknown porque puede ser cualquier tipo)
  // host: ArgumentsHost que permite acceder al contexto de ejecución (HTTP, RPC, etc.)
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // Cambia al contexto HTTP para acceder a Request/Response
    const response = ctx.getResponse<Response>(); // Objeto Response de Express para enviar la respuesta de error
    const request = ctx.getRequest<Request>(); // Objeto Request de Express para obtener la URL que originó el error

    // Determina el código HTTP de respuesta:
    // - Si la excepción es una HttpException de NestJS, usa su código de estado (ej: 400, 404, 401)
    // - Si es una excepción desconocida (incluyendo NotFoundException y UnauthorizedException de dominio),
    //   retorna 500 Internal Server Error (a menos que un guardia las traduzca antes)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determina el mensaje de error:
    // - Para HttpException usa el mensaje original de la excepción
    // - Para excepciones desconocidas usa un mensaje genérico de seguridad
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Envía la respuesta JSON estandarizada con los campos acordados para toda la API
    response.status(status).json({
      statusCode: status, // Código HTTP numérico (400, 404, 500, etc.)
      timestamp: new Date().toISOString(), // Momento exacto del error en formato ISO 8601
      path: request.url, // Ruta que originó el error para facilitar el debugging
      message, // Descripción legible del error
    });
  }
}
