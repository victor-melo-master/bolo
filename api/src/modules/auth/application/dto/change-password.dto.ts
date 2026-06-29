// auth/application/dto/change-password.dto.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * ChangePasswordDto — Cambio de contraseña
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO que valida los datos para cambiar la contraseña de un usuario.
 * Requiere la contraseña actual y una nueva que cumpla los requisitos
 * de seguridad (mayúscula, minúscula, número, mínimo 8 caracteres).
 *
 * Capa: Aplicación (auth)
 *
 * @module ChangePasswordDto
 */
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  newPassword: string;
}
