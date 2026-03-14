import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FacetKey, ExplorerStore } from '../types';

const STORAGE_KEY = 'consciousness-sphere-guide';

type PersistedState = {
  hasSeenGuide: boolean;
};

function readHasSeenGuide(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return JSON.parse(raw)?.state?.hasSeenGuide === true;
  } catch {
    return false;
  }
}

const useExplorerStore = create<ExplorerStore>()(
  persist(
    (set) => ({
      // Transient state
      selectedLayer: null,
      hoveredLayer: null,
      activeFacet: 'experience' as FacetKey,
      isGuideOpen: !readHasSeenGuide(),
      isTextMode: false,
      isHighQuality: true,
      cameraDepthLayer: null,
      dissolvedLayers: [],

      // Persisted state
      hasSeenGuide: readHasSeenGuide(),

      // Actions
      selectLayer: (id) => set({ selectedLayer: id, activeFacet: 'experience' }),
      setHoveredLayer: (id) => set({ hoveredLayer: id }),
      setActiveFacet: (facet) => set({ activeFacet: facet }),
      toggleGuide: () => set((state) => ({ isGuideOpen: !state.isGuideOpen })),
      toggleTextMode: () => set((state) => ({ isTextMode: !state.isTextMode })),
      toggleQuality: () => set((state) => ({ isHighQuality: !state.isHighQuality })),
      markGuideSeen: () => set({ hasSeenGuide: true, isGuideOpen: false }),
      setCameraDepthLayer: (id) => set({ cameraDepthLayer: id }),
      dissolveLayer: (id) => set((state) => ({
        dissolvedLayers: state.dissolvedLayers.includes(id)
          ? state.dissolvedLayers
          : [...state.dissolvedLayers, id],
      })),
      resetDissolved: () => set({ dissolvedLayers: [] }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state): PersistedState => ({ hasSeenGuide: state.hasSeenGuide }),
    }
  )
);

export default useExplorerStore;
