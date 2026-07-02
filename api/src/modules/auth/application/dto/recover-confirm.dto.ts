// src/modules/auth/application/dto/recover-confirm.dto.ts
import {
  IsString,
  IsNotEmpty,
  Length,
  MinLength,
  Matches,
} from 'class-validator';

export class RecoverConfirmDto {
  @IsString({ message: 'El código debe ser un texto.' })
  @IsNotEmpty({ message: 'El código no puede estar vacío.' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos.' })
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  newPasswordConfirmation: string;
}
