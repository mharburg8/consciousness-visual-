import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FacetKey, ExplorerStore } from '../types';
import { presenceQuestions, resonantLayerFrom } from '../data/presenceQuestions';
import { layers } from '../data/layers';

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

// Mobile devices default to low quality to prevent WebGL crashes
const isMobile = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

const useExplorerStore = create<ExplorerStore>()(
  persist(
    (set, get) => ({
      // Transient state
      selectedLayer: null,
      hoveredLayer: null,
      activeFacet: 'experience' as FacetKey,
      isGuideOpen: !readHasSeenGuide(),
      isTextMode: false,
      isHighQuality: !isMobile,
      cameraDepthLayer: null,
      dissolvedLayers: [],

      // Presence mode state
      mode: 'explore',
      presencePhase: 'entry',
      presenceAnswers: [],
      presenceQuestionIndex: 0,
      presenceResonantLayer: null,

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
      dissolveManyLayers: (ids) => set((state) => ({
        dissolvedLayers: [...new Set([...state.dissolvedLayers, ...ids])],
      })),
      setDissolvedLayers: (ids) => set({ dissolvedLayers: ids }),
      cameraResetPending: false,
      requestCameraReset: () => set({ cameraResetPending: true }),
      clearCameraReset:   () => set({ cameraResetPending: false }),
      targetCameraPosition: null,
      requestCameraMoveTo: (position) => set({ targetCameraPosition: position }),
      clearTargetCamera:   () => set({ targetCameraPosition: null }),

      // Presence actions
      enterPresenceMode: () => set({
        mode: 'presence',
        presencePhase: 'questions',
        presenceAnswers: [],
        presenceQuestionIndex: 0,
        presenceResonantLayer: null,
      }),
      exitPresenceMode: () => set({
        mode: 'explore',
        presencePhase: 'entry',
        presenceAnswers: [],
        presenceQuestionIndex: 0,
        presenceResonantLayer: null,
      }),
      answerPresenceQuestion: (layerHint) => {
        const { presenceAnswers, presenceQuestionIndex } = get();
        const nextAnswers = [...presenceAnswers, layerHint];
        const nextIndex = presenceQuestionIndex + 1;
        if (nextIndex >= presenceQuestions.length) {
          set({
            presenceAnswers: nextAnswers,
            presenceQuestionIndex: nextIndex,
            presenceResonantLayer: resonantLayerFrom(nextAnswers),
            presencePhase: 'resonance',
          });
        } else {
          set({
            presenceAnswers: nextAnswers,
            presenceQuestionIndex: nextIndex,
          });
        }
      },
      setPresencePhase: (phase) => set({ presencePhase: phase }),
      sitWithResonantLayer: () => set({ presencePhase: 'sitting' }),
      dissolveFromPresence: () => {
        const { presenceResonantLayer } = get();
        if (presenceResonantLayer == null) return;
        // Dissolve all layers OUTSIDE the resonant one so it becomes the active shell.
        const outerIds = layers
          .filter((l) => l.id > presenceResonantLayer)
          .map((l) => l.id);
        const target = layers.find((l) => l.id === presenceResonantLayer);
        set({
          mode: 'explore',
          presencePhase: 'entry',
          dissolvedLayers: outerIds,
          selectedLayer: presenceResonantLayer,
          activeFacet: 'experience',
          targetCameraPosition: target
            ? [0, target.radius * 0.12, Math.max(target.radius * 1.8, 5)]
            : null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state): PersistedState => ({ hasSeenGuide: state.hasSeenGuide }),
    }
  )
);

export default useExplorerStore;
