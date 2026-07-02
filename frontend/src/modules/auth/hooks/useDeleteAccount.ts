// src/modules/auth/hooks/useDeleteAccount.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * useDeleteAccount — Hook para eliminar la cuenta
 * ═══════════════════════════════════════════════════════════════
 *
 * (Pendiente de implementación) Debe exponer execute() que llame
 * al endpoint DELETE correspondiente según el tipo de usuario.
 *
 * Capa: hook (business logic)
 * Dependencias: authApi, authStore, react
 *
 * @module useDeleteAccount
 */
// modules/auth/hooks/useDeleteAccount.ts
import { useState } from 'react';
import { deletePassengerAccount, deleteAdminAccount } from '../services/authApi';
import { useAuthStore } from '../../../shared/store/authStore';

export function useDeleteAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logout = useAuthStore((s) => s.logout);
  const userType = useAuthStore((s) => s.userType());

  const execute = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (userType === 'admin') {
        await deleteAdminAccount();
      } else {
        await deletePassengerAccount();
      }
      logout();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cuenta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}
