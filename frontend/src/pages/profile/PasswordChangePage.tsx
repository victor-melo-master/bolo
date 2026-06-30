// src/pages/profile/PasswordChangePage.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * PasswordChangePage — Página de cambio de contraseña
 * ═══════════════════════════════════════════════════════════════
 *
 * Renderiza el formulario PasswordChangeForm usando el hook
 * useChangePassword para gestionar la lógica de negocio.
 *
 * Capa: page
 * Dependencias: useChangePassword, PasswordChangeForm, router
 *
 * @module PasswordChangePage
 */
import { useChangePassword } from '../../modules/auth/hooks/useChangePassword';
import PasswordChangeForm from '../../modules/auth/components/PasswordChangeForm';
import { Link } from 'react-router-dom';
import type { ChangePasswordRequest } from '../../modules/auth/types';

export default function PasswordChangePage() {
  const { execute, isLoading, error, success } = useChangePassword();

  const handleSubmit = async (data: ChangePasswordRequest) => {
    await execute(data);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Cambiar contraseña</h1>
      <PasswordChangeForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        success={success}
      />
      <p style={{ marginTop: 16 }}>
        <Link to="/profile">← Volver al perfil</Link>
      </p>
    </div>
  );
}