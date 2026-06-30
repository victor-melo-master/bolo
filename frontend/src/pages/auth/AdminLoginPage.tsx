// src/pages/auth/AdminLoginPage.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * AdminLoginPage — Página de inicio de sesión para administradores
 * ═══════════════════════════════════════════════════════════════
 *
 * Renderiza el formulario LoginForm configurado para admins.
 * Redirige a /dashboard tras un login exitoso.
 *
 * Capa: page
 * Dependencias: useLogin(admin), LoginForm, react-router-dom
 *
 * @module AdminLoginPage
 */
import { useLogin } from "../../modules/auth/hooks/useLogin";
import LoginForm from "../../modules/auth/components/LoginForm";
import { useNavigate, Link } from "react-router-dom";
import type { LoginRequest } from "../../modules/auth/types";

export default function AdminLoginPage() {
  const { execute, isLoading, error } = useLogin("admin");
  const navigate = useNavigate();

  const handleSubmit = async (data: LoginRequest) => {
    try {
      await execute(data);
      navigate("/dashboard", { replace: true });
    } catch {
      // error manejado en hook
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h1>Iniciar sesión - Administrativo</h1>
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      <p style={{ marginTop: 16 }}>
        <Link to="/">← Volver al inicio</Link>
      </p>
    </div>
  );
}
