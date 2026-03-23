import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Smoothstep fade: 1.0 when camera dist ≤ near, 0.0 when dist ≥ far
function distFade(dist: number, near: number, far: number): number {
  const t = Math.max(0, Math.min(1, (dist - near) / (far - near)));
  return 1 - t * t * (3 - 2 * t);
}

export default function CenterGlow() {
  const coreRef      = useRef<THREE.Mesh>(null);
  const halo1Ref     = useRef<THREE.Mesh>(null);
  const halo2Ref     = useRef<THREE.Mesh>(null);
  const coreMat      = useRef<THREE.MeshStandardMaterial>(null);
  const halo1Mat     = useRef<THREE.MeshStandardMaterial>(null);
  const halo2Mat     = useRef<THREE.MeshStandardMaterial>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  const coreGeo  = useMemo(() => new THREE.SphereGeometry(0.22, 32, 32), []);
  const halo1Geo = useMemo(() => new THREE.SphereGeometry(0.55, 32, 32), []);
  const halo2Geo = useMemo(() => new THREE.SphereGeometry(1.1, 32, 32), []);

  useFrame(({ clock, camera }) => {
    const t    = clock.getElapsedTime();
    const dist = camera.position.length();

    // fade: fully visible when dist < 3, invisible when dist > 11
    const fade = distFade(dist, 3, 11);

    // Core: gentle warm pulse, scaled by fade
    if (coreMat.current) {
      const pulse = prefersReducedMotion ? 1.1 : 1.1 + 0.5 * Math.sin(t * 1.8);
      coreMat.current.emissiveIntensity = pulse * Math.max(fade, 0.0);
      coreMat.current.opacity           = 0.96 * Math.max(fade, 0.01);
    }
    // Halo 1
    if (halo1Mat.current) {
      halo1Mat.current.emissiveIntensity = (0.45 + 0.2 * Math.sin(t * 1.2 + 1.0)) * fade;
      halo1Mat.current.opacity           = (0.12 + 0.04 * Math.sin(t * 0.9)) * fade;
    }
    // Halo 2
    if (halo2Mat.current) {
      halo2Mat.current.emissiveIntensity = (0.15 + 0.07 * Math.sin(t * 0.6 + 2.1)) * fade;
      halo2Mat.current.opacity           = (0.04 + 0.02 * Math.sin(t * 0.5)) * fade;
    }
    // Core scale breath
    if (coreRef.current && !prefersReducedMotion) {
      coreRef.current.scale.setScalar(1 + 0.05 * Math.sin(t * 1.8));
    }
    // Text labels handled by VoidCenter — hide these
    if (textGroupRef.current) {
      textGroupRef.current.visible = false;
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
          emissiveIntensity={0}
          transparent
          opacity={0}
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
          emissiveIntensity={0}
          transparent
          opacity={0}
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
          emissiveIntensity={0}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Labels — visible only when camera is close to center */}
      <group ref={textGroupRef} visible={false}>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          <Text
            position={[0, 3.6, 0]}
            fontSize={0.52}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.018}
            outlineColor="#000000"
            font={undefined}
          >
            Pure Consciousness
          </Text>
          <Text
            position={[0, 2.9, 0]}
            fontSize={0.22}
            color="rgba(255,255,255,0.75)"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.010}
            outlineColor="#000000"
            font={undefined}
          >
            The Absolute · Beyond All Form
          </Text>
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.15}
            color="rgba(255,255,255,0.42)"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.007}
            outlineColor="#000000"
            font={undefined}
          >
            I AM THAT I AM
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
