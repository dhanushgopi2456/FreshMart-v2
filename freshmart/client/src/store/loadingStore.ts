import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: '',
  show: (message = 'Loading...') => set({ isLoading: true, message }),
  hide: () => set({ isLoading: false, message: '' }),
}));