import { create } from 'zustand';
import type { MapPosition, MapBounds } from '@/types/map';
import { DEFAULT_CENTER, DEFAULT_MAP_LEVEL } from '@/utils/constants';

interface MapState {
  center: MapPosition;
  level: number;
  bounds: MapBounds | null;
  selectedStoreId: string | null;
  isLoading: boolean;
  userLocation: MapPosition | null;

  setCenter: (center: MapPosition) => void;
  setLevel: (level: number) => void;
  setBounds: (bounds: MapBounds) => void;
  setSelectedStore: (storeId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUserLocation: (location: MapPosition | null) => void;
  moveToLocation: (location: MapPosition) => void;
  resetMap: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: DEFAULT_CENTER,
  level: DEFAULT_MAP_LEVEL,
  bounds: null,
  selectedStoreId: null,
  isLoading: false,
  userLocation: null,

  setCenter: (center) => set({ center }),
  setLevel: (level) => set({ level }),
  setBounds: (bounds) => set({ bounds }),
  setSelectedStore: (storeId) => set({ selectedStoreId: storeId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setUserLocation: (location) => set({ userLocation: location }),

  moveToLocation: (location) =>
    set({
      center: location,
      level: DEFAULT_MAP_LEVEL,
    }),

  resetMap: () =>
    set({
      center: DEFAULT_CENTER,
      level: DEFAULT_MAP_LEVEL,
      bounds: null,
      selectedStoreId: null,
    }),
}));
