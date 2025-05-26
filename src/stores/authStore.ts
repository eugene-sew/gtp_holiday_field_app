import { create } from 'zustand';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (user: User) => {
    // In a real app, this would call an API
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear from localStorage
      localStorage.removeItem('user');
      
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
  
  updateUser: async (user: User) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user });
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  },
  
  checkAuth: async () => {
    try {
      // Check localStorage for existing user data
      const userJson = localStorage.getItem('user');
      
      if (userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, isAuthenticated: true });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  },
}));