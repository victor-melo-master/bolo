// shared/domain/value-objects/phone.vo.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Phone — Value Object para número de teléfono venezolano
 * ═══════════════════════════════════════════════════════════════
 *
 * Value Object inmutable que representa un número de teléfono móvil
 * venezolano. Provee métodos de fábrica (create), validación (isValid),
 * normalización (normalize) y comparación (equals).
 *
 * Los números se normalizan al formato +58XXXXXXXXX.
 * Acepta formatos: 0414-XXX, +58414XXX, 414XXX.
 *
 * Capa: Dominio (shared)
 *
 * @module Phone
 */

import { InvalidPhoneException } from '../exceptions/invalid-phone.exception';

export class Phone {
  private constructor(private readonly value: string) {}

  static create(rawPhone: string): Phone {
    const cleaned = rawPhone.replace(/\s|-|\(|\)/g, '');
    if (!Phone.isValid(cleaned)) {
      throw new InvalidPhoneException(rawPhone);
    }
    const normalized = Phone.normalize(cleaned);
    return new Phone(normalized);
  }

  static isValid(phone: string): boolean {
    // Eliminar el prefijo +58 si existe
    let national = phone.replace(/^\+58/, '');

    // Si no tiene prefijo +58, verificar si comienza con 0 (ej: 0414...)
    if (
      !phone.startsWith('+58') &&
      national.length > 10 &&
      national.startsWith('0')
    ) {
      // Es un número local con 0 inicial, quitamos el 0 para evaluar
      national = national.slice(1);
    }

    // Ahora national debe tener 10 dígitos comenzando con 414, 424, 416, 426, 412, 422
    const validPrefixes = ['414', '424', '416', '426', '412', '422'];
    const prefix = national.substring(0, 3);
    const suffix = national.substring(3);

    return validPrefixes.includes(prefix) && /^\d{7}$/.test(suffix);
  }

  static normalize(phone: string): string {
    let national = phone.replace(/^\+58/, '');
    if (national.startsWith('0')) {
      national = national.slice(1);
    }
    return `+58${national}`;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
