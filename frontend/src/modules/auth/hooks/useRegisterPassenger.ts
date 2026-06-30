// src/modules/auth/hooks/useRegisterPassenger.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * useRegisterPassenger — Hook para registro de pasajero
 * ═══════════════════════════════════════════════════════════════
 *
 * Expone execute() que envía los datos de registro al backend,
 * inicia sesión automáticamente almacenando token y perfil en
 * authStore, y gestiona estados de carga/error.
 *
 * Capa: hook (business logic)
 * Dependencias: authApi, authStore, react
 *
 * @module useRegisterPassenger
 */
import { useState } from "react";
import { registerPassenger } from "../services/authApi";
import { useAuthStore } from "../../../shared/store/authStore";
import type { RegisterPassengerRequest } from "../types";

export function useRegisterPassenger() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const execute = async (data: RegisterPassengerRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerPassenger(data);
      login(response.accessToken, response.user);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al registrarse";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}
