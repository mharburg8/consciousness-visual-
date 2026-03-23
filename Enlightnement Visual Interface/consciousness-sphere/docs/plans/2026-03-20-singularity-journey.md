# Singularity Journey Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a 5-phase scroll-driven "singularity journey" when the user zooms into the supernova center — dissolution flash → pure black void → slow scroll toward white dot → white arrival screen with "I am that I am."

**Architecture:** Extend Zustand with `journeyPhase` + `journeyProgress`. CameraTracker in Scene.tsx drives phase transitions via camera distance and wheel event interception. VoidCenter.tsx handles void visuals + Html label. App.tsx hosts the two HTML overlays (dissolution flash, arrival screen). OrbitControls rotation stays enabled throughout; only zoom is intercepted during the journey phase.

**Tech Stack:** React, Three.js, @react-three/fiber, @react-three/drei (`Html`), Zustand, Framer Motion (for overlay transitions)

---

### Task 1: Add journey state to types + Zustand store

**Files:**
- Modify: `src/types.ts`
- Modify: `src/stores/useExplorerStore.ts`

**Step 1: Add JourneyPhase type and store fields to `src/types.ts`**

Add below the existing `ExplorerStore` interface:

```typescript
export type JourneyPhase = 'none' | 'approach' | 'dissolution' | 'void' | 'journey' | 'arrival';
```

Then add to the `ExplorerStore` interface:

```typescript
  journeyPhase: JourneyPhase;
  journeyProgress: number;        // 0–1, used during 'journey' phase
  suppressBlackHole: boolean;     // true during dissolution/void/journey/arrival
  setJourneyPhase: (phase: JourneyPhase) => void;
  setJourneyProgress: (p: number) => void;
  setSuppressBlackHole: (v: boolean) => void;
```

**Step 2: Add state + actions to `src/stores/useExplorerStore.ts`**

Add inside the `create` callback alongside existing state:

```typescript
      journeyPhase: 'none' as JourneyPhase,
      journeyProgress: 0,
      suppressBlackHole: false,
      setJourneyPhase: (phase) => set({ journeyPhase: phase }),
      setJourneyProgress: (p) => set({ journeyProgress: p }),
      setSuppressBlackHole: (v) => set({ suppressBlackHole: v }),
```

Also add `JourneyPhase` to the import at the top:
```typescript
import type { FacetKey, ExplorerStore, JourneyPhase } from '../types';
```

**Step 3: Verify no TypeScript errors**

Run: `cd "consciousness-sphere" && npx tsc --noEmit`
Expected: no errors

**Step 4: Commit**

```bash
git add src/types.ts src/stores/useExplorerStore.ts
git commit -m "feat: add journeyPhase/journeyProgress to Zustand store"
```

---

### Task 2: Phase transition logic in CameraTracker (Scene.tsx)

**Files:**
- Modify: `src/components/Scene.tsx`

This task adds phase transitions and scroll interception to `CameraTracker`.

**Step 1: Add store subscriptions to CameraTracker**

In the `CameraTracker` function, add these subscriptions alongside the existing ones:

```typescript
  const journeyPhase        = useExplorerStore((s) => s.journeyPhase);
  const setJourneyPhase     = useExplorerStore((s) => s.setJourneyPhase);
  const setJourneyProgress  = useExplorerStore((s) => s.setJourneyProgress);
  const setSuppressBlackHole = useExplorerStore((s) => s.setSuppressBlackHole);
```

Also add refs for journey progress and dissolution timer:

```typescript
  const journeyProgressRef   = useRef(0);
  const dissolutionTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const journeyPhaseRef      = useRef<string>('none'); // mirror for use in event handler
```

**Step 2: Add wheel event listener for journey scroll**

Add a new `useEffect` BELOW the existing wheel-cancel listener:

```typescript
  useEffect(() => {
    const handleJourneyScroll = (e: WheelEvent) => {
      if (journeyPhaseRef.current !== 'journey') return;
      e.preventDefault();
      e.stopPropagation();
      // Increment progress; backward scroll allowed (but clamp at 0)
      journeyProgressRef.current = Math.min(1, Math.max(0,
        journeyProgressRef.current + e.deltaY * 0.0003
      ));
      useExplorerStore.getState().setJourneyProgress(journeyProgressRef.current);
      if (journeyProgressRef.current >= 1.0) {
        useExplorerStore.getState().setJourneyPhase('arrival');
        journeyPhaseRef.current = 'arrival';
      }
    };
    window.addEventListener('wheel', handleJourneyScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleJourneyScroll);
  }, []);
```

**Step 3: Keep journeyPhaseRef in sync**

Add a `useEffect` to mirror the Zustand value into the ref (needed because the wheel handler can't read Zustand reactively):

```typescript
  useEffect(() => {
    journeyPhaseRef.current = journeyPhase;
  }, [journeyPhase]);
```

**Step 4: Add phase transitions inside useFrame**

Inside `useFrame`, AFTER the depth tracking block and BEFORE the graduated zoom block, add:

```typescript
    // ── Singularity journey phase transitions ─────────────────────────────
    const inVoid = dissolvedLayers.length >= sortedLayers.length - 1;

    if (inVoid && journeyPhase === 'none') {
      setJourneyPhase('approach');
    }
    if (!inVoid && journeyPhase !== 'none') {
      // Layers were restored (Return to Beginning) — reset everything
      setJourneyPhase('none');
      setJourneyProgress(0);
      journeyProgressRef.current = 0;
      setSuppressBlackHole(false);
      if (dissolutionTimerRef.current) clearTimeout(dissolutionTimerRef.current);
    }

    // Phase 2 trigger: camera crosses event horizon (dist < 1.2) during approach
    if ((journeyPhase === 'approach' || journeyPhase === 'none') && inVoid && dist < 1.2) {
      setJourneyPhase('dissolution');
      setSuppressBlackHole(true);
      // After 0.3s flash completes, enter void phase
      dissolutionTimerRef.current = setTimeout(() => {
        useExplorerStore.getState().setJourneyPhase('void');
        journeyPhaseRef.current = 'void';
      }, 300);
    }

    // Phase 3 → 4: first scroll after void settles (handled in wheel listener above, but
    // also allow forward camera movement to start journey)
    if (journeyPhase === 'void' && dist < 0.9) {
      setJourneyPhase('journey');
      journeyPhaseRef.current = 'journey';
    }

    // Phase 4: move camera along Z toward origin using cubic ease-in curve
    if (journeyPhase === 'journey' && controlsRef.current) {
      const p = journeyProgressRef.current;
      // Cubic ease-in: early progress covers little distance, late progress rushes in
      const easedDist = 9.0 * Math.pow(1 - p, 3);
      // Keep camera on current XY direction, only compress the Z distance
      const camDir = camera.position.clone().normalize();
      camera.position.copy(camDir.multiplyScalar(Math.max(0.04, easedDist)));
      controlsRef.current.update();
    }
```

**Step 5: Update the graduated zoom block to disable during journey**

Replace the existing graduated zoom block:

```typescript
    // Graduated zoom inside the void — suppress during journey (scroll drives camera directly)
    if (controlsRef.current) {
      const inVoidNow = dissolvedLayers.length >= sortedLayers.length - 1;
      const isJourneying = journeyPhase === 'journey' || journeyPhase === 'arrival';
      if (isJourneying) {
        // Disable OrbitControls zoom during journey — wheel handler drives position directly
        controlsRef.current.enableZoom = false;
      } else if (inVoidNow && dist < 2.5) {
        controlsRef.current.enableZoom = true;
        controlsRef.current.zoomSpeed   = 0.07;
        controlsRef.current.minDistance = 0.04;
      } else if (inVoidNow && dist < 8) {
        controlsRef.current.enableZoom = true;
        controlsRef.current.zoomSpeed   = 0.20;
        controlsRef.current.minDistance = 0.04;
      } else {
        controlsRef.current.enableZoom = true;
        controlsRef.current.zoomSpeed   = 0.7;
        controlsRef.current.minDistance = 0.5;
      }
    }
```

**Step 6: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 7: Commit**

```bash
git add src/components/Scene.tsx
git commit -m "feat: singularity journey phase transitions + scroll interception in CameraTracker"
```

---

### Task 3: Dissolution flash + vignette overlays in App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add store subscriptions in App.tsx**

In the `App` function, add:

```typescript
  const journeyPhase    = useExplorerStore((s) => s.journeyPhase);
```

**Step 2: Add overlay divs inside the 3D scene block**

Inside the `<>` fragment that holds `<Scene />`, `<ChartPanel />` etc., add after `<BottomBar>`:

```tsx
          {/* ── Dissolution flash (Phase 2) ─────────────────────────────── */}
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: '#ffffff',
              opacity: journeyPhase === 'dissolution' ? 1 : 0,
              transition: journeyPhase === 'dissolution'
                ? 'opacity 0s'               // snap to white instantly
                : 'opacity 0.5s ease-out',   // fade out
              pointerEvents: 'none',
            }}
          />

          {/* ── Void vignette (Phase 3+) ─────────────────────────────────── */}
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)',
              opacity: (journeyPhase === 'void' || journeyPhase === 'journey') ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              pointerEvents: 'none',
            }}
          />

          {/* ── Arrival screen (Phase 5) ──────────────────────────────────── */}
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 95,
              background: '#ffffff',
              opacity: journeyPhase === 'arrival' ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
              pointerEvents: journeyPhase === 'arrival' ? 'all' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 'clamp(1.4rem, 4vw, 2.8rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.85)',
                opacity: journeyPhase === 'arrival' ? 1 : 0,
                transition: 'opacity 0.6s ease-in 0.8s',  // 0.8s delay after bg fades in
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              I am that I am
            </p>
          </div>
```

**Step 3: Hide bottom UI during journey phases**

Wrap `<DepthIndicator />`, `<BottomBar />`, `<ChartPanel />`, and `<TransitionIndicator />` to hide during `dissolution`, `void`, `journey`, `arrival`:

Add this variable in App:
```typescript
  const hideUI = ['dissolution', 'void', 'journey', 'arrival'].includes(journeyPhase);
```

Then wrap each UI component:
```tsx
          {!hideUI && <TransitionIndicator />}
          {!hideUI && <ChartPanel />}
          {!hideUI && <DepthIndicator />}
          {!hideUI && <BottomBar getCameraRef={() => null} />}
```

**Step 4: Verify visually in dev server**

Run: `npm run dev`
- With all layers dissolved + camera < 1.2 range, dissolution flash should appear briefly
- Void vignette should darken edges during void/journey phases
- Arrival screen should be pure white with text

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: dissolution flash, vignette, and arrival overlays in App.tsx"
```

---

### Task 4: VoidCenter.tsx — connect to journeyPhase + add Html label

**Files:**
- Modify: `src/components/VoidCenter.tsx`

**Step 1: Add Html import from drei**

```typescript
import { Html } from '@react-three/drei';
```

**Step 2: Add journeyPhase subscription**

In the component:

```typescript
  const journeyPhase    = useExplorerStore((s) => s.journeyPhase);
  const journeyProgress = useExplorerStore((s) => s.journeyProgress);
```

**Step 3: Update `isActive` to depend on journeyPhase**

Replace the existing `isActive` line:

```typescript
  // Was: const isActive = dissolvedLayers.length >= TOTAL - 1;
  // Now: void only shows during/after dissolution
  const isActive = ['dissolution', 'void', 'journey', 'arrival'].includes(journeyPhase);
```

**Step 4: Add label visibility state to useFrame**

Inside `useFrame`, after the dot opacity calc, compute label opacity:

```typescript
    // Label: visible in 'void', fades out in 'journey' past ~15% progress
    const labelOp = journeyPhase === 'void'
      ? gf
      : journeyPhase === 'journey'
        ? THREE.MathUtils.clamp(1 - (journeyProgress - 0.0) / 0.15, 0, 1) * gf
        : 0;
    // Store in a ref for the JSX to read
    labelOpacityRef.current = labelOp;
```

Add the ref before `useFrame`:
```typescript
  const labelOpacityRef = useRef(0);
```

Note: Because `<Html>` is declarative JSX, we'll drive it via React state updated from useFrame. Add:
```typescript
  const [labelVisible, setLabelVisible] = useState(false);
```

And in useFrame:
```typescript
    const shouldShowLabel = labelOp > 0.01;
    if (shouldShowLabel !== labelVisible) setLabelVisible(shouldShowLabel);
```

**Step 5: Add Html label to the JSX return**

Inside the `<group>`, after the dot mesh:

```tsx
      {/* Pure Consciousness label — only in void phase */}
      {labelVisible && (
        <Html
          position={[0.22, 0.10, 0]}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            opacity: labelOpacityRef.current,
            transition: 'opacity 0.6s',
          }}
          zIndexRange={[10, 10]}
          occlude={false}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.72rem',
              fontWeight: 300,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
            }}>
              ← Pure Consciousness
            </span>
          </div>
        </Html>
      )}
```

**Step 6: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

**Step 7: Commit**

```bash
git add src/components/VoidCenter.tsx
git commit -m "feat: VoidCenter connects to journeyPhase, adds Html label"
```

---

### Task 5: Suppress BlackHole during dissolution/void/journey/arrival

**Files:**
- Modify: `src/components/BlackHole.tsx`

**Step 1: Add suppressBlackHole subscription**

In BlackHole.tsx, add:

```typescript
  const suppressBlackHole = useExplorerStore((s) => s.suppressBlackHole);
```

**Step 2: Change isActive to respect suppress flag**

Replace the existing `isActive` line:

```typescript
  // Was: const isActive = dissolvedLayers.length >= TOTAL_LAYERS - 1;
  const isActive = dissolvedLayers.length >= TOTAL_LAYERS - 1 && !suppressBlackHole;
```

The existing `fadeRef` lerp in `useFrame` already handles smooth fade-out when `isActive` goes false — no other changes needed.

**Step 3: Verify the black hole fades smoothly into the dissolution flash**

The existing fade lerp: `fadeRef.current += ((isActive ? 1 : 0) - fadeRef.current) * Math.min(1, delta * 0.7)` — at 60fps, this fades from 1→0 in ~0.5s, overlapping with the 0.3s white flash. Fine.

**Step 4: Commit**

```bash
git add src/components/BlackHole.tsx
git commit -m "feat: suppress black hole during singularity journey phases"
```

---

### Task 6: Reset journey on "Return to Beginning"

**Files:**
- Modify: `src/components/BottomBar.tsx`

**Step 1: Add journey reset to the reset button handler**

In BottomBar, add store subscriptions:

```typescript
  const setJourneyPhase     = useExplorerStore((s) => s.setJourneyPhase);
  const setJourneyProgress  = useExplorerStore((s) => s.setJourneyProgress);
  const setSuppressBlackHole = useExplorerStore((s) => s.setSuppressBlackHole);
```

**Step 2: Update the reset button onClick**

Find the `resetDissolved` button onClick and add the journey resets:

```typescript
              onClick={() => {
                resetDissolved();
                selectLayer(null);
                requestCameraReset();
                setJourneyPhase('none');
                setJourneyProgress(0);
                setSuppressBlackHole(false);
              }}
```

**Step 3: Commit**

```bash
git add src/components/BottomBar.tsx
git commit -m "feat: reset journey state on Return to Beginning"
```

---

### Task 7: End-to-end smoke test

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Walk through the journey**

1. Dissolve all 7 layers using "Dissolve this Layer" button
2. Black hole appears — confirm particles visible
3. Zoom in until camera dist < 1.2 (deeply into the center) — white flash should appear
4. After flash: screen goes pure black, white dot visible at center, vignette darkens edges
5. "← Pure Consciousness" label should appear near the dot
6. Scroll forward — camera moves slowly toward dot, label fades at ~15% progress
7. Continue scrolling — dot grows to fill screen, camera rushes in
8. At 100% progress: white screen appears, "I am that I am" text fades in
9. Click "Return to Beginning" (if accessible) or reload to verify reset

**Step 3: Check mobile (pinch gesture)**

On mobile or with browser devtools mobile mode, confirm pinch zoom doesn't accidentally trigger journey phase.

**Step 4: Final TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete singularity journey — 5-phase scroll-driven void experience"
```
