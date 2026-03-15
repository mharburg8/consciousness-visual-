import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import ConcentricSpheres from './ConcentricSpheres';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';

const LAYER_IDS = layers.map((l) => l.id);
// Camera starts far back so you see the entire outer sphere
export const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 3, 32];

// Sorted layer radii — used for depth detection (outermost first)
const DEPTH_THRESHOLDS = [...layers]
  .sort((a, b) => b.radius - a.radius)
  .map((l) => ({ id: l.id, radius: l.radius }));

function SceneLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#c9a87c" wireframe />
    </mesh>
  );
}

interface CameraTrackerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

/** Tracks camera depth, triggers dissolution, and handles camera-reset animation */
function CameraTracker({ controlsRef }: CameraTrackerProps) {
  const { camera } = useThree();
  const setCameraDepthLayer  = useExplorerStore((s) => s.setCameraDepthLayer);
  const dissolveLayer        = useExplorerStore((s) => s.dissolveLayer);
  const dissolvedLayers      = useExplorerStore((s) => s.dissolvedLayers);
  const cameraResetPending   = useExplorerStore((s) => s.cameraResetPending);
  const clearCameraReset     = useExplorerStore((s) => s.clearCameraReset);
  const targetCameraPosition = useExplorerStore((s) => s.targetCameraPosition);
  const clearTargetCamera    = useExplorerStore((s) => s.clearTargetCamera);
  const prevLayerRef = useRef<number | null>(null);

  // Sorted layers for active detection
  const sortedLayers = [...layers].sort((a, b) => b.radius - a.radius);

  useFrame(() => {
    // ── Camera reset: teleport instantly so OrbitControls can't fight it ──
    if (cameraResetPending) {
      camera.position.set(...DEFAULT_CAMERA_POSITION);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      clearCameraReset();
      return;
    }

    // ── Jump-to-layer camera move ─────────────────────────────────────────
    if (targetCameraPosition) {
      camera.position.set(...targetCameraPosition);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      clearTargetCamera();
      return;
    }

    // ── Depth tracking ───────────────────────────────────────────────────
    const dist = camera.position.length();
    let current: number | null = null;

    for (const { id, radius } of DEPTH_THRESHOLDS) {
      if (dist < radius) current = id;
    }

    if (current !== prevLayerRef.current) {
      prevLayerRef.current = current;
      setCameraDepthLayer(current);
    }

    // Auto-dissolve: when camera enters a sphere to within 55% of its radius.
    // Never dissolve the last remaining layer — the user must press "Return to Beginning".
    const undissolved = sortedLayers.filter((l) => !dissolvedLayers.includes(l.id));
    const activeLayer = undissolved[0] ?? null;
    if (activeLayer && undissolved.length > 1 && dist < activeLayer.radius * 0.55) {
      dissolveLayer(activeLayer.id);
    }
  });

  return null;
}

interface KeyboardControlsProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function KeyboardControls({ controlsRef }: KeyboardControlsProps) {
  const { camera } = useThree();
  const selectedLayer = useExplorerStore((s) => s.selectedLayer);
  const selectLayer   = useExplorerStore((s) => s.selectLayer);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'r' || e.key === 'R') {
        camera.position.set(...DEFAULT_CAMERA_POSITION);
        camera.lookAt(0, 0, 0);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      } else if (e.key === 'Escape') {
        selectLayer(null);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = selectedLayer !== null ? LAYER_IDS.indexOf(selectedLayer) : -1;
        const nextIndex = (currentIndex + 1) % LAYER_IDS.length;
        selectLayer(LAYER_IDS[nextIndex]);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera, controlsRef, selectedLayer, selectLayer]);

  return null;
}

function Lighting() {
  return (
    <>
      {/* Warm radiant center — primary source, illuminates outward */}
      <pointLight position={[0, 0, 0]} intensity={6} color="#fff3d0" distance={30} decay={1.2} />
      {/* Soft ambient — just enough to read the outer layers */}
      <ambientLight intensity={0.06} color="#0d1030" />
      {/* Chromatic accent lights tuned to layer palette */}
      <pointLight position={[14, 6, 10]}  intensity={0.8} color="#8b2a3a" distance={40} decay={2} />
      <pointLight position={[-14, -6, -10]} intensity={0.6} color="#1a5c4a" distance={40} decay={2} />
      <pointLight position={[0, -14, 12]} intensity={0.5} color="#8b6914" distance={36} decay={2} />
      <pointLight position={[0,  14, -10]} intensity={0.4} color="#7a8fa8" distance={32} decay={2} />
    </>
  );
}

export default function Scene() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const isHighQuality = useExplorerStore((s) => s.isHighQuality);

  return (
    <div style={{ width: '100%', height: '100%', background: '#03050c' }}>
      <Suspense
        fallback={
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#03050c', color: '#c9a87c',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '1.2rem', letterSpacing: '0.25em', fontWeight: 300,
          }}>
            entering the field…
          </div>
        }
      >
        <Canvas
          gl={{
            antialias: true,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          style={{ background: '#03050c' }}
          dpr={[1, 2]}
        >
          <PerspectiveCamera
            makeDefault
            position={DEFAULT_CAMERA_POSITION}
            fov={52}
            near={0.05}
            far={300}
          />

          <Lighting />

          {/* Deep cosmic starfield */}
          <Stars
            radius={120}
            depth={80}
            count={isHighQuality ? 5000 : 2000}
            factor={3.5}
            saturation={0.2}
            fade
            speed={0.2}
          />

          {/* Environment gives the glass transmission something to refract */}
          <Environment preset="night" />

          <OrbitControls
            ref={controlsRef}
            enableZoom
            enablePan={false}
            enableRotate
            minDistance={0.5}   // can go all the way to center
            maxDistance={60}
            autoRotate
            autoRotateSpeed={0.1}
            enableDamping
            dampingFactor={0.04}
            zoomSpeed={0.7}     // slower zoom = more contemplative journey
          />

          <CameraTracker controlsRef={controlsRef} />
          <KeyboardControls controlsRef={controlsRef} />

          <Suspense fallback={<SceneLoader />}>
            <ConcentricSpheres />
          </Suspense>

          <EffectComposer>
            <Bloom
              intensity={isHighQuality ? 1.4 : 0.7}
              luminanceThreshold={0.38}
              luminanceSmoothing={0.85}
              blendFunction={BlendFunction.ADD}
              mipmapBlur
            />
            <Vignette
              offset={0.25}
              darkness={0.75}
              blendFunction={BlendFunction.NORMAL}
            />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
