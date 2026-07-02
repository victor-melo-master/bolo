// src/pages/auth/LogoutSuccessPage.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LogoutSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = (location.state as { userType?: 'admin' | 'passenger' })?.userType || 'passenger';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(userType === 'admin' ? '/admin/login' : '/login', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate, userType]);

  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <h2>¡Operación exitosa!</h2>
      <p>
        Tu sesión ha sido cerrada. Serás redirigido al inicio de sesión de{' '}
        {userType === 'admin' ? 'administrador' : 'pasajero'} en unos segundos...
      </p>
    </div>
  );
}