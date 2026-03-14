import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Layer } from '../types';
import useExplorerStore from '../stores/useExplorerStore';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { layers } from '../data/layers';

// Sorted outermost → innermost
const SORTED_LAYERS = [...layers].sort((a, b) => b.radius - a.radius);

const ROTATION_SPEEDS: Record<number, number> = {
  1: 0.00008, 2: 0.00015, 3: 0.0002,
  4: 0.0004,  5: 0.0005,  6: 0.0006, 7: 0.0007,
};
const PHASE_OFFSETS: Record<number, number> = {
  1: 0.0, 2: 0.9, 3: 1.8, 4: 2.7, 5: 3.6, 6: 4.5, 7: 5.4,
};

// Emissive values — inner layers glow more when they become active
const EMISSIVE_INTENSITY: Record<number, number> = {
  1: 2.2, 2: 1.8, 3: 1.4, 4: 0.9, 5: 0.5, 6: 0.2, 7: 0.1,
};
const EMISSIVE_COLORS: Record<number, string> = {
  7: '#7a2a3e', 6: '#c48a20', 5: '#2a9070',
  4: '#e8b848', 3: '#9ab8d4', 2: '#d4c4e0', 1: '#fff5e8',
};

interface Props { layer: Layer }

type DissolveState = 'idle' | 'dissolving' | 'dissolved';

export default function SphereLayer({ layer }: Props) {
  const meshRef     = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const rotRef      = useRef({ y: 0 });
  const dissolveRef = useRef<DissolveState>('idle');
  const dissolveProgressRef = useRef(0); // 0=visible → 1=gone

  const dissolvedLayers  = useExplorerStore((s) => s.dissolvedLayers);
  const selectedLayer    = useExplorerStore((s) => s.selectedLayer);
  const hoveredLayer     = useExplorerStore((s) => s.hoveredLayer);
  const selectLayer      = useExplorerStore((s) => s.selectLayer);
  const setHoveredLayer  = useExplorerStore((s) => s.setHoveredLayer);
  const prefersReduced   = useReducedMotion();

  const isDissolved = dissolvedLayers.includes(layer.id);

  // Which is the active (outermost-undissolved) layer?
  const activeLayerId = SORTED_LAYERS.find(
    (l) => !dissolvedLayers.includes(l.id)
  )?.id ?? null;

  const isActive = layer.id === activeLayerId;
  // Ghost: next undissolved layer after active
  const activeIdx  = SORTED_LAYERS.findIndex((l) => l.id === activeLayerId);
  const ghostId    = SORTED_LAYERS[activeIdx + 1]?.id ?? null;
  const isGhost    = layer.id === ghostId;

  // Trigger dissolve animation when layer added to dissolvedLayers
  useEffect(() => {
    if (isDissolved && dissolveRef.current === 'idle') {
      dissolveRef.current = 'dissolving';
    }
    if (!isDissolved && dissolveRef.current !== 'idle') {
      dissolveRef.current = 'idle';
      dissolveProgressRef.current = 0;
    }
  }, [isDissolved]);

  const segments = layer.id >= 5 ? 64 : 48;
  const geometry = useMemo(
    () => new THREE.SphereGeometry(layer.radius, segments, segments),
    [layer.radius, segments]
  );

  const rotationSpeed = ROTATION_SPEEDS[layer.id] ?? 0.0004;
  const phaseOffset   = PHASE_OFFSETS[layer.id] ?? 0;

  useFrame(({ clock }, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    const t = clock.getElapsedTime();

    // ── Dissolution animation ──
    if (dissolveRef.current === 'dissolving') {
      dissolveProgressRef.current = Math.min(1, dissolveProgressRef.current + delta * 0.8);
      const p = dissolveProgressRef.current;
      const eased = p * p * (3 - 2 * p); // smoothstep

      // Scale outward like blown away by wind
      const scale = 1 + eased * 0.55;
      meshRef.current.scale.setScalar(scale);
      // Slight drift — "into the wind"
      meshRef.current.position.x = eased * (layer.id % 2 === 0 ? 0.8 : -0.8);
      meshRef.current.position.y = eased * 0.4;
      materialRef.current.opacity = (1 - eased) * getBaseOpacity();

      if (p >= 1) {
        dissolveRef.current = 'dissolved';
        meshRef.current.visible = false;
      }
      return;
    }
    if (dissolveRef.current === 'dissolved') return;

    // Ensure visible
    meshRef.current.visible = true;
    meshRef.current.position.set(0, 0, 0);
    meshRef.current.scale.setScalar(
      prefersReduced ? 1 : 1 + 0.006 * Math.sin(t * 0.8 + phaseOffset)
    );

    // Rotation
    if (!prefersReduced) {
      rotRef.current.y += rotationSpeed;
      meshRef.current.rotation.y = rotRef.current.y;
    }

    // Target opacity based on role
    let targetOpacity = getBaseOpacity();
    let targetEmissive = EMISSIVE_INTENSITY[layer.id] ?? 0.3;

    if (isActive) {
      targetOpacity  = 0.82;
      targetEmissive = (EMISSIVE_INTENSITY[layer.id] ?? 0.3) * (1 + 0.15 * Math.sin(t * 1.2));
      // Hover effect
      if (hoveredLayer === layer.id && selectedLayer === null) {
        targetOpacity = 0.88;
      }
    } else if (isGhost) {
      targetOpacity  = 0.18;
      targetEmissive = (EMISSIVE_INTENSITY[layer.id] ?? 0.3) * 0.6;
    } else {
      targetOpacity  = 0;
      targetEmissive = 0;
    }

    materialRef.current.opacity     += (targetOpacity  - materialRef.current.opacity)     * 0.07;
    materialRef.current.emissiveIntensity +=
      (targetEmissive - materialRef.current.emissiveIntensity) * 0.07;
  });

  function getBaseOpacity() {
    if (isActive) return 0.82;
    if (isGhost)  return 0.18;
    return 0;
  }

  // Hidden if inner (not active or ghost) — avoids rendering invisible geometry
  const visible = isActive || isGhost || dissolveRef.current === 'dissolving';

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      visible={visible}
      onPointerEnter={(e) => {
        if (!isActive) return;
        e.stopPropagation();
        setHoveredLayer(layer.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        setHoveredLayer(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        if (!isActive) return;
        e.stopPropagation();
        selectLayer(layer.id);
      }}
    >
      <meshPhysicalMaterial
        ref={materialRef}
        color={layer.hexColor}
        emissive={EMISSIVE_COLORS[layer.id] ?? layer.hexColor}
        emissiveIntensity={EMISSIVE_INTENSITY[layer.id] ?? 0.3}
        roughness={0.12}
        metalness={0.05}
        // Low transmission — more solid, less glass
        transmission={isActive ? 0.08 : 0}
        thickness={0.5}
        opacity={isActive ? 0.82 : isGhost ? 0.18 : 0}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        envMapIntensity={0.4}
      />
    </mesh>
  );
}
