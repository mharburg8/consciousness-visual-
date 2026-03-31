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

// ── Desktop GL_POINTS shaders ────────────────────────────────────────────────
const VERT = /* glsl */`
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uPointScale;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(2.0, uPointScale / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

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

  // Desktop GL_POINTS refs
  const pointsRef = useRef<THREE.Points>(null);
  const posAttr   = useRef<THREE.BufferAttribute | null>(null);
  const colAttr   = useRef<THREE.BufferAttribute | null>(null);

  // Mobile InstancedMesh ref
  const instRef = useRef<THREE.InstancedMesh>(null);

  const dissolveRef         = useRef<DissolveState>('idle');
  const dissolveProgressRef = useRef(0);
  const dissolveInitPos     = useRef<Float32Array | null>(null);

  // Fade ref for mobile material opacity (lerped per frame)
  const mobileOpacity = useRef(0);

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
    : Math.floor((COUNT_HQ[layer.id] ?? 1600) * 0.35);

  // Generate initial sphere positions
  const initPositions = useMemo(() => {
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

  const curPos   = useMemo(() => new Float32Array(initPositions), [initPositions]);
  const posArray = useMemo(() => new Float32Array(initPositions), [initPositions]);
  const colArray = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const c = new THREE.Color(layer.hexColor);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [count, layer.hexColor]);

  const layerHSL = useMemo(() => {
    const hsl = { h: 0, s: 0, l: 0 };
    new THREE.Color(layer.hexColor).getHSL(hsl);
    return hsl;
  }, [layer.hexColor]);

  // ── Desktop: GL_POINTS shader material ────────────────────────────────────
  const dpr = gl.getPixelRatio();
  const pointsMaterial = useMemo(() => {
    if (!isHighQuality) return null;  // not used on mobile
    return new THREE.ShaderMaterial({
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
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer.id, dpr, isHighQuality]);

  // ── Mobile: InstancedMesh geometry + material ─────────────────────────────
  const instanceGeo = useMemo(() => {
    if (isHighQuality) return null;
    return new THREE.IcosahedronGeometry(0.055, 0);  // 12 faces, very cheap
  }, [isHighQuality]);

  const instanceMat = useMemo(() => {
    if (isHighQuality) return null;
    return new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
      opacity:     0,
    });
  }, [isHighQuality]);

  // Scratch objects for mobile instance updates (allocated once)
  const tmpColor  = useMemo(() => new THREE.Color(), []);

  const hitGeo = useMemo(
    () => new THREE.SphereGeometry(layer.radius, 16, 16),
    [layer.radius],
  );

  const fp = FLOW[layer.id] ?? FLOW[4];

  // ── Initialize mobile InstancedMesh with positions on mount ───────────────
  useEffect(() => {
    const mesh = instRef.current;
    if (!mesh || isHighQuality) return;
    const mat = new Float32Array(16);
    const c = new THREE.Color(layer.hexColor);
    for (let i = 0; i < count; i++) {
      // Identity matrix with position in the translation column
      mat[0] = 1; mat[1] = 0; mat[2] = 0; mat[3] = 0;
      mat[4] = 0; mat[5] = 1; mat[6] = 0; mat[7] = 0;
      mat[8] = 0; mat[9] = 0; mat[10] = 1; mat[11] = 0;
      mat[12] = initPositions[i * 3];
      mat[13] = initPositions[i * 3 + 1];
      mat[14] = initPositions[i * 3 + 2];
      mat[15] = 1;
      mesh.setMatrixAt(i, new THREE.Matrix4().fromArray(mat));
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, isHighQuality]);

  useFrame(({ clock }, delta) => {
    const t    = clock.getElapsedTime();
    const grp  = groupRef.current;
    if (!grp) return;

    // Determine which rendering path
    const usePoints = isHighQuality;
    const useInst   = !isHighQuality;

    // Desktop refs
    const pA = posAttr.current;
    const cA = colAttr.current;
    const mat = pointsMaterial;

    // Mobile ref
    const inst = instRef.current;

    // Guard: need at least one rendering path ready
    if (usePoints && (!pointsRef.current || !pA || !cA || !mat)) return;
    if (useInst && !inst) return;

    // ── Fission Dissolve ─────────────────────────────────────────────────────
    if (dissolveRef.current === 'dissolving') {
      grp.visible = true;
      grp.scale.setScalar(1);
      grp.position.set(0, 0, 0);

      if (!dissolveInitPos.current) {
        dissolveInitPos.current = new Float32Array(curPos);
      }
      const initPos = dissolveInitPos.current;

      dissolveProgressRef.current = Math.min(1, dissolveProgressRef.current + delta * 0.45);
      const cycle = dissolveProgressRef.current;

      const defCycle = Math.min(cycle, 0.42);
      const cs       = (defCycle - 0.38) * 8.0;
      const tStretch = Math.exp(-(cs * cs));

      const cp     = (cycle - 0.15) * 10.0;
      const tPulse = Math.exp(-(cp * cp));

      const tSplit = Math.max(0, cycle - 0.42) * 2.0;
      const tFade  = Math.max(0, 1.0 - Math.max(0, cycle - 0.80) * 5.0);

      const nuclScale  = layer.radius;
      const yieldForce = layer.radius * 22;
      const { h: bH, s: bS, l: bL } = layerHSL;

      const targetOp = tFade * (isActive ? 0.92 : 0.18);
      if (usePoints && mat) {
        mat.uniforms.uOpacity.value = targetOp;
        mat.uniforms.uTime.value    = t;
      }
      if (useInst && instanceMat) {
        instanceMat.opacity = targetOp;
      }

      for (let i = 0; i < count; i++) {
        const u = i / count;

        const phi   = Math.acos(1.0 - 2.0 * ((i * 0.754877) % 1.0));
        const theta = Math.PI * 2.0 * i * 1.61803398875;
        const dirX  = Math.sin(phi) * Math.cos(theta);
        const dirY  = Math.sin(phi) * Math.sin(theta);
        const dirZ  = Math.cos(phi);

        let px = 0, py = 0, pz = 0;
        let lHue = bH, lSat = bS, lLit = bL;

        if (u < 0.80) {
          const sx = initPos[i * 3];
          const sy = initPos[i * 3 + 1];
          const sz = initPos[i * 3 + 2];
          const side = sx >= 0 ? 1.0 : -1.0;

          const neck = Math.max(0, 1.0 - Math.abs(sx) / (nuclScale * 1.2));
          const ny   = sy - sy * neck * tStretch * 0.75;
          const nz   = sz - sz * neck * tStretch * 0.75;
          const cShift = side * tStretch * nuclScale * 0.85;

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

          const heat = tSplit * 2.5;
          px += dirX * heat; py += dirY * heat; pz += dirZ * heat;

          lHue = ((bH - tStretch * 0.05 - tSplit * 0.08) % 1 + 1) % 1;
          lLit = Math.min(1, bL * (0.8 + tPulse * 1.2 + tStretch * 0.4));
          lSat = Math.min(1, bS * (0.9 + tPulse * 0.3));

        } else if (u < 0.85) {
          if (cycle < 0.42) { lLit = 0; }
          else {
            const flashT = cycle - 0.42;
            const dist   = flashT * yieldForce * 3.5;
            px = (dirX + Math.sin(i * 11.1) * 0.4) * dist;
            py = (dirY + Math.cos(i * 13.3) * 0.4) * dist;
            pz = (dirZ + Math.sin(i * 17.7) * 0.4) * dist;
            lHue = bH;
            lSat = Math.max(0, bS * (1.0 - flashT * 2));
            lLit = Math.min(1, bL * 2.5 * Math.max(0, 0.9 - flashT * 1.5));
          }
        } else {
          if (cycle < 0.42) { lLit = 0; }
          else {
            const flashT = cycle - 0.42;
            const rWave  = Math.pow(flashT * 2.2, 0.4) * yieldForce * 1.3;
            const noise  = Math.sin(i * 12.3 + t * 15.0) * nuclScale * 0.5;
            px = dirX * (rWave + noise); py = dirY * (rWave + noise); pz = dirZ * (rWave + noise);
            lHue = ((bH + 0.12) % 1 + 1) % 1;
            lSat = Math.max(0, bS * (1.0 - flashT));
            lLit = Math.min(1, bL * Math.max(0, 1.2 - flashT * 2.8));
          }
        }

        curPos[i * 3]     += (px - curPos[i * 3])     * 0.14;
        curPos[i * 3 + 1] += (py - curPos[i * 3 + 1]) * 0.14;
        curPos[i * 3 + 2] += (pz - curPos[i * 3 + 2]) * 0.14;

        // Color (inline HSL -> RGB)
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
        colArray[i * 3] = r0; colArray[i * 3 + 1] = g0; colArray[i * 3 + 2] = b0;

        if (usePoints) {
          posArray[i * 3] = curPos[i * 3]; posArray[i * 3 + 1] = curPos[i * 3 + 1]; posArray[i * 3 + 2] = curPos[i * 3 + 2];
        }
      }

      if (usePoints && pA && cA) { pA.needsUpdate = true; cA.needsUpdate = true; }
      if (useInst && inst) { flushInstances(inst, curPos, colArray, count, tmpColor); }

      if (cycle >= 1) { dissolveRef.current = 'dissolved'; grp.visible = false; }
      return;
    }
    if (dissolveRef.current === 'dissolved') return;

    // ── Visibility ──────────────────────────────────────────────────────────
    grp.visible = isActive || isGhost;
    if (!grp.visible) {
      if (usePoints && mat) mat.uniforms.uOpacity.value = 0;
      if (useInst) mobileOpacity.current = 0;
      return;
    }

    grp.position.set(0, 0, 0);
    grp.scale.setScalar(prefersReduced ? 1 : 1 + 0.005 * Math.sin(t * 0.8 + layer.id));

    // ── Target opacity ──────────────────────────────────────────────────────
    let targetOp = 0;
    if (isActive) {
      targetOp = hoveredLayer === layer.id && selectedLayer === null ? 1.0 : 0.88;
    } else if (isGhost) {
      targetOp = 0.13;
    }

    if (usePoints && mat) {
      mat.uniforms.uOpacity.value += (targetOp - mat.uniforms.uOpacity.value) * 0.06;
      mat.uniforms.uTime.value     = t;
    }
    if (useInst && instanceMat) {
      mobileOpacity.current += (targetOp - mobileOpacity.current) * 0.06;
      instanceMat.opacity = mobileOpacity.current;
    }

    if (prefersReduced) {
      // Still push positions to mobile instances even with reduced motion
      if (useInst && inst) flushInstances(inst, curPos, colArray, count, tmpColor);
      return;
    }

    // ── Living Fibonacci Sphere ─────────────────────────────────────────────
    const { spin, wave, pulse } = fp;
    const safeN  = count > 0 ? count : 1;
    const { h: bH, s: bS, l: bL } = layerHSL;
    const lerpK  = isGhost ? 0.04 : 0.08;
    const GOLDEN = 2.3999632297;

    for (let i = 0; i < count; i++) {
      const ratio = i / safeN;
      const fy    = 1.0 - ratio * 2.0;
      const fr    = Math.sqrt(1.0 - fy * fy);
      const theta = GOLDEN * i + t * spin;

      const baseX = Math.cos(theta) * fr;
      const baseZ = Math.sin(theta) * fr;

      const waveAmt = Math.sin(i * 0.05 + t * pulse) * (wave * layer.radius);
      const finalR  = layer.radius + waveAmt;

      const tx = baseX * finalR;
      const ty = fy    * finalR;
      const tz = baseZ * finalR;

      curPos[i * 3]     += (tx - curPos[i * 3])     * lerpK;
      curPos[i * 3 + 1] += (ty - curPos[i * 3 + 1]) * lerpK;
      curPos[i * 3 + 2] += (tz - curPos[i * 3 + 2]) * lerpK;

      if (usePoints) {
        posArray[i * 3]     = curPos[i * 3];
        posArray[i * 3 + 1] = curPos[i * 3 + 1];
        posArray[i * 3 + 2] = curPos[i * 3 + 2];
      }

      const hShift  = Math.sin(i * 0.008) * 0.04;
      const litMult = 0.7 + 0.55 * ((waveAmt / (wave * layer.radius + 0.001)) * 0.5 + 0.5)
                          + 0.15 * Math.sin(i * 0.02 + t * pulse);
      const satMult = 0.80 + 0.20 * Math.sin(ratio * Math.PI * 2 + t * 0.4);

      const fh = ((bH + hShift) % 1 + 1) % 1;
      const fs = Math.min(1, Math.abs(bS * satMult));
      const fl = Math.min(1, Math.abs(bL * litMult));

      let r0 = fl, g0 = fl, b0 = fl;
      if (fs > 0) {
        const q  = fl < 0.5 ? fl * (1 + fs) : fl + fs - fl * fs;
        const p0 = 2 * fl - q;
        r0 = hue2rgb(p0, q, fh + 1/3);
        g0 = hue2rgb(p0, q, fh);
        b0 = hue2rgb(p0, q, fh - 1/3);
      }
      colArray[i * 3] = r0; colArray[i * 3 + 1] = g0; colArray[i * 3 + 2] = b0;
    }

    if (usePoints && pA && cA) { pA.needsUpdate = true; cA.needsUpdate = true; }
    if (useInst && inst) { flushInstances(inst, curPos, colArray, count, tmpColor); }
  });

  return (
    <group ref={groupRef} visible={isActive || isGhost}>

      {/* ── Desktop: GL_POINTS particle sphere ── */}
      {isHighQuality && pointsMaterial && (
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
          <primitive object={pointsMaterial} attach="material" />
        </points>
      )}

      {/* ── Mobile: InstancedMesh (proven to work on iOS — same approach as BlackHole) ── */}
      {!isHighQuality && instanceGeo && instanceMat && (
        <instancedMesh
          ref={instRef}
          args={[instanceGeo, instanceMat, count]}
          frustumCulled={false}
        />
      )}

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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Write curPos + colArray into an InstancedMesh's matrices and colors.
 *  Writes directly to the typed arrays for performance — no Object3D overhead. */
function flushInstances(
  mesh: THREE.InstancedMesh,
  pos: Float32Array,
  col: Float32Array,
  count: number,
  tmpColor: THREE.Color,
) {
  const matrices = mesh.instanceMatrix.array as Float32Array;
  for (let i = 0; i < count; i++) {
    const off = i * 16;
    // Identity rotation + unit scale, translation in column 3
    matrices[off]     = 1; matrices[off + 1]  = 0; matrices[off + 2]  = 0; matrices[off + 3]  = 0;
    matrices[off + 4] = 0; matrices[off + 5]  = 1; matrices[off + 6]  = 0; matrices[off + 7]  = 0;
    matrices[off + 8] = 0; matrices[off + 9]  = 0; matrices[off + 10] = 1; matrices[off + 11] = 0;
    matrices[off + 12] = pos[i * 3];
    matrices[off + 13] = pos[i * 3 + 1];
    matrices[off + 14] = pos[i * 3 + 2];
    matrices[off + 15] = 1;

    mesh.setColorAt(i, tmpColor.setRGB(col[i * 3], col[i * 3 + 1], col[i * 3 + 2]));
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}
