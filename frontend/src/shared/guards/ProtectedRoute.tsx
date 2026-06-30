// src/shared/guards/ProtectedRoute.tsx
/**
 * ═══════════════════════════════════════════════════════════════
 * ProtectedRoute — Guardia de rutas protegidas
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica la existencia del token y opcionalmente exige un rol
 * específico (super_admin, association_admin, driver). Redirige
 * a "/" si no hay sesión o a "/unauthorized" si el rol no coincide.
 *
 * Capa: guard (route protection)
 * Dependencias: react-router-dom, authStore
 * Props: requiredRole?: AdminRole
 *
 * @module ProtectedRoute
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type AdminRole = 'super_admin' | 'association_admin' | 'driver';

interface Props {
  requiredRole?: AdminRole;
}

export function ProtectedRoute({ requiredRole }: Props) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token) {
    return <Navigate to="/" replace />; // o '/login' si prefieres
  }

  if (requiredRole && user) {
    const isAdmin = 'role' in user && ['super_admin', 'association_admin', 'driver'].includes(user.role);
    if (!isAdmin || user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}