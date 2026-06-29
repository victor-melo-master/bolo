// shared/interfaces/decorators/is-cedula-or-passport.decorator.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * IsCedulaOrPassport — Decorador class-validator para cédula o pasaporte
 * ═══════════════════════════════════════════════════════════════
 *
 * Decorador personalizado de class-validator que valida si un valor
 * es una cédula venezolana (formato V/E + guión opcional + 6-10 dígitos)
 * o un pasaporte (alfanumérico de 5 a 20 caracteres).
 *
 * Capa: Interfaces (shared)
 * Dependencias:
 *   - class-validator: registerDecorator, ValidationOptions
 *
 * @module IsCedulaOrPassport
 */

import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsCedulaOrPassport(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCedulaOrPassport',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Cédula venezolana (V o E, guión opcional, 6-10 dígitos)
          const cedulaRegex = /^[veVE]-?\d{6,10}$/;
          if (cedulaRegex.test(value)) return true;
          // Pasaporte (alfanumérico, mínimo 5 caracteres)
          const passportRegex = /^[a-zA-Z0-9]{5,20}$/;
          return passportRegex.test(value) && !cedulaRegex.test(value);
        },
        defaultMessage() {
          return 'El valor debe ser una cédula venezolana (V-12345678) o un pasaporte válido';
        },
      },
    });
  };
}
