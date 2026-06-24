// src/modules/auth/domain/exceptions/user-not-found.exception.ts — Ruta relativa desde src/
// Importa NotFoundException de NestJS — HTTP 404, indica que el recurso solicitado no existe
import { NotFoundException } from '@nestjs/common';

// Extiende NotFoundException para que NestJS asigne HTTP 404 automáticamente — evita repetir el código de estado
export class UserNotFoundException extends NotFoundException {
  constructor(message: string = 'Usuario no encontrado') {
    super(message); // Mensaje genérico por defecto; puede personalizarse (ej. "Usuario con ID x no encontrado")
  }
}
