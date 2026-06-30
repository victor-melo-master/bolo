// src/modules/auth/components/PasswordChangeForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../utils/validation';
import type { ChangePasswordRequest } from '../types';
import EyeIcon from '../../../shared/components/EyeIcon';

interface Props {
  onSubmit: (data: ChangePasswordRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export default function PasswordChangeForm({ onSubmit, isLoading, error, success }: Props) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: ChangePasswordRequest) => {
    await onSubmit(data);
    reset();
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirmation(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Contraseña actual */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <input
          type={showCurrent ? 'text' : 'password'}
          {...register('currentPassword')}
          placeholder="Contraseña actual"
          style={{ ...inputStyle, paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          style={eyeButtonStyle}
          tabIndex={-1}
          aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <EyeIcon open={showCurrent} size={20} />
        </button>
        {errors.currentPassword && <small style={{ color: 'red' }}>{errors.currentPassword.message}</small>}
      </div>

      {/* Nueva contraseña */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <input
          type={showNew ? 'text' : 'password'}
          {...register('newPassword')}
          placeholder="Nueva contraseña"
          style={{ ...inputStyle, paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          style={eyeButtonStyle}
          tabIndex={-1}
          aria-label={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <EyeIcon open={showNew} size={20} />
        </button>
        {errors.newPassword && <small style={{ color: 'red' }}>{errors.newPassword.message}</small>}
      </div>

      {/* Confirmar nueva contraseña */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <input
          type={showConfirmation ? 'text' : 'password'}
          {...register('newPasswordConfirmation')}
          placeholder="Confirmar nueva contraseña"
          style={{ ...inputStyle, paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShowConfirmation(!showConfirmation)}
          style={eyeButtonStyle}
          tabIndex={-1}
          aria-label={showConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <EyeIcon open={showConfirmation} size={20} />
        </button>
        {errors.newPasswordConfirmation && (
          <small style={{ color: 'red' }}>{errors.newPasswordConfirmation.message}</small>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>¡Contraseña cambiada exitosamente!</p>}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        style={{
          ...buttonBaseStyle,
          backgroundColor: !isValid || isLoading ? '#bdbdbd' : '#d32f2f',
          cursor: !isValid || isLoading ? 'not-allowed' : 'pointer',
          opacity: !isValid || isLoading ? 0.8 : 1,
        }}
      >
        {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 8,
  marginBottom: 4,
  borderRadius: 4,
  border: '1px solid #ccc',
};

const eyeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: 4,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  display: 'flex',
  alignItems: 'center',
  color: '#555',
};

const buttonBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontWeight: 'bold',
  transition: 'background-color 0.2s ease',
};