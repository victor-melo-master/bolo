// src/pages/auth/PassengerLoginPage.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * PassengerLoginPage — Página de inicio de sesión para pasajeros
 * ═══════════════════════════════════════════════════════════════
 *
 * Renderiza el formulario LoginForm configurado para pasajeros.
 * Redirige a /dashboard tras un login exitoso.
 *
 * Capa: page
 * Dependencias: useLogin(passenger), LoginForm, react-router-dom
 *
 * @module PassengerLoginPage
 */
// pages/auth/RecoverPage.tsx
// src/pages/auth/PassengerLoginPage.tsx
import { useLogin } from '../../modules/auth/hooks/useLogin';
import LoginForm from '../../modules/auth/components/LoginForm';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginRequest } from '../../modules/auth/types';

export default function PassengerLoginPage() {
  const { execute, isLoading, error } = useLogin('passenger');
  const navigate = useNavigate();

  const handleSubmit = async (data: LoginRequest) => {
    try {
      await execute(data);
      navigate('/dashboard', { replace: true });
    } catch {
      // error manejado en hook
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Iniciar sesión - Pasajero</h1>
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      <p style={{ marginTop: 16 }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
      <p>
        <Link to="/recover">¿Olvidaste tu contraseña?</Link>
      </p>
      <p>
        <Link to="/">← Volver al inicio</Link>
      </p>
    </div>
  );
}