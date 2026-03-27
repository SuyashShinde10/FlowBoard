import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('pmp_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password, role });
          localStorage.setItem('pmp_token', data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      logout: () => {
        localStorage.removeItem('pmp_token');
        set({ user: null, token: null });
        window.location.href = '/login';
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch (err) {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'pmp_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
