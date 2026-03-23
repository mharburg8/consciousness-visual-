import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';

const TOTAL = layers.length;
// Radius sized so dot fills ~30% of 52° FOV at dist 0.5, 100%+ at dist 0.08
const DOT_RADIUS = 0.072;

export default function VoidCenter() {
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  // Activates at same threshold as the black hole (TOTAL-1 dissolved)
  const isActive = dissolvedLayers.length >= TOTAL - 1;

  const voidMeshRef = useRef<THREE.Mesh>(null);
  const dotMeshRef  = useRef<THREE.Mesh>(null);
  const masterFade  = useRef(0);

  const voidGeo = useMemo(() => new THREE.SphereGeometry(9, 32, 32), []);
  const dotGeo  = useMemo(() => new THREE.SphereGeometry(DOT_RADIUS, 24, 24), []);

  // The void uses FrontSide + inward-flipped normals via a trick:
  // We scale it to -1 on one axis so face winding inverts, keeping depth writes
  // working correctly from the inside without the BackSide far-hemisphere bleed.
  // Simpler: just use BackSide but ONLY enable when camera is inside the sphere.
  const voidMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0,
    depthWrite: true,
  }), []);

  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
  }), []);

  useFrame(({ camera, clock }, delta) => {
    const dist = camera.position.length();
    const t    = clock.getElapsedTime();

    masterFade.current += ((isActive ? 1 : 0) - masterFade.current) * Math.min(1, delta * 1.5);
    const gf = masterFade.current;

    if (gf < 0.005) {
      if (voidMeshRef.current) voidMeshRef.current.visible = false;
      if (dotMeshRef.current)  dotMeshRef.current.visible  = false;
      return;
    }

    // ── Void sphere ───────────────────────────────────────────────────────
    // Only show when camera is clearly INSIDE the sphere (dist < 8.8).
    // This prevents the BackSide far-hemisphere from appearing as a black wall
    // when the camera is still outside, blocking the user from entering.
    const insideSphere = dist < 8.8;
    const voidOp = insideSphere
      ? THREE.MathUtils.clamp(1 - (dist - 1.8) / 6.2, 0, 1) * gf
      : 0;
    voidMat.opacity = voidOp;
    if (voidMeshRef.current) voidMeshRef.current.visible = voidOp > 0.005;

    // ── White dot ─────────────────────────────────────────────────────────
    // Visible as soon as black hole activates. Fades only if camera clips
    // through it (dist < 0.05). No upper fade — dot is always the beacon.
    const dotOp =
      THREE.MathUtils.clamp((dist - 0.04) / 0.20, 0, 1) * gf;
    dotMat.opacity = dotOp;
    if (dotMeshRef.current) {
      dotMeshRef.current.visible = dotOp > 0.005;
      // Slow heartbeat — draws the eye
      dotMeshRef.current.scale.setScalar(1 + 0.10 * Math.sin(t * 0.9));
    }
  });

  return (
    <group>
      {/* Black void — the surrounding darkness once inside */}
      <mesh ref={voidMeshRef} geometry={voidGeo} renderOrder={-2} visible={false}>
        <primitive object={voidMat} attach="material" />
      </mesh>

      {/* Pure Consciousness — the white dot the user journeys toward */}
      <mesh ref={dotMeshRef} geometry={dotGeo} renderOrder={4} visible={false}>
        <primitive object={dotMat} attach="material" />
      </mesh>
    </group>
  );
}
