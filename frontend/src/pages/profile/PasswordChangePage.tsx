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
// src/pages/profile/PasswordChangePage.tsx
import { useEffect } from "react";
import { useChangePassword } from "../../modules/auth/hooks/useChangePassword";
import PasswordChangeForm from "../../modules/auth/components/PasswordChangeForm";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../shared/store/authStore";
import type { ChangePasswordFormData } from "../../modules/auth/utils/validation";
import type { ChangePasswordRequest } from "../../modules/auth/types";

export default function PasswordChangePage() {
  const { execute, isLoading, error, success } = useChangePassword();
  const logout = useAuthStore((s) => s.logout);
  const userType = useAuthStore((s) => s.userType());
  const navigate = useNavigate();

  const handleSubmit = async (data: ChangePasswordFormData) => {
    await execute(data as ChangePasswordRequest);
  };

  useEffect(() => {
    if (success) {
      logout();
      navigate("/logout-success", { state: { userType }, replace: true });
    }
  }, [success, logout, navigate, userType]);

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Cambiar contraseña</h1>
      <PasswordChangeForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        success={false} // no mostramos el mensaje de éxito aquí porque redirigimos
      />
      <p style={{ marginTop: 16 }}>
        <Link to="/profile">← Volver al perfil</Link>
      </p>
    </div>
  );
}