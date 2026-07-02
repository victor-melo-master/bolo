// modules/auth/hooks/useLogout.ts
import { useCallback } from 'react';
import { logoutPassenger, logoutAdmin } from '../services/authApi';
import { useAuthStore } from '../../../shared/store/authStore';

export function useLogout(onSuccess?: () => void) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const isAdmin = user ? 'role' in user : false;

  const execute = useCallback(async () => {
    try {
      if (isAdmin) {
        await logoutAdmin();
      } else {
        await logoutPassenger();
      }
    } catch {
      // Aunque falle la llamada, limpiamos el estado local
    } finally {
      logout(); // limpia el store
      onSuccess?.(); // redirige si se proporcionó callback
    }
  }, [isAdmin, logout, onSuccess]);

  return { execute };
}