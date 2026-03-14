import { useCallback, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import type { RefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import type { Layer } from '../types';
import useExplorerStore from '../stores/useExplorerStore';
import { useReducedMotion } from './useReducedMotion';

const DISSOLVE_DURATION = 0.6;
const RESTORE_DURATION = 0.8;
const CAMERA_DURATION = 1.2;
// Default camera position matching Scene.tsx <PerspectiveCamera position={[0, 2, 12]} />
const CAMERA_DEFAULT = { x: 0, y: 2, z: 12 } as const;

export interface SphereHandlers {
  onPointerEnter: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave: () => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}

/**
 * Shared interaction hook for SphereLayer.
 *
 * Each SphereLayer calls this hook, passing its own mesh/material refs.
 * The hook:
 *   - Returns R3F pointer/click event handlers
 *   - Watches selectedLayer from the store and drives GSAP animations:
 *       • Outer layers (id > selected): opacity → 0.05, scale → 1.05
 *       • Selected layer: emissive pulse + camera dolly to (layer.radius + 2.5)
 *       • Inner layers (id < selected): restore to base opacity / scale 1
 *       • Deselect (null): restore all, camera returns to default position
 *
 * NOTE: SphereLayer's useFrame should NOT lerp material.opacity when this hook
 * is in use — GSAP and useFrame lerp will fight over the same property.
 */
export function useSphereInteraction(
  layer: Layer,
  meshRef: RefObject<THREE.Mesh>,
  materialRef: RefObject<THREE.MeshPhysicalMaterial>
): SphereHandlers {
  const { camera } = useThree();
  const selectLayer = useExplorerStore((s) => s.selectLayer);
  const setHoveredLayer = useExplorerStore((s) => s.setHoveredLayer);
  const selectedLayer = useExplorerStore((s) => s.selectedLayer);
  const prefersReducedMotion = useReducedMotion();

  // Track previous selectedLayer so only the hook that WAS selected handles camera restore
  const prevSelectedRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevSelectedRef.current;
    prevSelectedRef.current = selectedLayer;

    const mesh = meshRef.current;
    const mat = materialRef.current;
    if (!mesh || !mat) return;

    // Kill any in-flight tweens on this mesh's animated properties
    gsap.killTweensOf(mat);
    gsap.killTweensOf(mesh.scale);

    if (selectedLayer === null) {
      // ── Deselect: restore this layer to idle state ────────────────────────
      if (prefersReducedMotion) {
        mat.opacity = layer.opacity;
        mesh.scale.set(1, 1, 1);
      } else {
        gsap.to(mat, {
          opacity: layer.opacity,
          duration: RESTORE_DURATION,
          ease: 'power2.out',
        });
        gsap.to(mesh.scale, {
          x: 1, y: 1, z: 1,
          duration: RESTORE_DURATION,
          ease: 'power2.out',
        });
      }

      // Camera return — only the hook that WAS selected restores the camera
      if (prev === layer.id) {
        gsap.killTweensOf(camera.position);
        if (prefersReducedMotion) {
          camera.position.set(CAMERA_DEFAULT.x, CAMERA_DEFAULT.y, CAMERA_DEFAULT.z);
        } else {
          gsap.to(camera.position, {
            ...CAMERA_DEFAULT,
            duration: CAMERA_DURATION,
            ease: 'power2.inOut',
          });
        }
      }
    } else if (layer.id === selectedLayer) {
      // ── Selected layer: emissive pulse (skipped for reduced motion) + camera dolly in ─────
      if (!prefersReducedMotion) {
        mat.emissive.set(layer.hexColor);
        gsap.fromTo(
          mat,
          { emissiveIntensity: 0 },
          {
            emissiveIntensity: 0.35,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'power1.inOut',
          }
        );
      }

      gsap.killTweensOf(camera.position);
      if (prefersReducedMotion) {
        camera.position.set(0, 0, layer.radius + 2.5);
      } else {
        gsap.to(camera.position, {
          x: 0,
          y: 0,
          z: layer.radius + 2.5,
          duration: CAMERA_DURATION,
          ease: 'power2.inOut',
        });
      }
    } else if (layer.id > selectedLayer) {
      // ── Outer layers: dissolve — opacity fade only for reduced motion ─────
      if (prefersReducedMotion) {
        mat.opacity = 0.05;
      } else {
        gsap.to(mat, {
          opacity: 0.05,
          duration: DISSOLVE_DURATION,
          ease: 'power2.out',
        });
        gsap.to(mesh.scale, {
          x: 1.05, y: 1.05, z: 1.05,
          duration: DISSOLVE_DURATION,
          ease: 'power2.out',
        });
      }
    } else {
      // ── Inner layers (id < selectedLayer): ensure they stay at base opacity
      if (prefersReducedMotion) {
        mat.opacity = layer.opacity;
        mesh.scale.set(1, 1, 1);
      } else {
        gsap.to(mat, {
          opacity: layer.opacity,
          duration: DISSOLVE_DURATION,
          ease: 'power2.out',
        });
        gsap.to(mesh.scale, {
          x: 1, y: 1, z: 1,
          duration: DISSOLVE_DURATION,
          ease: 'power2.out',
        });
      }
    }
  }, [selectedLayer, prefersReducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ layer, camera, meshRef, materialRef are stable across renders — safe to omit

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      selectLayer(layer.id);
    },
    [layer.id, selectLayer]
  );

  const onPointerEnter = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHoveredLayer(layer.id);
      document.body.style.cursor = 'pointer';
    },
    [layer.id, setHoveredLayer]
  );

  const onPointerLeave = useCallback(() => {
    setHoveredLayer(null);
    document.body.style.cursor = 'auto';
  }, [setHoveredLayer]);

  return { onPointerEnter, onPointerLeave, onClick };
}
