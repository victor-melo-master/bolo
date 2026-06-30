// src/modules/auth/hooks/useChangePassword.ts
import { useState } from "react";
import {
  changePassengerPassword,
  changeAdminPassword,
} from "../services/authApi";
import { useAuthStore } from "../../../shared/store/authStore";
import type { ChangePasswordRequest } from "../types";

export function useChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user ? "role" in user : false;

  const execute = async (data: ChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const changeFn = isAdmin ? changeAdminPassword : changePassengerPassword;
      await changeFn(data);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error, success };
}
