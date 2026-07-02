// src/modules/auth/application/dto/recover-request.dto.ts
import { IsEmail, IsPhoneNumber, ValidateIf } from 'class-validator';

export class RecoverRequestDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail(
    {},
    { message: 'Debe proporcionar un email válido si no usa teléfono' },
  )
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsPhoneNumber('VE', {
    message: 'Debe proporcionar un teléfono venezolano válido si no usa email',
  })
  phone?: string;
}
