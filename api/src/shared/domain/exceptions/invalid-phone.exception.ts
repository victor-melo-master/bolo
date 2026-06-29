// shared/domain/exceptions/invalid-phone.exception.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * InvalidPhoneException — Excepción para números de teléfono inválidos
 * ═══════════════════════════════════════════════════════════════
 *
 * Excepción lanzada cuando un número de teléfono no cumple con el
 * formato esperado para números venezolanos.
 * Extiende BadRequestException de NestJS.
 *
 * Capa: Dominio (shared)
 * Dependencias:
 *   - BadRequestException: excepción HTTP de NestJS
 *
 * @module InvalidPhoneException
 */

import { BadRequestException } from '@nestjs/common';

export class InvalidPhoneException extends BadRequestException {
  constructor(phone: string) {
    super(`El número de teléfono "${phone}" no tiene un formato válido.`);
  }
}
