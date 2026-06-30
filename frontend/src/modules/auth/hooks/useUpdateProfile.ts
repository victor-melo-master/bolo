// src/modules/auth/hooks/useUpdateProfile.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * useUpdateProfile — Hook para actualizar el perfil
 * ═══════════════════════════════════════════════════════════════
 *
 * Expone execute() que envía los cambios al endpoint correcto
 * según el tipo de usuario y actualiza el perfil en authStore.
 *
 * Capa: hook (business logic)
 * Dependencias: authApi, authStore, react
 *
 * @module useUpdateProfile
 */
import { useState } from "react";
import {
  updatePassengerProfile,
  updateAdminProfile,
} from "../services/authApi";
import { useAuthStore } from "../../../shared/store/authStore";
import type { UpdateProfileRequest, UserProfile } from "../types";

export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user ? "role" in user : false;

  const execute = async (data: UpdateProfileRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = isAdmin
        ? await updateAdminProfile(data)
        : await updatePassengerProfile(data);
      setUser(updated as UserProfile);
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err : new Error("Error al registrarse");
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}
