# Prompt: Build the Consciousness Sphere Explorer

Use this as your initial prompt in Claude Code after placing `claude.md` in your project root.

---

## Prompt

Build the Consciousness Sphere Explorer web app as defined in claude.md. This is a 3D interactive visualization of consciousness as concentric translucent spheres that users dissolve inward through — not levels to climb, but veils to see through. It's based on the Hawkins Map of Consciousness but reframed: no numerical scores, no hierarchy of worth, just layers of identification you can recognize and see through.

### Phase 1: Foundation & Content
Scaffold the Vite + React project, install all dependencies (three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, zustand, framer-motion, gsap, tailwindcss), and set up the file structure from claude.md.

**Create `src/data/layers.js` first.** This is the most important file — it contains ALL the content. Write full, rich descriptions for all 7 layers × 4 facets. Each facet should be 3-5 paragraphs of warm, second-person, contemplative but grounded text. No jargon. Accessible to a complete beginner AND resonant for a longtime practitioner.

The 7 layers (outermost → innermost), each containing named consciousness levels from the original Hawkins chart:

1. **Layer 7 — 3rd Dimension: Contraction & Fear** (Shame, Guilt, Apathy, Grief, Fear, Desire, Anger, Pride) — the densest layer, survival-mode identification, where most human suffering lives
2. **Layer 6 — 4th Dimension: Functional Self & Willpower** (Courage, Neutrality, Willingness, Acceptance) — the FEAR→LOVE threshold. Where responsibility begins and victimhood releases.
3. **Layer 5 — New Humanity Consciousness: Meaning & Wisdom** (Inner Light/Reason, Inner Wisdom, Inner Love) — identification shifts from personal achievement to meaning, understanding, service
4. **Layer 4 — 5th Dimension: Unity & Bliss** (Oneness/Joy, Presence/Peace) — separation collapses, joy and peace arise as ground states, not achievements
5. **Layer 3 — I AM Presence: Beyond the Personal** (Non-Duality, Awareness) — the subject/object split dissolves, just experiencing
6. **Layer 2 — Enlightenment: The Great Void & Grace** (The Great Void, Divine Grace & Love) — language fails, the view of life is simply "Is"
7. **Layer 1 — 12th Dimension: Supra-Causal Truth & Full Consciousness** — prior to causation, nothing left obscuring
8. **Center — That Which Contains Everything** — not a layer, just what remains

Each layer has 4 facets:
- **"What You Experience Here"** (tab: "Experience") — phenomenological description using emotional states and view of life from the chart
- **"What Keeps This Layer Opaque"** (tab: "The Veil") — the identification pattern holding this layer in place
- **"How This Layer Dissolves"** (tab: "Dissolving") — practical methods mapped from the chart's "Key to Transcending" column, expanded with real-world practices
- **"Signs of Thinning"** (tab: "Signs") — perceptual shifts indicating transparency

### Phase 2: 3D Scene
Build the Three.js scene:
- 7 concentric translucent spheres + luminous center point, all sharing center (0,0,0)
- Radii: 7, 6, 5, 4, 3, 2, 1.2 (center glow: 0.3)
- Glass/transmission material (MeshPhysicalMaterial with transmission)
- Color palette from claude.md: deep crimson-black (outer) → warm amber → teal → gold → silver-blue → lavender → white-gold → radiant center
- FEAR ↔ LOVE threshold: subtle glowing ring between Layer 7 and Layer 6 (warm gold color)
- Idle: slow Y-rotation at different speeds per layer (parallax), gentle breathing scale, outer layers more turbulent, inner layers serene
- OrbitControls: full 360° + zoom (mouse and touch)
- Bloom postprocessing on inner layers
- 300 floating particles (dust motes / stars) between layers
- Deep dark navy gradient background (#0a0e1a)

### Phase 3: Interaction
- **Hover**: hovered layer brightens, others dim 10-15%
- **Click/Select**: outer layers dissolve (fade + optional wireframe + scale outward), selected highlights, camera dollies inward, info panel slides in
- **Info Panel**: glassmorphism, right side (desktop) / bottom sheet (mobile). Shows: layer name, individual levels, 4 facet tabs, scrollable content area.
- **Close**: X button, Escape key, or click empty space → all layers restore, camera returns
- **Double-click center or press R**: reset camera to default
- **FEAR/LOVE threshold note**: when crossing between Layer 7 and 6, show brief contextual text

### Phase 4: Navigation Guide
First-visit overlay (localStorage flag):
- Title: "You're Not Climbing. You're Seeing Through."
- Brief intro paragraph about the dissolution metaphor
- Desktop + mobile control instructions with emoji icons
- Closing line: "Start from the outside. See what you recognize. Then go deeper."
- "Begin Exploring" button to dismiss
- Persistent "?" button in bottom-left to reopen guide anytime

### Phase 5: Accessibility & Polish
- **Text-only mode toggle** (corner icon): replaces 3D with scrollable accordion of all layers × facets
- **Quality toggle** (corner): high (full effects) / low (no bloom, fewer particles, simpler materials)
- **Keyboard nav**: Tab through layers, Enter to select, Escape to close, Arrow keys for facets
- **Screen reader**: aria-labels on spheres, live-region for panel
- **`prefers-reduced-motion`**: disable rotation, particles, breathing — use simple fades
- **Responsive**: desktop (sphere 65% + panel 35%), tablet (bottom drawer 50%), mobile (bottom sheet 60%)
- **Loading state**: Suspense boundary with loading animation before canvas
- **Fonts**: Google Fonts — Cormorant Garamond (headings), DM Sans (body)
- **Contrast**: all text WCAG AA 4.5:1

Follow all specs in claude.md. Build phase by phase. Verify each phase works before proceeding to the next. The content in `layers.js` is the soul of this project — invest heavily in writing it well.
