// src/modules/auth/utils/validation.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * validation — Esquemas Zod para validación de formularios
 * ═══════════════════════════════════════════════════════════════
 *
 * Define esquemas Zod con saneamiento de teléfono venezolano y
 * cédula/pasaporte. Exporta los esquemas usados por React Hook Form
 * (login, registro, perfil, cambio de contraseña, creación admin)
 * y los tipos inferidos correspondientes.
 *
 * Capa: validation
 * Dependencias: zod
 *
 * @module validation
 */
import { z } from 'zod';

const venezuelanPhoneRegex = /^(\+58)?0?(412|414|416|424|426|422)\d{7}$/;
const cedulaRegex = /^[VEve]\d{6,10}$/;
const passportRegex = /^[A-Za-z0-9]{5,20}$/;

/** Limpia el teléfono: espacios, guiones, puntos, paréntesis. Devuelve string. */
const cleanPhone = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (trimmed === '') return '';
  return trimmed.replace(/[\s\-.()]/g, '');
};

/** Limpia cédula/pasaporte: espacios, guiones, puntos, comas. Devuelve string. */
const cleanCedula = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (trimmed === '') return '';
  return trimmed.replace(/[\s\-.,]/g, '');
};

// ─── Esquemas básicos ──────────────────────────────

export const phoneSchema = z.preprocess(
  cleanPhone,
  z.string().refine((val) => venezuelanPhoneRegex.test(val), {
    message: 'Teléfono móvil venezolano inválido',
  })
);

export const cedulaBaseSchema = z.preprocess(
  cleanCedula,
  z.string().refine(
    (val) => val === '' || cedulaRegex.test(val) || passportRegex.test(val),
    { message: 'Debe ser una cédula (V-12345678) o pasaporte válido' }
  )
);

export const cedulaOptional = cedulaBaseSchema.optional().or(z.literal(''));

export const passwordSchema = z
  .string()
  .min(8, { message: 'Mínimo 8 caracteres' })
  .refine((val) => /[A-Z]/.test(val), { message: 'Debe contener al menos una mayúscula' })
  .refine((val) => /[a-z]/.test(val), { message: 'Debe contener al menos una minúscula' })
  .refine((val) => /\d/.test(val), { message: 'Debe contener al menos un número' });

// ─── Esquemas de formulario ─────────────────────────

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

export const registerPassengerSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  fullName: z.string().min(1, { message: 'El nombre es obligatorio' }),
  email: z.email({ message: 'Email inválido' }).optional().or(z.literal('')),
  cedula: cedulaOptional,
  category: z.enum(['normal', 'student', 'elderly']),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, { message: 'El nombre es obligatorio' }).optional(),
  email: z.email({ message: 'Email inválido' }).optional().or(z.literal('')),
  cedula: cedulaOptional,
  category: z.enum(['normal', 'student', 'elderly']).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'La contraseña actual es requerida' }),
    newPassword: passwordSchema,
    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['newPasswordConfirmation'],
  });

export const createAdminSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  fullName: z.string().min(1, { message: 'El nombre es obligatorio' }),
  email: z.email({ message: 'Email inválido' }).optional().or(z.literal('')),
  cedula: cedulaOptional,
  role: z.enum(['driver', 'association_admin', 'super_admin'], {
    message: 'Selecciona un rol válido',
  }),
});

export const recoverSchema = z.object({
  email: z.email({ message: 'Email inválido' }).optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
}).refine((data) => data.email || data.phone, {
  message: 'Debes ingresar al menos un email o teléfono',
  path: ['email'],
});

export const recoverConfirmSchema = z.object({
  token: z
    .string()
    .length(6, { message: 'El código debe tener 6 dígitos' })
    .regex(/^\d{6}$/, { message: 'El código debe ser numérico' }),
  newPassword: passwordSchema,
  newPasswordConfirmation: z.string(),
}).refine((data) => data.newPassword === data.newPasswordConfirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['newPasswordConfirmation'],
});


// ─── Tipos inferidos para formularios ───────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterPassengerFormData = z.infer<typeof registerPassengerSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
export type RecoverFormData = z.infer<typeof recoverSchema>;
export type RecoverConfirmFormData = z.infer<typeof recoverConfirmSchema>;