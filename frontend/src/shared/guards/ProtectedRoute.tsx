// src/shared/guards/ProtectedRoute.tsx
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