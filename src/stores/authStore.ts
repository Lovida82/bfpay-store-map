import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import * as authApi from '@/services/api/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: { nickname?: string; avatarUrl?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({ user, isInitialized: true });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ isInitialized: true });
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password, nickname) => {
        set({ isLoading: true });
        try {
          const user = await authApi.signUp(email, password, nickname);
          set({ user });
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const user = await authApi.signIn(email, password);
          set({ user });
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await authApi.signOut();
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (profile) => {
        const { user } = get();
        if (!user) throw new Error('로그인이 필요합니다');

        set({ isLoading: true });
        try {
          const updatedUser = await authApi.updateProfile(user.id, profile);
          set({ user: updatedUser });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
