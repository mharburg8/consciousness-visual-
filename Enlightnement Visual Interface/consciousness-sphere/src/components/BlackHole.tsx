import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import { useReducedMotion } from '../hooks/useReducedMotion';

const TOTAL_LAYERS = layers.length; // 7
const RS    = 0.9;  // event horizon radius
const MAX_R = 14;   // outer disk radius
const SPEED = 0.22;

export default function BlackHole() {
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const isHighQuality   = useExplorerStore((s) => s.isHighQuality);
  const prefersReduced  = useReducedMotion();

  const isActive = dissolvedLayers.length >= TOTAL_LAYERS - 1;
  const count    = isHighQuality ? 10000 : 4000;

  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.InstancedMesh>(null);
  const fadeRef  = useRef(0);

  const dummy  = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);

  // Lerp positions — allocated once
  const positions = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(new THREE.Vector3(
        (Math.random() - 0.5) * MAX_R * 2,
        (Math.random() - 0.5) * MAX_R * 2,
        (Math.random() - 0.5) * MAX_R * 2,
      ));
    }
    return arr;
  }, [count]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(0.18, 0.18), []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uFade:  { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vColor;
      void main() {
        vUv = uv;
        vColor = instanceColor;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uFade;
      float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 ip = floor(p); vec2 u = fract(p);
        u = u * u * (3.0 - 2.0 * u);
        float a = rand(ip);
        float b = rand(ip + vec2(1.0, 0.0));
        float c = rand(ip + vec2(0.0, 1.0));
        float d = rand(ip + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
      void main() {
        float dist = distance(vUv, vec2(0.5));
        float n = noise(vUv * 5.0 + uTime * 0.5);
        float alpha = (1.0 - smoothstep(0.2, 0.5, dist)) * (0.5 + 0.5 * n);
        if (alpha < 0.05) discard;
        gl_FragColor = vec4(vColor + 0.2, alpha * 0.8 * uFade);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((state, delta) => {
    const grp  = groupRef.current;
    const mesh = meshRef.current;
    if (!grp || !mesh) return;

    // Smooth fade in / out
    fadeRef.current += ((isActive ? 1 : 0) - fadeRef.current) * Math.min(1, delta * 0.7);
    const fade = fadeRef.current;

    if (fade < 0.005) { grp.visible = false; return; }
    grp.visible = true;

    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uFade.value = fade;

    if (prefersReduced) return;

    const time = state.clock.getElapsedTime() * SPEED;

    for (let i = 0; i < count; i++) {
      const r1    = (i * 13.579)  % 1.0;
      const r2    = (i * 97.531)  % 1.0;
      const r3    = (i * 24.680)  % 1.0;
      const group = (i * 73.197)  % 100.0;

      let x = 0, y = 0, z = 0, r = 0, theta = 0;
      let hue = 0.1, sat = 1.0, light = 0.5;

      if (group < 60) {
        // ── Accretion disk ──────────────────────────────────────────────────
        r = RS + (r1 * r1) * (MAX_R - RS);
        const angVel = Math.pow(RS / r, 1.5) * 3.0;
        theta = (Math.abs(r2 + time * angVel) % 1.0) * Math.PI * 2.0;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        const flare = (r - RS) * 0.08;
        y = (r3 - 0.5) * flare * (1.0 + 0.5 * Math.sin(theta * 4.0));

      } else if (group < 85) {
        // ── Photon sphere arcs ───────────────────────────────────────────────
        r = RS + (r1 * r1) * (MAX_R * 0.55 - RS);
        const angVel = Math.pow(RS / r, 1.5) * 3.0;
        const frac   = Math.abs(r2 + time * angVel) % 1.0;
        theta = Math.PI + frac * Math.PI;
        const bx = r * Math.cos(theta);
        const bz = r * Math.sin(theta);
        x = bx;
        y = (group < 72.5 ? -bz : bz) + (r3 - 0.5) * 1.5;
        z = bz * 0.25;

      } else if (group < 92) {
        // ── Ergosphere shell ─────────────────────────────────────────────────
        r = RS * 1.01 + r1 * 0.2;
        const phi   = r2 * Math.PI * 2.0;
        const costh = r3 * 2.0 - 1.0;
        const sinth = Math.sqrt(1.0 - costh * costh);
        x = r * sinth * Math.cos(phi);
        y = r * sinth * Math.sin(phi);
        z = r * costh;
        const angle = Math.atan2(z, x) + time * 5.0;
        const rxz   = Math.sqrt(x * x + z * z);
        x = rxz * Math.cos(angle);
        z = rxz * Math.sin(angle);

      } else {
        // ── Distant stellar field ────────────────────────────────────────────
        r = MAX_R * 1.2 + r1 * MAX_R * 3.0;
        const phi   = r2 * Math.PI * 2.0;
        const costh = r3 * 2.0 - 1.0;
        const sinth = Math.sqrt(1.0 - costh * costh);
        x = r * sinth * Math.cos(phi);
        y = r * sinth * Math.sin(phi);
        z = r * costh;
      }

      // ── Color ─────────────────────────────────────────────────────────────
      if (group < 92) {
        const norm = Math.max(0, Math.min(1, (r - RS) / (MAX_R * 0.5)));
        hue  = Math.max(0, 0.13 - norm * 0.15);
        sat  = 0.8 + norm * 0.2;
        if (norm < 0.05) {
          light = 0.8 + (0.05 - norm) * 4.0;
        } else {
          light = 0.6 * Math.pow(1.0 - norm, 1.6);
        }
        const turb = Math.sin(r * 4.0 - time * 2.0) * Math.cos(theta * 5.0);
        light *= 1.0 + turb * 0.3;
      } else {
        hue   = 0.6 + r1 * 0.2;
        sat   = 0.3;
        light = r2 > 0.98 ? 0.9 : 0.05;
      }

      target.set(x, y, z);
      pColor.setHSL(hue, sat, Math.min(1, Math.max(0, light)));

      positions[i].lerp(target, 0.1);
      dummy.position.copy(positions[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, pColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh ref={meshRef} args={[geometry, material, count]} />
    </group>
  );
}
