// src/modules/auth/hooks/useLogin.ts
import { useState } from "react";
import { loginPassenger, loginAdmin } from "../services/authApi";
import { useAuthStore } from "../../../shared/store/authStore";
import type { LoginRequest, UserType } from "../types";

export function useLogin(userType: UserType) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Extraemos la acción login directamente del store
  const login = useAuthStore((state) => state.login);

  const execute = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginFn = userType === "passenger" ? loginPassenger : loginAdmin;
      const response = await loginFn(data);
      login(response.accessToken, response.user);
      console.log("Token después de login:", useAuthStore.getState().token);
      login(response.accessToken, response.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}
