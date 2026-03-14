import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useExplorerStore from '../stores/useExplorerStore';
import { useReducedMotion } from '../hooks/useReducedMotion';

function generatePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  // Three shells: close-in (r 0.8-2.5), mid (2.5-5.5), outer (5.5-9)
  for (let i = 0; i < count; i++) {
    const shell = Math.random();
    const innerR = shell < 0.25 ? 0.8  : shell < 0.6 ? 2.5 : 5.5;
    const outerR = shell < 0.25 ? 2.5  : shell < 0.6 ? 5.5 : 9.0;
    const r3min = innerR ** 3;
    const r3max = outerR ** 3;
    const r   = Math.cbrt(r3min + Math.random() * (r3max - r3min));
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

function generateColors(count: number): Float32Array {
  // Warm whites, pale golds, silver blues — dusty cosmic palette
  const palette = [
    new THREE.Color('#fff8e8'), // warm white
    new THREE.Color('#f5e8c8'), // pale gold
    new THREE.Color('#d4c8e8'), // silver lavender
    new THREE.Color('#c8d8e8'), // pale steel blue
    new THREE.Color('#e8e4f0'), // near white
  ];
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  return colors;
}

export default function ParticleField() {
  const isHighQuality = useExplorerStore((s) => s.isHighQuality);
  const count = isHighQuality ? 1200 : 400;

  const groupRef  = useRef<THREE.Group>(null);
  const points1Ref = useRef<THREE.Points>(null);
  const points2Ref = useRef<THREE.Points>(null);

  // Two layers rotating in opposite directions for depth
  const geo1 = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = generatePositions(Math.floor(count * 0.7));
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(generateColors(Math.floor(count * 0.7)), 3));
    return g;
  }, [count]);

  const geo2 = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = generatePositions(Math.floor(count * 0.3));
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(generateColors(Math.floor(count * 0.3)), 3));
    return g;
  }, [count]);

  const prefersReducedMotion = useReducedMotion();

  useFrame(({ clock }) => {
    if (prefersReducedMotion) return;
    const t = clock.getElapsedTime();
    if (points1Ref.current) {
      points1Ref.current.rotation.y =  t * 0.009;
      points1Ref.current.rotation.x =  t * 0.003;
    }
    if (points2Ref.current) {
      points2Ref.current.rotation.y = -t * 0.006;
      points2Ref.current.rotation.z =  t * 0.002;
    }
  });

  if (prefersReducedMotion) return null;

  return (
    <group ref={groupRef}>
      {/* Primary particle layer — slightly larger, more visible */}
      <points ref={points1Ref} geometry={geo1}>
        <pointsMaterial
          vertexColors
          size={isHighQuality ? 0.055 : 0.04}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Secondary layer — tiny, denser, counter-rotating */}
      <points ref={points2Ref} geometry={geo2}>
        <pointsMaterial
          vertexColors
          size={isHighQuality ? 0.025 : 0.018}
          sizeAttenuation
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
