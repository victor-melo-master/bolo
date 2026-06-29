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
