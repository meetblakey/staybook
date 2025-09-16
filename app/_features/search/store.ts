"use client";

import { create } from "zustand";

import { parseSearchParams } from "@/app/_features/search/schema";
import type { SearchParams } from "@/app/_features/search/schema";

const defaultFilters = parseSearchParams({ guests: 1, sort: "relevance" });

type SearchFilterStore = {
  filters: SearchParams;
  setFilters: (filters: Partial<SearchParams>) => void;
  reset: () => void;
};

export const useSearchFilters = create<SearchFilterStore>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
        amenitiesList: filters.amenitiesList ?? state.filters.amenitiesList,
      },
    })),
  reset: () => set({ filters: defaultFilters }),
}));

export function hydrateFiltersFromUrl(searchParams: URLSearchParams) {
  useSearchFilters.setState({ filters: parseSearchParams(searchParams) });
}
