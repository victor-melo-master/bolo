// modules/auth/components/RecoverConfirmForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recoverConfirmSchema, type RecoverConfirmFormData } from '../utils/validation';
import EyeIcon from '../../../shared/components/EyeIcon';

interface Props {
  onSubmit: (data: RecoverConfirmFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function RecoverConfirmForm({ onSubmit, isLoading, error }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RecoverConfirmFormData>({
    resolver: zodResolver(recoverConfirmSchema),
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: RecoverConfirmFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Código OTP */}
      <div style={{ marginBottom: 12 }}>
        <input
          {...register('token')}
          placeholder="000000"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          style={codeInputStyle}
        />
        {errors.token && (
          <small style={{ color: 'red' }}>{errors.token.message}</small>
        )}
      </div>

      {/* Nueva contraseña */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          {...register('newPassword')}
          placeholder="Nueva contraseña"
          style={{ ...inputStyle, paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={eyeButtonStyle}
          tabIndex={-1}
        >
          <EyeIcon open={showPassword} size={20} />
        </button>
        {errors.newPassword && (
          <small style={{ color: 'red' }}>{errors.newPassword.message}</small>
        )}
      </div>

      {/* Confirmar contraseña */}
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
        >
          <EyeIcon open={showConfirmation} size={20} />
        </button>
        {errors.newPasswordConfirmation && (
          <small style={{ color: 'red' }}>{errors.newPasswordConfirmation.message}</small>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        style={{
          ...buttonBaseStyle,
          backgroundColor: !isValid || isLoading ? '#bdbdbd' : '#388e3c',
          cursor: !isValid || isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Verificando...' : 'Restablecer contraseña'}
      </button>
    </form>
  );
}

const codeInputStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  fontSize: 24,
  textAlign: 'center',
  letterSpacing: 8,
  borderRadius: 4,
  border: '1px solid #ccc',
  marginBottom: 4,
};

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
  marginTop: 8,
};