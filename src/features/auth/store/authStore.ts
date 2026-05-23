// src/features/auth/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  LoginResponse,
  AuthState,
  AuthStore,
} from "../types/auth";

import {
  getMe as apiGetMe,
} from "../api/authApi";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocurrió un error desconocido.";
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      login: async (response: LoginResponse) => {
        set({ isLoading: true, error: null });

        try {
          // ⚠️ PROTEGER SSR
          if (typeof window !== "undefined") {
            localStorage.setItem("authToken", response.accessToken);
          }

          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response.user;
        } catch (error: unknown) {
          set({
            ...initialState,
            isLoading: false,
            error: getErrorMessage(error),
          });

          throw error;
        }
      },

      logout: () => {
        // ⚠️ PROTEGER SSR
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
        }

        set({
          ...initialState,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        set({ isLoading: true, error: null });

        // ⚠️ PROTEGER SSR
        if (typeof window === "undefined") {
          set({
            ...initialState,
            isLoading: false,
          });
          return;
        }

        const token = localStorage.getItem("authToken");

        if (!token) {
          set({
            ...initialState,
            isLoading: false,
          });

          return;
        }

        try {
          const user = await apiGetMe();

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          localStorage.removeItem("authToken");

          set({
            ...initialState,
            isLoading: false,
            error: "Sesión expirada o inválida.",
          });
        }
      },
    }),
    {
      name: "auth-storage",

      // ⚠️ LA PARTE IMPORTANTE
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => localStorage)
          : undefined,

      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);