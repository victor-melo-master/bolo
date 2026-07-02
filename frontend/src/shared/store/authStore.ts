// src/shared/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserType } from '../../modules/auth/types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  userType: () => UserType | null;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      userType: () => {
        const user = get().user;
        if (!user) return null;
        if (
          'role' in user &&
          ['super_admin', 'association_admin', 'driver'].includes(user.role)
        ) {
          return 'admin';
        }
        return 'passenger';
      },

      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);