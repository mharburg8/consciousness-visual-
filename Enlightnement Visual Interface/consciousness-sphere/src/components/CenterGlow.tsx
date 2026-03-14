import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function CenterGlow() {
  const coreRef = useRef<THREE.Mesh>(null);
  const halo1Ref = useRef<THREE.Mesh>(null);
  const halo2Ref = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const halo1Mat = useRef<THREE.MeshStandardMaterial>(null);
  const halo2Mat = useRef<THREE.MeshStandardMaterial>(null);
  const prefersReducedMotion = useReducedMotion();

  const coreGeo  = useMemo(() => new THREE.SphereGeometry(0.22, 32, 32), []);
  const halo1Geo = useMemo(() => new THREE.SphereGeometry(0.55, 32, 32), []);
  const halo2Geo = useMemo(() => new THREE.SphereGeometry(1.1, 32, 32), []);

  useFrame(({ clock }) => {
    if (prefersReducedMotion) return;
    const t = clock.getElapsedTime();

    // Core: rapid warm pulse
    if (coreMat.current) {
      coreMat.current.emissiveIntensity = 3.5 + 1.5 * Math.sin(t * 1.8);
    }
    // Halo 1: slower counter-phase pulse
    if (halo1Mat.current) {
      halo1Mat.current.emissiveIntensity = 1.2 + 0.6 * Math.sin(t * 1.2 + 1.0);
      halo1Mat.current.opacity = 0.18 + 0.06 * Math.sin(t * 0.9);
    }
    // Halo 2: very slow breath
    if (halo2Mat.current) {
      halo2Mat.current.emissiveIntensity = 0.4 + 0.2 * Math.sin(t * 0.6 + 2.1);
      halo2Mat.current.opacity = 0.06 + 0.03 * Math.sin(t * 0.5);
    }
    // Subtle scale breath on core
    if (coreRef.current) {
      const s = 1 + 0.06 * Math.sin(t * 1.8);
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* Outermost atmospheric haze */}
      <mesh ref={halo2Ref} geometry={halo2Geo}>
        <meshStandardMaterial
          ref={halo2Mat}
          color="#fff3d0"
          emissive="#fff3d0"
          emissiveIntensity={0.4}
          transparent
          opacity={0.06}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Mid halo */}
      <mesh ref={halo1Ref} geometry={halo1Geo}>
        <meshStandardMaterial
          ref={halo1Mat}
          color="#fff8e8"
          emissive="#ffe8b0"
          emissiveIntensity={1.2}
          transparent
          opacity={0.18}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Solid luminous core */}
      <mesh ref={coreRef} geometry={coreGeo}>
        <meshStandardMaterial
          ref={coreMat}
          color="#ffffff"
          emissive="#fff5e0"
          emissiveIntensity={3.5}
          transparent
          opacity={0.98}
        />
      </mesh>
    </group>
  );
}
