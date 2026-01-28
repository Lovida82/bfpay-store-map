import { create } from 'zustand';
import type { Store, StoreCategory } from '@/types/store';

interface StoreState {
  stores: Store[];
  filteredStores: Store[];
  selectedStore: Store | null;
  searchQuery: string;
  selectedCategory: StoreCategory | null;
  searchRadius: number;
  isLoading: boolean;
  error: string | null;

  setStores: (stores: Store[]) => void;
  addStore: (store: Store) => void;
  updateStore: (store: Store) => void;
  removeStore: (storeId: string) => void;
  setSelectedStore: (store: Store | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: StoreCategory | null) => void;
  setSearchRadius: (radius: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: [],
  filteredStores: [],
  selectedStore: null,
  searchQuery: '',
  selectedCategory: null,
  searchRadius: 1000,
  isLoading: false,
  error: null,

  setStores: (stores) => {
    set({ stores });
    get().applyFilters();
  },

  addStore: (store) => {
    set((state) => ({ stores: [...state.stores, store] }));
    get().applyFilters();
  },

  updateStore: (store) => {
    set((state) => ({
      stores: state.stores.map((s) => (s.id === store.id ? store : s)),
      selectedStore: state.selectedStore?.id === store.id ? store : state.selectedStore,
    }));
    get().applyFilters();
  },

  removeStore: (storeId) => {
    set((state) => ({
      stores: state.stores.filter((s) => s.id !== storeId),
      selectedStore: state.selectedStore?.id === storeId ? null : state.selectedStore,
    }));
    get().applyFilters();
  },

  setSelectedStore: (store) => set({ selectedStore: store }),
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().applyFilters();
  },
  setSearchRadius: (radius) => set({ searchRadius: radius }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  applyFilters: () => {
    const { stores, searchQuery, selectedCategory } = get();
    let filtered = [...stores];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(query) || s.address.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    set({ filteredStores: filtered });
  },

  clearFilters: () => {
    set({
      searchQuery: '',
      selectedCategory: null,
    });
    get().applyFilters();
  },
}));
