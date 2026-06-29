// src/modules/auth/domain/exceptions/user-not-found.exception.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * UserNotFoundException — Excepción de Usuario no Encontrado
 * ═══════════════════════════════════════════════════════════════
 *
 * Lanzada cuando no se encuentra un usuario en el sistema (por ID,
 * teléfono, email, etc.). Extiende NotFoundException de NestJS para
 * traducirse automáticamente a HTTP 404.
 *
 * Capa: Dominio (auth) — Excepción
 *
 * @module UserNotFoundException
 */
// Importa NotFoundException de NestJS — HTTP 404, indica que el recurso solicitado no existe
import { NotFoundException } from '@nestjs/common';

// Extiende NotFoundException para que NestJS asigne HTTP 404 automáticamente — evita repetir el código de estado
export class UserNotFoundException extends NotFoundException {
  constructor(message: string = 'Usuario no encontrado') {
    super(message); // Mensaje genérico por defecto; puede personalizarse (ej. "Usuario con ID x no encontrado")
  }
}
