// src/modules/auth/hooks/useCreateAdmin.ts
import { useState } from "react";
import { createAdmin } from "../services/authApi";
import type { CreateAdminRequest } from "../types";

export function useCreateAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = async (data: CreateAdminRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createAdmin(data);
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
