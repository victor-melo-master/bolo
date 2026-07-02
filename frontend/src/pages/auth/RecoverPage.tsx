// pages/auth/RecoverPage.tsx
import { useState } from 'react';
import { useRecoverPassenger } from '../../modules/auth/hooks/useRecoverPassenger';
import RecoverForm from '../../modules/auth/components/RecoverForm';
import RecoverConfirmForm from '../../modules/auth/components/RecoverConfirmForm';
import { useConfirmRecovery } from '../../modules/auth/hooks/useConfirmRecovery';
import { useNavigate, Link } from 'react-router-dom';
import type { RecoverConfirmFormData } from '../../modules/auth/utils/validation';

export default function RecoverPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const { execute, isLoading, error, success } = useRecoverPassenger();
  const { execute: confirm, isLoading: confirming, error: confirmError } = useConfirmRecovery();
  const navigate = useNavigate();

  const handleRequestCode = async (data: { phone: string }) => {
    await execute(data);
    setStep(2);
  };

  const handleConfirmCode = async (data: RecoverConfirmFormData) => {
  await confirm(data);
  navigate('/dashboard', { replace: true });
};

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Recuperar cuenta</h1>

      {step === 1 && (
        <RecoverForm
          onSubmit={handleRequestCode}
          isLoading={isLoading}
          error={error}
          success={success}
        />
      )}

      {step === 2 && (
        <>
          <p style={{ marginBottom: 12 }}>
            Ingresa el código de 6 dígitos que enviamos a tu correo.
          </p>
          <RecoverConfirmForm
            onSubmit={handleConfirmCode}
            isLoading={confirming}
            error={confirmError}
          />
          <button
            onClick={() => setStep(1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.9em',
              marginTop: 12,
            }}
          >
            ← Solicitar nuevo código
          </button>
        </>
      )}

      <p style={{ marginTop: 16 }}>
        <Link to="/login">← Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}