import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// The FEAR ↔ LOVE threshold sits between Layer 7 (r=22) and Layer 6 (r=17)
const THRESHOLD_RADIUS = 19.5;
const THRESHOLD_COLOR = '#d4a04a';

export default function ThresholdRing() {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Thin torus in the XZ plane — a subtle halo between the two outermost layers
  const geometry = useMemo(
    () => new THREE.TorusGeometry(THRESHOLD_RADIUS, 0.08, 8, 200),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle emissive pulse
    materialRef.current.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 0.7);
  });

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        ref={materialRef}
        color={THRESHOLD_COLOR}
        emissive={THRESHOLD_COLOR}
        emissiveIntensity={0.4}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}
