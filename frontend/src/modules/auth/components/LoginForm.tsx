// src/modules/auth/components/LoginForm.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginForm — Formulario de inicio de sesión
 * ═══════════════════════════════════════════════════════════════
 *
 * Renderiza campos de teléfono y contraseña con validación Zod
 * mediante React Hook Form. Muestra errores de validación en
 * tiempo real y el error del servidor.
 *
 * Capa: UI (componente de formulario)
 * Dependencias: react-hook-form, @hookform/resolvers, validation
 * Props: onSubmit, isLoading, error
 *
 * @module LoginForm
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../utils/validation';
import type { LoginRequest } from '../types';

interface Props {
  onSubmit: (data: LoginRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginForm({ onSubmit, isLoading, error }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('phone')} placeholder="Teléfono (0412XXXXXXX)" />
      {errors.phone && <span>{errors.phone.message}</span>}

      <input type="password" {...register('password')} placeholder="Contraseña" />
      {errors.password && <span>{errors.password.message}</span>}

      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Entrar'}
      </button>
    </form>
  );
}
