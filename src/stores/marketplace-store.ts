import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MarketplaceState {
  // Filter values (null = use account preference)
  category: string | null;
  sort: string;
  limit: number;
  search: string;

  // Track if user has made manual selections
  hasUserSelection: boolean;

  // Track hydration state to avoid SSR mismatch
  _hasHydrated: boolean;

  // Actions
  setCategory: (category: string | null) => void;
  setSort: (sort: string) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  resetToDefaults: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set) => ({
      category: null,  // null = use account preference
      sort: 'createdAt',
      limit: 25,
      search: '',
      hasUserSelection: false,
      _hasHydrated: false,

      setCategory: (category) => set({ category, hasUserSelection: true }),
      setSort: (sort) => set({ sort, hasUserSelection: true }),
      setLimit: (limit) => set({ limit, hasUserSelection: true }),
      setSearch: (search) => set({ search, hasUserSelection: true }),
      resetToDefaults: () => set({
        category: null,
        sort: 'createdAt',
        limit: 25,
        search: '',
        hasUserSelection: false,
      }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'marketplace-filters', // localStorage key
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
