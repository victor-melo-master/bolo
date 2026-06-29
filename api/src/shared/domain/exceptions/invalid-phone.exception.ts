import { BadRequestException } from '@nestjs/common';

export class InvalidPhoneException extends BadRequestException {
  constructor(phone: string) {
    super(`El número de teléfono "${phone}" no tiene un formato válido.`);
  }
}
