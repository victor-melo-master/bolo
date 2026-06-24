// src/modules/auth/domain/exceptions/invalid-credentials.exception.ts — Ruta relativa desde src/
// Importa UnauthorizedException de NestJS — HTTP 401, lanzada automáticamente cuando las credenciales fallan
import { UnauthorizedException } from '@nestjs/common';

// Extiende UnauthorizedException para que NestJS asigne HTTP 401 automáticamente sin configuración adicional
export class InvalidCredentialsException extends UnauthorizedException {
  constructor(message: string = 'Credenciales inválidas') {
    super(message); // Delega el mensaje al padre — será serializado en el body de la respuesta HTTP
  }
}
