// src/pages/auth/RegisterPage.tsx
import { useRegisterPassenger } from '../../modules/auth/hooks/useRegisterPassenger';
import RegisterPassengerForm from '../../modules/auth/components/RegisterPassengerForm';
import { useNavigate, Link } from 'react-router-dom';
import type { RegisterPassengerRequest } from '../../modules/auth/types';

export default function RegisterPage() {
  const { execute, isLoading, error } = useRegisterPassenger();
  const navigate = useNavigate();

  const handleSubmit = async (data: RegisterPassengerRequest) => {
    try {
      await execute(data);
      navigate('/dashboard', { replace: true });
    } catch {
      // el error se muestra en el formulario
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Registro de Pasajero</h1>
      <RegisterPassengerForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      <p style={{ marginTop: 16 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
      <p>
        <Link to="/">← Volver al inicio</Link>
      </p>
    </div>
  );
}