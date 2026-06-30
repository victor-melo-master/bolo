// src/modules/auth/hooks/useProfile.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * useProfile — Hook para obtener el perfil del usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Al montarse, llama al endpoint de perfil correspondiente según
 * el tipo de usuario (admin/passenger) y sincroniza los datos con
 * authStore vía setUser.
 *
 * Capa: hook (data fetching)
 * Dependencias: authApi, authStore, react
 *
 * @module useProfile
 */
import { useState, useEffect } from "react";
import { getPassengerProfile, getAdminProfile } from "../services/authApi";
import { useAuthStore } from "../../../shared/store/authStore";
import type { UserProfile } from "../types";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const userType = useAuthStore((s) => s.userType()); // ← usa userType()

  const isAdmin = userType === "admin";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = isAdmin
          ? await getAdminProfile()
          : await getPassengerProfile();
        setProfile(data);
        setUser(data); // actualiza el store con datos frescos
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Error al iniciar sesión",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAdmin]); // dependencia segura, no cambia durante la sesión

  return { profile, isLoading, error };
}
