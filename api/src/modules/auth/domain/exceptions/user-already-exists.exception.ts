// src/modules/auth/domain/exceptions/user-already-exists.exception.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * UserAlreadyExistsException — Excepción de Usuario Duplicado
 * ═══════════════════════════════════════════════════════════════
 *
 * Lanzada cuando se intenta registrar un usuario con un teléfono
 * que ya existe en el sistema. Extiende ConflictException de NestJS
 * para traducirse automáticamente a HTTP 409.
 *
 * Capa: Dominio (auth) — Excepción
 *
 * @module UserAlreadyExistsException
 */
// Importa ConflictException de NestJS — HTTP 409, semánticamente correcta para conflictos de recurso duplicado
import { ConflictException } from '@nestjs/common';

// Extiende ConflictException para que NestJS devuelva HTTP 409 automáticamente al lanzar esta excepción
export class UserAlreadyExistsException extends ConflictException {
  constructor(message: string = 'El teléfono ya está registrado') {
    super(message); // El mensaje por defecto informa el campo único duplicado (teléfono)
  }
}
