export type FacetKey = 'experience' | 'veil' | 'dissolving' | 'signs';

export interface LevelEntry {
  name: string;
  emotionalState: string;
  viewOfLife: string;
  keyToTranscending: string;  // "Removal"
  experience: string;          // "Experience"
  consciousness: string;       // "Consciousness"
  location: string;            // "Location"
}

export interface LayerFacets {
  experience: string;   // "What You Experience Here"
  veil: string;         // "What Keeps This Layer Opaque"
  dissolving: string;   // "How This Layer Dissolves"
  signs: string;        // "Signs of Thinning"
}

export interface Layer {
  id: number;           // 1 = innermost, 7 = outermost
  name: string;         // e.g. "3rd Dimension: Contraction & Fear"
  subtitle: string;     // short descriptor
  levels: string[];     // individual named levels within this band
  color: string;        // CSS var reference e.g. "var(--layer-7)"
  hexColor: string;     // actual hex for Three.js materials
  radius: number;       // 7 | 6 | 5 | 4 | 3 | 2 | 1.2
  opacity: number;      // 0.55 (outer) → 0.08 (inner)
  chartLocation: string;
  levelData: LevelEntry[];
  whatWeExperience?: string;
  stateOfConsciousness?: string;
  facets: LayerFacets;
}

export type AppMode = 'explore' | 'presence';

export type PresencePhase =
  | 'entry'       // not active
  | 'questions'   // answering the orienting questions
  | 'resonance'   // viewing the layer that resonated
  | 'sitting';    // breathing / resting with the layer

export interface ExplorerStore {
  selectedLayer: number | null;
  hoveredLayer: number | null;
  activeFacet: FacetKey;
  isGuideOpen: boolean;
  isTextMode: boolean;
  isHighQuality: boolean;
  hasSeenGuide: boolean;
  cameraDepthLayer: number | null; // which sphere the camera is currently inside
  dissolvedLayers: number[];        // layers that have been dissolved away

  // Presence mode
  mode: AppMode;
  presencePhase: PresencePhase;
  presenceAnswers: number[];        // layer-id hints from each answered question
  presenceQuestionIndex: number;    // 0-based index of current question
  presenceResonantLayer: number | null;

  // actions
  selectLayer: (id: number | null) => void;
  setHoveredLayer: (id: number | null) => void;
  setActiveFacet: (facet: FacetKey) => void;
  toggleGuide: () => void;
  toggleTextMode: () => void;
  toggleQuality: () => void;
  markGuideSeen: () => void;
  setCameraDepthLayer: (id: number | null) => void;
  dissolveLayer: (id: number) => void;
  resetDissolved: () => void;
  cameraResetPending: boolean;
  requestCameraReset: () => void;
  clearCameraReset: () => void;
  targetCameraPosition: [number, number, number] | null;
  requestCameraMoveTo: (position: [number, number, number]) => void;
  clearTargetCamera: () => void;
  dissolveManyLayers: (ids: number[]) => void;
  setDissolvedLayers: (ids: number[]) => void;

  // presence actions
  enterPresenceMode: () => void;
  exitPresenceMode: () => void;
  answerPresenceQuestion: (layerHint: number) => void;
  setPresencePhase: (phase: PresencePhase) => void;
  sitWithResonantLayer: () => void;
  dissolveFromPresence: () => void;
}
