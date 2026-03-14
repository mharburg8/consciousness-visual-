export type FacetKey = 'experience' | 'veil' | 'dissolving' | 'signs';

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
  facets: LayerFacets;
}

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
}
