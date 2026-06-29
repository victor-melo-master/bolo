// shared/interfaces/decorators/is-venezuelan-phone.decorator.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * IsVenezuelanPhone — Decorador class-validator para teléfono venezolano
 * ═══════════════════════════════════════════════════════════════
 *
 * Decorador personalizado de class-validator que valida si un valor
 * es un número de teléfono móvil venezolano válido.
 * Utiliza el Value Object Phone del dominio compartido.
 *
 * Capa: Interfaces (shared)
 * Dependencias:
 *   - class-validator: registerDecorator, ValidationOptions
 *   - Phone: value object de dominio para validación
 *
 * @module IsVenezuelanPhone
 */

import { registerDecorator, ValidationOptions } from 'class-validator';
import { Phone } from '../../domain/value-objects/phone.vo';

export function IsVenezuelanPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isVenezuelanPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return Phone.isValid(value);
        },
        defaultMessage() {
          return 'El teléfono debe ser un número móvil venezolano válido (0414, 0424, 0416, 0426, 0412, 0422)';
        },
      },
    });
  };
}
