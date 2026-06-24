// src/modules/auth/domain/exceptions/user-not-found.exception.ts
import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(message: string = 'Usuario no encontrado') {
    super(message);
  }
}
