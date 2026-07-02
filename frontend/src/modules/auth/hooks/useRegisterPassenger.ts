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
// useRegisterPassenger.ts – ahora no inicia sesión
import { useState } from "react";
import { registerPassenger } from "../services/authApi";
import type { RegisterPassengerRequest } from "../types";

export function useRegisterPassenger() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = async (data: RegisterPassengerRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await registerPassenger(data);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al recuperar cuenta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error, success };
}
