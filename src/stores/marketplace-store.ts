import { create } from 'zustand';

interface MarketplaceState {
  // Filter values (null = use account preference)
  category: string | null;
  sort: string;
  limit: number;
  search: string;

  // Track if user has made manual selections
  hasUserSelection: boolean;

  // Actions
  setCategory: (category: string | null) => void;
  setSort: (sort: string) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  resetToDefaults: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  category: null,  // null = use account preference
  sort: 'createdAt',
  limit: 25,
  search: '',
  hasUserSelection: false,

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
}));
