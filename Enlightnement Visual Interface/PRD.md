# PRD: Consciousness Sphere Explorer

> Autonomous build target for Ralphy. Run with: `ralphy --prd PRD.md --claude`
>
> Project location: `./consciousness-sphere/`
> Stack: Vite + React + TypeScript + Three.js + Zustand + Framer Motion + GSAP + Tailwind CSS
> Architecture reference: `./docs/plans/2026-03-13-consciousness-sphere-architecture.md`
> Full spec: `./claude.md`

---

## Phase 0 — Scaffold & Configuration

- [x] Scaffold Vite React TypeScript project at `./consciousness-sphere/` using `npm create vite@latest consciousness-sphere -- --template react-ts`
- [x] Install all runtime dependencies: `three @react-three/fiber @react-three/drei @react-three/postprocessing zustand framer-motion gsap`
- [x] Install dev dependencies: `tailwindcss @tailwindcss/vite @types/three`
- [x] Configure Tailwind CSS in `vite.config.ts` using `@tailwindcss/vite` plugin
- [x] Create `src/styles/globals.css` with all CSS variables from the color palette (--bg-primary, --layer-1 through --layer-7, --center, --threshold-glow, etc.) and Google Fonts import for Cormorant Garamond + DM Sans
- [x] Create `src/types/index.ts` with Layer, LayerFacets, FacetKey, and ExplorerStore TypeScript interfaces as defined in the architecture doc
- [x] Update `index.html` to import globals.css and set meta viewport for mobile

---

## Phase 1 — Content Layer (layers.ts)

> This is the soul of the project. Write rich, warm, second-person, contemplative content. 3-5 paragraphs per facet. No jargon. No numerical scores.

- [x] Create `src/data/layers.ts` exporting a `layers: Layer[]` array with all 7 layers in order (id 7 = outermost to id 1 = innermost) with correct radii, colors, and level names
- [x] Write full facet content for Layer 7 — 3rd Dimension: Contraction & Fear (levels: Shame, Guilt, Apathy, Grief, Fear, Desire, Anger, Pride) — all 4 facets: experience, veil, dissolving, signs
- [x] Write full facet content for Layer 6 — 4th Dimension: Functional Self & Willpower (levels: Courage, Neutrality, Willingness, Acceptance) — all 4 facets
- [x] Write full facet content for Layer 5 — New Humanity Consciousness: Meaning & Wisdom (levels: Inner Light/Reason, Inner Wisdom, Inner Love) — all 4 facets
- [x] Write full facet content for Layer 4 — 5th Dimension: Unity & Bliss (levels: Oneness/Joy, Presence/Peace) — all 4 facets
- [x] Write full facet content for Layer 3 — I AM Presence: Beyond the Personal (levels: Non-Duality, Awareness) — all 4 facets
- [x] Write full facet content for Layer 2 — Enlightenment: The Great Void & Grace (levels: The Great Void, Divine Grace & Love) — all 4 facets
- [x] Write full facet content for Layer 1 — 12th Dimension: Supra-Causal Truth & Full Consciousness (levels: Supra-Causal Truth, Full Consciousness) — all 4 facets
- [x] Export a `centerData` object for the center point (name, description — not a layer)

---

## Phase 2 — State Store

- [x] Create `src/stores/useExplorerStore.ts` — Zustand store with: selectedLayer, hoveredLayer, activeFacet, isGuideOpen, isTextMode, isHighQuality, hasSeenGuide and all action functions. Persist hasSeenGuide to localStorage via zustand/middleware persist.

---

## Phase 3 — 3D Scene Foundation

- [x] Create `src/components/Scene.tsx` — React Three Fiber Canvas with PerspectiveCamera at [0, 2, 12], ambient light (0.3), point light at origin, OrbitControls (full 360°, zoom enabled, touch enabled), dark navy background (#0a0e1a), React.Suspense wrapper with loading fallback
- [x] Create `src/components/CenterGlow.tsx` — Sphere radius 0.3, warm white-gold color (#fff8e8), MeshStandardMaterial with emissive, gentle pulsing luminosity via useFrame sinusoidal animation
- [x] Create `src/components/SphereLayer.tsx` — Individual sphere using MeshPhysicalMaterial with transmission, roughness, thickness, ior. Props: layer data, selected/hovered state from store. Idle Y-rotation via useFrame at layer-specific speed. Breathing scale oscillation. onPointerEnter/Leave/Click handlers connecting to store.
- [x] Create `src/components/ConcentricSpheres.tsx` — Maps layers array to SphereLayer components + renders CenterGlow + ThresholdRing + ParticleField
- [x] Create `src/components/ThresholdRing.tsx` — Torus geometry at radius 6.5 (midpoint between layer 7 and 6), warm gold color (#d4a04a), subtle glow/emissive, slow rotation
- [x] Create `src/components/ParticleField.tsx` — BufferGeometry Points with count from store (300 high / 100 low), randomized positions between radii 1 and 7.5, slow drift animation via useFrame, white-cream color with low opacity

---

## Phase 4 — Sphere Interaction & Camera

- [x] Create `src/hooks/useSphereInteraction.ts` — shared hook returning hover and click handlers. On click: GSAP timeline that fades outer layers (opacity to 0.05, scale to 1.05), highlights selected (emissive pulse), dollies camera to layer radius + 2.5. On deselect: GSAP restores all layers, camera returns to [0, 2, 12].
- [x] Wire dissolve animations into SphereLayer: when selectedLayer is set and layer.id > selectedLayer, apply dissolved appearance. When layer.id === selectedLayer, apply highlight pulse.
- [x] Add hover dimming: when hoveredLayer is set, hovered sphere brightness 1.3x, all others 0.85x. Smooth transition via useFrame lerp.
- [x] Create `src/components/TransitionIndicator.tsx` — displays brief contextual message "This is the threshold between contraction and expansion." when selection crosses the Layer 7 / Layer 6 boundary. Auto-dismisses after 3 seconds. Framer Motion fade in/out.
- [x] Add keyboard support to Scene: R key resets camera to default, Escape deselects layer, Tab cycles through layers

---

## Phase 5 — UI Panels & Overlays

- [x] Create `src/components/FacetTabs.tsx` — 4 tab buttons: Experience | The Veil | Dissolving | Signs. Active tab highlighted. Keyboard arrow-left/right navigation. Connects to store.setActiveFacet.
- [x] Create `src/components/LevelList.tsx` — displays individual consciousness levels within a layer as styled chips/pills. Layout wraps naturally.
- [x] Create `src/components/LayerBreadcrumb.tsx` — shows "Layer X / 7" and layer name. Subtle depth indicator.
- [x] Create `src/components/InfoPanel.tsx` — Glassmorphism panel (rgba(10,14,26,0.8), backdrop-blur 20px, border rgba(255,255,255,0.08)). Contains LayerBreadcrumb, layer title (Cormorant Garamond), LevelList, FacetTabs, scrollable facet content area, X close button. Framer Motion slideInRight on desktop (>1024px), slideInUp on tablet/mobile. Reads selectedLayer from store, displays corresponding layer data and active facet content. aria-live="polite" on content area.
- [x] Create `src/components/NavigationGuide.tsx` — First-visit modal overlay. Title: "You're Not Climbing. You're Seeing Through." Intro paragraph. Desktop and mobile control instructions with emoji icons. Closing line. "Begin Exploring" button. Glassmorphism styling. Framer Motion fade in/out.
- [x] Create `src/components/HelpButton.tsx` — Fixed "?" button bottom-left corner. Opens NavigationGuide via store.toggleGuide.
- [x] Create `src/components/IntroOverlay.tsx` — Optional landing screen before entering the experience. Fade transition to reveal the 3D scene.

---

## Phase 6 — Accessibility & Polish

- [x] Create `src/components/TextModeAccordion.tsx` — Full accessible fallback: accordion UI listing all 7 layers with expandable sections for each of the 4 facets. Uses same data from layers.ts. No WebGL dependency. Tailwind styled. Keyboard navigable.
- [x] Create `src/components/AccessibilityToggle.tsx` — Fixed toggle button (corner icon). Switches store.isTextMode. When true, Canvas is hidden and TextModeAccordion is shown.
- [x] Create `src/components/QualityToggle.tsx` — Fixed toggle button. Switches store.isHighQuality. Updates particle count, bloom, material complexity.
- [x] Add aria-labels to all sphere elements in SphereLayer: aria-label="[Layer Name] — click to explore", role="button", tabIndex
- [x] Add prefers-reduced-motion support: create useReducedMotion hook, disable rotation/particles/breathing animations, use simple opacity fades instead of GSAP transforms
- [x] Verify WCAG AA contrast (4.5:1) for all text in InfoPanel against panel background
- [x] Add responsive CSS: InfoPanel right-panel on >1024px, bottom-drawer on 768-1024px, bottom-sheet with Framer Motion drag-to-dismiss on <768px
- [x] Add loading state: Suspense fallback component with animated loading indicator shown while Canvas initializes

---

## Phase 7 — Integration & Deploy

- [x] Wire everything together in `src/App.tsx`: Scene + InfoPanel + NavigationGuide + HelpButton + AccessibilityToggle + QualityToggle + TransitionIndicator + conditional TextModeAccordion
- [x] Add localStorage initialization: check hasSeenGuide on app load, show NavigationGuide on first visit
- [x] Test full interaction flow: hover → click → dissolve → panel → close → restore
- [x] Test keyboard navigation: Tab, Enter, Escape, Arrow keys, R reset
- [x] Test responsive layouts on desktop, tablet, mobile viewport sizes
- [x] Test text-only mode: all content accessible without WebGL
- [x] Test prefers-reduced-motion: animations disabled
- [x] Create `vercel.json` or `netlify.toml` with static build config pointing to `consciousness-sphere/dist`
- [x] Run `npm run build` in `consciousness-sphere/` and verify no TypeScript or build errors
- [x] Deploy to Vercel or Netlify
