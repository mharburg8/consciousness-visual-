# Consciousness Sphere Explorer — Architecture Document
_Date: 2026-03-13_

---

## 1. Project Overview

A 3D interactive web app visualizing consciousness as **7 concentric translucent spheres** the user dissolves inward through. Built with Vite + React + TypeScript + Three.js. The philosophy: no scores, no hierarchy of worth — only layers of identification seen through. The center is what was always here.

---

## 2. Tech Stack

| Concern | Tool |
|---|---|
| Framework | Vite + React 18 + TypeScript |
| 3D Engine | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Post-processing | `@react-three/postprocessing` (Bloom) |
| State | Zustand |
| UI Animation | Framer Motion |
| 3D Animation | GSAP |
| Styling | Tailwind CSS + custom CSS (glassmorphism, glow) |
| Fonts | Google Fonts — Cormorant Garamond + DM Sans |
| Deployment | Static site — Vercel or Netlify |

---

## 3. Project Structure

```
consciousness-sphere/
├── src/
│   ├── components/
│   │   ├── Scene.tsx                # Canvas, camera, lights, OrbitControls
│   │   ├── ConcentricSpheres.tsx    # Maps layer data → renders all spheres
│   │   ├── SphereLayer.tsx          # Individual sphere: material, hover, click
│   │   ├── CenterGlow.tsx           # Luminous center point (Pure Awareness)
│   │   ├── ThresholdRing.tsx        # Glowing ring between Layer 7 & 6 (FEAR/LOVE)
│   │   ├── ParticleField.tsx        # 300 ambient floating particles
│   │   ├── InfoPanel.tsx            # Right panel / bottom sheet
│   │   ├── FacetTabs.tsx            # Experience | The Veil | Dissolving | Signs
│   │   ├── LevelList.tsx            # Expandable levels within a layer
│   │   ├── NavigationGuide.tsx      # First-visit overlay
│   │   ├── HelpButton.tsx           # "?" corner button to reopen guide
│   │   ├── LayerBreadcrumb.tsx      # Layer name + depth indicator
│   │   ├── AccessibilityToggle.tsx  # Text-only mode toggle
│   │   ├── QualityToggle.tsx        # High / low performance toggle
│   │   ├── IntroOverlay.tsx         # Landing screen
│   │   ├── TransitionIndicator.tsx  # FEAR ↔ LOVE threshold note
│   │   └── TextModeAccordion.tsx    # No-WebGL accessible fallback
│   ├── data/
│   │   └── layers.ts                # ALL content — single source of truth
│   ├── stores/
│   │   └── useExplorerStore.ts      # Zustand: all UI + selection state
│   ├── hooks/
│   │   └── useSphereInteraction.ts  # Hover / click / dissolve / camera logic
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript types
│   ├── styles/
│   │   └── globals.css              # CSS variables, glow, glassmorphism, fonts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. TypeScript Data Model

```typescript
// src/types/index.ts

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
  opacity: number;      // 0.08 (outer) → 0.03 (inner)
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
  // actions
  selectLayer: (id: number | null) => void;
  setHoveredLayer: (id: number | null) => void;
  setActiveFacet: (facet: FacetKey) => void;
  toggleGuide: () => void;
  toggleTextMode: () => void;
  toggleQuality: () => void;
  markGuideSeen: () => void;
}
```

---

## 5. State Architecture (Zustand)

```
useExplorerStore
├── selectedLayer: number | null     → drives sphere dissolve + panel open
├── hoveredLayer: number | null      → drives hover brightness
├── activeFacet: FacetKey            → drives InfoPanel tab
├── isGuideOpen: boolean             → NavigationGuide visibility
├── isTextMode: boolean              → replaces Canvas with TextModeAccordion
├── isHighQuality: boolean           → bloom, 300 particles vs 100, material complexity
└── hasSeenGuide: boolean            → persisted to localStorage
```

All sphere visual state (dissolve animation, brightness) derives from `selectedLayer` and `hoveredLayer`. No separate animation state in store — GSAP/useFrame react to store changes.

---

## 6. 3D Scene Architecture

```
<Canvas>                                     ← @react-three/fiber
  <PerspectiveCamera position=[0, 2, 12] />
  <ambientLight intensity={0.3} />
  <pointLight position=[0,0,0] />            ← illuminates from center outward
  <OrbitControls />
  <EffectComposer>                           ← @react-three/postprocessing
    <Bloom luminanceThreshold={0.6} />       ← inner layers only (conditional)
  </EffectComposer>

  <ConcentricSpheres>
    {layers.map(layer => (
      <SphereLayer key={layer.id} layer={layer} />
    ))}
    <ThresholdRing />                        ← between r=7 and r=6
    <CenterGlow />
    <ParticleField count={isHighQuality ? 300 : 100} />
  </ConcentricSpheres>
```

### SphereLayer Rendering Logic

```
SphereLayer(layer)
  useFrame → idle Y-rotation (speed ∝ 1/layer.id) + breathing scale
  useSphereInteraction → hover, click handlers

  material = MeshPhysicalMaterial {
    transmission: 0.85 + (layer.id * 0.02),   // more transmission = more inner
    roughness: 0.05,
    thickness: 0.5,
    ior: 1.4,
    color: layer.hexColor,
    opacity: layer.opacity,
    transparent: true,
    side: THREE.DoubleSide,
  }

  // dissolve logic: if selectedLayer !== null && layer.id > selectedLayer
  //   → GSAP fade opacity + scale outward
  // if layer.id === selectedLayer → brightness pulse
  // if layer.id === hoveredLayer → subtle brighten, others dim
```

---

## 7. Interaction Flow

```
User hovers sphere
  → onPointerEnter → store.setHoveredLayer(id)
  → useFrame: target brightness for hovered=1.3, others=0.85

User clicks sphere
  → onClick → store.selectLayer(id)
  → useSphereInteraction:
      GSAP timeline:
        1. Outer layers (id > selected): opacity→0.05, scale→1.05, wireframe
        2. Selected layer: emissive pulse
        3. Camera: gsap.to(camera.position, { z: layer.radius + 2.5 })
      → InfoPanel: Framer Motion slideInRight (desktop) / slideInUp (mobile)

User closes panel (X / Escape / empty click)
  → store.selectLayer(null)
  → GSAP: all layers restore to idle state
  → Camera: return to default position
  → InfoPanel: slide out

User crosses Layer 7 ↔ Layer 6 boundary
  → TransitionIndicator shows: "This is the threshold between contraction and expansion."
  → Auto-dismisses after 3 seconds
```

---

## 8. Sphere Visual Specifications

| Layer | Name | Radius | Hex Color | Opacity |
|---|---|---|---|---|
| 7 (outer) | 3rd Dimension | 7.0 | `#4a1a2a` | 0.55 |
| 6 | 4th Dimension | 6.0 | `#8b6914` | 0.45 |
| 5 | New Humanity | 5.0 | `#1a5c4a` | 0.38 |
| 4 | 5th Dimension | 4.0 | `#b8943c` | 0.30 |
| 3 | I AM Presence | 3.0 | `#7a8fa8` | 0.22 |
| 2 | Enlightenment | 2.0 | `#b8a8c8` | 0.14 |
| 1 | 12th Dimension | 1.2 | `#e8dcc8` | 0.08 |
| Center | Pure Awareness | 0.3 | `#fff8e8` | glow |

**Idle rotation speeds** (Y-axis rad/frame): `[0.0008, 0.0007, 0.0006, 0.0005, 0.0003, 0.0002, 0.0001]` (outer→inner)

**Breathing amplitude**: `0.008` scale oscillation, offset phases per layer

---

## 9. Info Panel Architecture

```
InfoPanel
├── Header
│   ├── BackButton (← or X)
│   └── LayerBreadcrumb ("Layer 5 / 7")
├── LayerTitle (Cormorant Garamond, large)
├── LevelList (individual levels as pills/chips)
├── FacetTabs (Experience | The Veil | Dissolving | Signs)
└── FacetContent (scrollable, DM Sans body text)
```

**Responsive behavior:**
- `> 1024px`: fixed right panel, 380px wide, full viewport height
- `768–1024px`: bottom drawer, 50vh, slides up
- `< 768px`: bottom sheet, 60vh, swipe-to-dismiss via Framer Motion drag

---

## 10. Accessibility Architecture

| Feature | Implementation |
|---|---|
| Text-only mode | Toggle replaces `<Canvas>` with `<TextModeAccordion>` — same content, no WebGL |
| Keyboard nav | Tab through spheres via invisible focusable elements, Enter to select, Escape to close, ←→ for facets |
| Screen reader | `aria-label` on each sphere button, `aria-live="polite"` on panel content |
| Reduced motion | `useReducedMotion()` hook — disables rotation, particles, breathing; uses simple fades |
| Contrast | All text on panel background meets WCAG AA (4.5:1). Panel bg: `rgba(10,14,26,0.8)` + `blur(20px)` |

---

## 11. Performance Strategy

| Concern | Approach |
|---|---|
| Geometry reuse | `useMemo` for `SphereGeometry` per radius |
| Material reuse | `useMemo` for `MeshPhysicalMaterial` per layer |
| Particles | `Points` + `BufferGeometry` — single draw call |
| Bloom | `isHighQuality` guard — off in low mode |
| Particle count | 300 (high) / 100 (low) |
| Re-renders | `React.memo` on all 3D components; store selectors with shallow equality |
| Target FPS | 60fps modern desktop, 30fps older mobile |

---

## 12. Build Phases

| Phase | Tasks | Parallelizable? |
|---|---|---|
| 0 — Scaffold | Vite + TS project, install deps, config files | Partially |
| 1 — Data | `layers.ts` full content (7 × 4 facets) | ✅ Independent |
| 2 — Types + Store | `types/index.ts`, `useExplorerStore.ts` | ✅ Independent |
| 3 — 3D Scene | Spheres, center, particles, threshold ring | Needs Phase 0+2 |
| 4 — Interaction | `useSphereInteraction`, GSAP transitions, camera | Needs Phase 3 |
| 5 — UI Panels | InfoPanel, FacetTabs, NavigationGuide, overlays | Needs Phase 2 |
| 6 — Polish | Accessibility, responsive, text-mode, quality toggle | Needs Phase 4+5 |
| 7 — Deploy | Vercel/Netlify config, build verification | Needs Phase 6 |

**Key insight**: Phases 1 and 2 can run in parallel with Phase 0's scaffold. Phase 5 (UI) can begin as soon as the store exists, independent of the 3D scene.

---

## 13. Key Technical Decisions & Rationale

| Decision | Chosen | Why |
|---|---|---|
| TypeScript | Yes | 7 layers × 4 facets data structure benefits enormously from types; Three.js interop is complex enough to warrant it |
| GSAP for 3D transitions | Yes | More control than `useSpring` for multi-step dissolve sequences; timeline API fits sphere-by-sphere choreography |
| Framer Motion for UI | Yes | Best-in-class for React panel slide-in/out, drag-to-dismiss mobile sheets |
| MeshPhysicalMaterial | Primary | True glass/transmission effect; with MeshStandardMaterial fallback for low quality |
| Zustand (not Context) | Yes | Avoids full re-render tree on every hover; fine-grained subscriptions keep 3D scene performant |
| Subfolder structure | `consciousness-sphere/` inside repo | Keeps spec files at repo root; clean separation |
