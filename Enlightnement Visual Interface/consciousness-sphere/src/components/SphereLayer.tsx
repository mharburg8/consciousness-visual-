import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Layer } from '../types';
import useExplorerStore from '../stores/useExplorerStore';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { layers } from '../data/layers';

const SORTED_LAYERS = [...layers].sort((a, b) => b.radius - a.radius);

// Per-layer Fibonacci sphere personality
// spin: golden-angle rotation speed | wave: radial deformation (fraction of radius) | pulse: wave frequency
const FLOW: Record<number, { spin: number; wave: number; pulse: number }> = {
  7: { spin: 0.28, wave: 0.22, pulse: 2.2 },  // outermost — turbulent, churning
  6: { spin: 0.22, wave: 0.17, pulse: 1.8 },
  5: { spin: 0.16, wave: 0.13, pulse: 1.5 },
  4: { spin: 0.12, wave: 0.10, pulse: 1.2 },
  3: { spin: 0.08, wave: 0.07, pulse: 0.9 },
  2: { spin: 0.05, wave: 0.04, pulse: 0.6 },
  1: { spin: 0.03, wave: 0.02, pulse: 0.4 },  // innermost — nearly still, serene
};

const COUNT_HQ: Record<number, number> = {
  7: 9500, 6: 8200, 5: 7000, 4: 5800, 3: 4600, 2: 3200, 1: 2000,
};

// Vertex shader — size-attenuated points
const VERT = /* glsl */`
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uPointScale;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPointScale / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader — bright core + pulsing ring (from gl_PointCoord)
const FRAG = /* glsl */`
  varying vec3 vColor;
  uniform float uTime;
  uniform float uOpacity;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float ring = smoothstep(0.34, 0.40, dist) - smoothstep(0.40, 0.50, dist);
    float core = 1.0 - smoothstep(0.0, 0.14, dist);
    float pulse = 0.78 + 0.18 * sin(uTime * 1.4);
    float alpha = (core + ring * pulse) * uOpacity;
    if (alpha < 0.015) discard;

    gl_FragColor = vec4(vColor * (1.0 + core * 0.6), alpha);
  }
`;

type DissolveState = 'idle' | 'dissolving' | 'dissolved';
interface Props { layer: Layer }

export default function SphereLayer({ layer }: Props) {
  const groupRef  = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const posAttr   = useRef<THREE.BufferAttribute | null>(null);
  const colAttr   = useRef<THREE.BufferAttribute | null>(null);

  const dissolveRef         = useRef<DissolveState>('idle');
  const dissolveProgressRef = useRef(0);
  // Snapshot of sphere-surface positions captured when fission begins
  const dissolveInitPos     = useRef<Float32Array | null>(null);

  const { gl } = useThree();

  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const selectedLayer   = useExplorerStore((s) => s.selectedLayer);
  const hoveredLayer    = useExplorerStore((s) => s.hoveredLayer);
  const selectLayer     = useExplorerStore((s) => s.selectLayer);
  const setHoveredLayer = useExplorerStore((s) => s.setHoveredLayer);
  const isHighQuality   = useExplorerStore((s) => s.isHighQuality);
  const prefersReduced  = useReducedMotion();

  const isDissolved   = dissolvedLayers.includes(layer.id);
  const activeLayerId = SORTED_LAYERS.find(l => !dissolvedLayers.includes(l.id))?.id ?? null;
  const isActive      = layer.id === activeLayerId;
  const activeIdx     = SORTED_LAYERS.findIndex(l => l.id === activeLayerId);
  const ghostId       = SORTED_LAYERS[activeIdx + 1]?.id ?? null;
  const isGhost       = layer.id === ghostId;

  useEffect(() => {
    if (isDissolved && dissolveRef.current === 'idle') {
      dissolveRef.current = 'dissolving';
    }
    if (!isDissolved && dissolveRef.current !== 'idle') {
      dissolveRef.current = 'idle';
      dissolveProgressRef.current = 0;
      dissolveInitPos.current = null;
      if (groupRef.current) {
        groupRef.current.scale.setScalar(1);
        groupRef.current.position.set(0, 0, 0);
        groupRef.current.visible = true;
      }
    }
  }, [isDissolved]);

  const count = isHighQuality
    ? (COUNT_HQ[layer.id] ?? 1600)
    : Math.floor((COUNT_HQ[layer.id] ?? 1600) * 0.30);

  // Current positions for lerp (mutable Float32Array — no GC alloc per frame)
  const curPos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = Math.sin(phi) * Math.cos(theta) * layer.radius;
      arr[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * layer.radius;
      arr[i * 3 + 2] = Math.cos(phi) * layer.radius;
    }
    return arr;
  }, [count, layer.radius]);

  // GPU-uploaded position & color buffers
  const posArray = useMemo(() => new Float32Array(count * 3), [count]);
  const colArray = useMemo(() => new Float32Array(count * 3), [count]);

  // Base HSL of layer color
  const layerHSL = useMemo(() => {
    const hsl = { h: 0, s: 0, l: 0 };
    new THREE.Color(layer.hexColor).getHSL(hsl);
    return hsl;
  }, [layer.hexColor]);

  // Per-layer shader material (own uTime + uOpacity uniforms)
  // Multiply uPointScale by DPR so particles are the same apparent CSS-pixel size
  // on high-DPR mobile screens as they are on 1× desktop displays.
  const dpr = gl.getPixelRatio();
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:       { value: 0 },
      uOpacity:    { value: 0 },
      uPointScale: { value: (55 + layer.radius * 9) * dpr },
    },
    vertexShader:   VERT,
    fragmentShader: FRAG,
    transparent:    true,
    depthWrite:     false,
    blending:       THREE.AdditiveBlending,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [layer.id, dpr]);  // stable per layer; dpr changes only on window move across monitors

  const hitGeo = useMemo(
    () => new THREE.SphereGeometry(layer.radius, 16, 16),
    [layer.radius],
  );

  const fp = FLOW[layer.id] ?? FLOW[4];

  useFrame(({ clock }, delta) => {
    const t    = clock.getElapsedTime();
    const grp  = groupRef.current;
    const pts  = pointsRef.current;
    const pA   = posAttr.current;
    const cA   = colAttr.current;
    const mat  = material;
    if (!grp || !pts || !pA || !cA) return;

    // ── Fission Dissolve ─────────────────────────────────────────────────────
    if (dissolveRef.current === 'dissolving') {
      grp.visible = true;
      grp.scale.setScalar(1);
      grp.position.set(0, 0, 0);

      // Snapshot sphere positions on the first dissolve frame
      if (!dissolveInitPos.current) {
        dissolveInitPos.current = new Float32Array(curPos);
      }
      const initPos = dissolveInitPos.current;

      dissolveProgressRef.current = Math.min(1, dissolveProgressRef.current + delta * 0.45);
      const cycle = dissolveProgressRef.current;

      // Fission timing curves
      const defCycle = Math.min(cycle, 0.42);
      const cs       = (defCycle - 0.38) * 8.0;
      const tStretch = Math.exp(-(cs * cs));                              // neck compression

      const cp     = (cycle - 0.15) * 10.0;
      const tPulse = Math.exp(-(cp * cp));                                // energy flash

      const tSplit = Math.max(0, cycle - 0.42) * 2.0;                    // hemisphere separation
      const tFade  = Math.max(0, 1.0 - Math.max(0, cycle - 0.80) * 5.0);

      const nuclScale  = layer.radius;
      const yieldForce = layer.radius * 22;
      const { h: bH, s: bS, l: bL } = layerHSL;

      mat.uniforms.uOpacity.value = tFade * (isActive ? 0.92 : 0.18);
      mat.uniforms.uTime.value    = t;

      for (let i = 0; i < count; i++) {
        const u   = i / count;

        // Fibonacci sphere direction (matches nuclear_fission.jsx)
        const phi   = Math.acos(1.0 - 2.0 * ((i * 0.754877) % 1.0));
        const theta = Math.PI * 2.0 * i * 1.61803398875;
        const dirX  = Math.sin(phi) * Math.cos(theta);
        const dirY  = Math.sin(phi) * Math.sin(theta);
        const dirZ  = Math.cos(phi);

        let px = 0, py = 0, pz = 0;
        let lHue = bH, lSat = bS, lLit = bL;

        if (u < 0.80) {
          // ── Nuclear body: fission split ──────────────────────────────────
          // Use snapshot sphere position projected to a local coordinate
          const sx = initPos[i * 3];
          const sy = initPos[i * 3 + 1];
          const sz = initPos[i * 3 + 2];
          const side    = sx >= 0 ? 1.0 : -1.0;

          // Neck compression: squeeze equatorial particles together
          const neck    = Math.max(0, 1.0 - Math.abs(sx) / (nuclScale * 1.2));
          const ny      = sy - sy * neck * tStretch * 0.75;
          const nz      = sz - sz * neck * tStretch * 0.75;

          // Center shift + hemisphere separation
          const cShift  = side * tStretch * nuclScale * 0.85;

          // Spin fragments around Y axis
          let rotX = sx, rotY = ny;
          if (tSplit > 0) {
            const spin = tSplit * 6.0 * side;
            const cosS = Math.cos(spin), sinS = Math.sin(spin);
            rotX = sx * cosS - ny * sinS;
            rotY = sx * sinS + ny * cosS;
          }

          const sepAmount = tSplit * yieldForce * side;
          px = rotX + cShift + sepAmount;
          py = rotY;
          pz = nz;

          // Heat scatter on separation
          const heat = tSplit * 2.5;
          px += dirX * heat;
          py += dirY * heat;
          pz += dirZ * heat;

          // Color: layer hue, brighter during pulse + stretch
          lHue = ((bH - tStretch * 0.05 - tSplit * 0.08) % 1 + 1) % 1;
          lLit = Math.min(1, bL * (0.8 + tPulse * 1.2 + tStretch * 0.4));
          lSat = Math.min(1, bS * (0.9 + tPulse * 0.3));

        } else if (u < 0.85) {
          // ── Prompt neutrons: fast radial scatter ─────────────────────────
          if (cycle < 0.42) {
            lLit = 0;
          } else {
            const flashT = cycle - 0.42;
            const dist   = flashT * yieldForce * 3.5;
            const scX    = dirX + Math.sin(i * 11.1) * 0.4;
            const scY    = dirY + Math.cos(i * 13.3) * 0.4;
            const scZ    = dirZ + Math.sin(i * 17.7) * 0.4;
            px = scX * dist; py = scY * dist; pz = scZ * dist;
            // Brighter desaturated flash — toward white
            lHue = bH;
            lSat = Math.max(0, bS * (1.0 - flashT * 2));
            lLit = Math.min(1, bL * 2.5 * Math.max(0, 0.9 - flashT * 1.5));
          }

        } else {
          // ── Gamma shockwave: expanding shell ─────────────────────────────
          if (cycle < 0.42) {
            lLit = 0;
          } else {
            const flashT = cycle - 0.42;
            const rWave  = Math.pow(flashT * 2.2, 0.4) * yieldForce * 1.3;
            const noise  = Math.sin(i * 12.3 + t * 15.0) * nuclScale * 0.5;
            const spread = rWave + noise;
            px = dirX * spread; py = dirY * spread; pz = dirZ * spread;
            // Shockwave: shift hue toward cooler, fade quickly
            lHue = ((bH + 0.12) % 1 + 1) % 1;
            lSat = Math.max(0, bS * (1.0 - flashT));
            lLit = Math.min(1, bL * Math.max(0, 1.2 - flashT * 2.8));
          }
        }

        // Lerp curPos toward fission target (fast lerp for drama)
        curPos[i * 3]     += (px - curPos[i * 3])     * 0.14;
        curPos[i * 3 + 1] += (py - curPos[i * 3 + 1]) * 0.14;
        curPos[i * 3 + 2] += (pz - curPos[i * 3 + 2]) * 0.14;

        posArray[i * 3]     = curPos[i * 3];
        posArray[i * 3 + 1] = curPos[i * 3 + 1];
        posArray[i * 3 + 2] = curPos[i * 3 + 2];

        // Color (inline HSL → RGB)
        const fs = Math.min(1, Math.abs(lSat));
        const fl = Math.min(1, Math.abs(lLit * tFade));
        let r0 = fl, g0 = fl, b0 = fl;
        if (fs > 0) {
          const q  = fl < 0.5 ? fl * (1 + fs) : fl + fs - fl * fs;
          const p0 = 2 * fl - q;
          r0 = hue2rgb(p0, q, lHue + 1/3);
          g0 = hue2rgb(p0, q, lHue);
          b0 = hue2rgb(p0, q, lHue - 1/3);
        }
        colArray[i * 3]     = r0;
        colArray[i * 3 + 1] = g0;
        colArray[i * 3 + 2] = b0;
      }

      pA.needsUpdate = true;
      cA.needsUpdate = true;

      if (cycle >= 1) { dissolveRef.current = 'dissolved'; grp.visible = false; }
      return;
    }
    if (dissolveRef.current === 'dissolved') return;

    // ── Visibility ──────────────────────────────────────────────────────────
    grp.visible = isActive || isGhost;
    if (!grp.visible) { mat.uniforms.uOpacity.value = 0; return; }

    grp.position.set(0, 0, 0);
    grp.scale.setScalar(prefersReduced ? 1 : 1 + 0.005 * Math.sin(t * 0.8 + layer.id));

    // ── Target opacity ──────────────────────────────────────────────────────
    let targetOp = 0;
    if (isActive) {
      targetOp = hoveredLayer === layer.id && selectedLayer === null ? 1.0 : 0.88;
    } else if (isGhost) {
      targetOp = 0.13;
    }
    mat.uniforms.uOpacity.value  += (targetOp - mat.uniforms.uOpacity.value)  * 0.06;
    mat.uniforms.uTime.value      = t;

    // ── Skip per-particle update in reduced motion ──────────────────────────
    if (prefersReduced) return;

    // ── Living Fibonacci Sphere (adapted from shap.jsx) ──────────────────────
    const { spin, wave, pulse } = fp;
    const safeN  = count > 0 ? count : 1;
    const { h: bH, s: bS, l: bL } = layerHSL;
    const lerpK  = isGhost ? 0.04 : 0.08;
    // Golden angle constant (2π / φ²)
    const GOLDEN = 2.3999632297;

    for (let i = 0; i < count; i++) {
      const ratio = i / safeN;

      // Fibonacci sphere: uniformly distribute points using golden angle spiral
      const fy    = 1.0 - ratio * 2.0;           // y: +1 → -1
      const fr    = Math.sqrt(1.0 - fy * fy);    // xz radius at this y
      const theta = GOLDEN * i + t * spin;        // golden angle + slow rotation

      const baseX = Math.cos(theta) * fr;
      const baseZ = Math.sin(theta) * fr;

      // Breathing wave deformation — unique phase per particle
      const waveAmt = Math.sin(i * 0.05 + t * pulse) * (wave * layer.radius);
      const finalR  = layer.radius + waveAmt;

      const tx = baseX * finalR;
      const ty = fy    * finalR;
      const tz = baseZ * finalR;

      // Lerp current position toward Fibonacci target
      curPos[i * 3]     += (tx - curPos[i * 3])     * lerpK;
      curPos[i * 3 + 1] += (ty - curPos[i * 3 + 1]) * lerpK;
      curPos[i * 3 + 2] += (tz - curPos[i * 3 + 2]) * lerpK;

      posArray[i * 3]     = curPos[i * 3];
      posArray[i * 3 + 1] = curPos[i * 3 + 1];
      posArray[i * 3 + 2] = curPos[i * 3 + 2];

      // Color: layer hue ± small drift, lightness pulses with wave
      const hShift  = Math.sin(i * 0.008) * 0.04;         // ±4% hue drift per particle
      const litMult = 0.7 + 0.55 * ((waveAmt / (wave * layer.radius + 0.001)) * 0.5 + 0.5)
                          + 0.15 * Math.sin(i * 0.02 + t * pulse);
      const satMult = 0.80 + 0.20 * Math.sin(ratio * Math.PI * 2 + t * 0.4);

      const fh = ((bH + hShift) % 1 + 1) % 1;
      const fs = Math.min(1, Math.abs(bS * satMult));
      const fl = Math.min(1, Math.abs(bL * litMult));

      // Inline HSL → RGB
      let r0 = fl, g0 = fl, b0 = fl;
      if (fs > 0) {
        const q  = fl < 0.5 ? fl * (1 + fs) : fl + fs - fl * fs;
        const p0 = 2 * fl - q;
        r0 = hue2rgb(p0, q, fh + 1/3);
        g0 = hue2rgb(p0, q, fh);
        b0 = hue2rgb(p0, q, fh - 1/3);
      }
      colArray[i * 3]     = r0;
      colArray[i * 3 + 1] = g0;
      colArray[i * 3 + 2] = b0;
    }

    pA.needsUpdate = true;
    cA.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={isActive || isGhost}>

      {/* ── 4D flow particle sphere ── */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            ref={(attr) => { posAttr.current = attr; }}
            attach="attributes-position"
            array={posArray}
            itemSize={3}
            count={count}
          />
          <bufferAttribute
            ref={(attr) => { colAttr.current = attr; }}
            attach="attributes-color"
            array={colArray}
            itemSize={3}
            count={count}
          />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>

      {/* ── Transparent hit mesh for pointer events ── */}
      <mesh
        geometry={hitGeo}
        onPointerEnter={(e) => {
          if (!isActive) return;
          e.stopPropagation();
          setHoveredLayer(layer.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          if (!isActive) return;
          setHoveredLayer(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          if (!isActive) return;
          e.stopPropagation();
          selectLayer(layer.id);
        }}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Inline HSL helper — avoids THREE.Color allocation per particle per frame
function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}
