// modules/auth/hooks/useRecoverPassenger.ts
import { useState } from 'react';
import { recoverPassenger } from '../services/authApi';

export function useRecoverPassenger() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = async (data: { email?: string; phone?: string }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await recoverPassenger(data);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al solicitar recuperación');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error, success };
}