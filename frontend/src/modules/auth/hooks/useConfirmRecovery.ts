// modules/auth/hooks/useConfirmRecovery.ts
import { useState } from 'react';
import { confirmRecovery } from '../services/authApi';
import { useAuthStore } from '../../../shared/store/authStore';

export function useConfirmRecovery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);

  const execute = async (data: { token: string; newPassword: string; newPasswordConfirmation: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await confirmRecovery(data);
      login(response.accessToken, response.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Código inválido o expirado');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}