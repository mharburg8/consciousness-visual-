import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function CenterGlow() {
  const coreRef  = useRef<THREE.Mesh>(null);
  const halo1Ref = useRef<THREE.Mesh>(null);
  const halo2Ref = useRef<THREE.Mesh>(null);
  const coreMat  = useRef<THREE.MeshStandardMaterial>(null);
  const halo1Mat = useRef<THREE.MeshStandardMaterial>(null);
  const halo2Mat = useRef<THREE.MeshStandardMaterial>(null);
  const prefersReducedMotion = useReducedMotion();

  const coreGeo  = useMemo(() => new THREE.SphereGeometry(0.22, 32, 32), []);
  const halo1Geo = useMemo(() => new THREE.SphereGeometry(0.55, 32, 32), []);
  const halo2Geo = useMemo(() => new THREE.SphereGeometry(1.1, 32, 32), []);

  useFrame(({ clock }) => {
    if (prefersReducedMotion) return;
    const t = clock.getElapsedTime();

    // Core: gentle warm pulse — dramatically reduced from original 3.5
    if (coreMat.current) {
      coreMat.current.emissiveIntensity = 1.1 + 0.5 * Math.sin(t * 1.8);
    }
    // Halo 1
    if (halo1Mat.current) {
      halo1Mat.current.emissiveIntensity = 0.45 + 0.2 * Math.sin(t * 1.2 + 1.0);
      halo1Mat.current.opacity = 0.12 + 0.04 * Math.sin(t * 0.9);
    }
    // Halo 2: very slow atmospheric breath
    if (halo2Mat.current) {
      halo2Mat.current.emissiveIntensity = 0.15 + 0.07 * Math.sin(t * 0.6 + 2.1);
      halo2Mat.current.opacity = 0.04 + 0.02 * Math.sin(t * 0.5);
    }
    // Subtle scale breath on core
    if (coreRef.current && !prefersReducedMotion) {
      coreRef.current.scale.setScalar(1 + 0.05 * Math.sin(t * 1.8));
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
          emissiveIntensity={0.15}
          transparent
          opacity={0.04}
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
          emissiveIntensity={0.45}
          transparent
          opacity={0.12}
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
          emissiveIntensity={1.1}
          transparent
          opacity={0.96}
        />
      </mesh>

      {/* Labels — Billboard keeps them facing the camera at all times */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Main header */}
        <Text
          position={[0, 1.85, 0]}
          fontSize={0.28}
          color="#fff5e0"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#000000"
          font={undefined}
        >
          Pure Source
        </Text>

        {/* Subtitle */}
        <Text
          position={[0, 1.50, 0]}
          fontSize={0.16}
          color="rgba(255,245,220,0.7)"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#000000"
          font={undefined}
        >
          The Absolute · Beyond All Form
        </Text>

        {/* Pulsing decorative arc hint */}
        <Text
          position={[0, 1.20, 0]}
          fontSize={0.11}
          color="rgba(255,245,220,0.4)"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#000000"
          font={undefined}
        >
          I AM THAT I AM
        </Text>
      </Billboard>
    </group>
  );
}
