import { create } from 'zustand';
import type { CurrentUser } from '../lib/api';

type AuthState = {
  user: CurrentUser | null;
  idToken: string | null;
  setSession: (user: CurrentUser, idToken: string) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,
  setSession: (user, idToken) => set({ user, idToken }),
  clearSession: () => set({ user: null, idToken: null }),
}));
