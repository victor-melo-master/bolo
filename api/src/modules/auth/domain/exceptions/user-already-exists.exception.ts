import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
  constructor(message: string = 'El teléfono ya está registrado') {
    super(message);
  }
}
