import { create } from 'zustand';
import { User } from '../types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  convexUserId: string | null;
  login: (user: User) => void;
  logout: () => void;
  setConvexUserId: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  convexUserId: null,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false, convexUserId: null }),
  setConvexUserId: (id) => set({ convexUserId: id }),
}));
