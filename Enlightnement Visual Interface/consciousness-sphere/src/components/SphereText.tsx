import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import type { Layer, FacetKey } from '../types';

const FACETS: { key: FacetKey; title: string; color: string }[] = [
  { key: 'experience', title: 'Experience',  color: '#e8e4df' },
  { key: 'veil',       title: 'The Veil',    color: '#9b95a0' },
  { key: 'dissolving', title: 'Dissolving',  color: '#c9a87c' },
  { key: 'signs',      title: 'Signs',       color: '#7a8fa8' },
];

const SORTED_LAYERS = [...layers].sort((a, b) => b.radius - a.radius);

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildTexture(layer: Layer): THREE.CanvasTexture {
  const W = 4096;
  const H = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);

  // ── Column layout: 4 facets spread 360° around the sphere ──────────────
  // The sphere mesh is rotated π on Y so U=0.5 faces the camera.
  // To avoid the seam (at U=0.0/1.0), we offset the whole arrangement by 45°
  // so NO facet is centered on the seam:
  //   Experience  → U = 0.625  (front-right, ~45° from camera center)
  //   The Veil    → U = 0.875  (right side)
  //   Dissolving  → U = 0.125  (left side)
  //   Signs       → U = 0.375  (front-left, ~45° from camera center)
  // 90° spacing between facets; each column is 78° wide (12° gap between cols).
  const COL_U   = [0.625, 0.875, 0.125, 0.375];
  const colCenters = COL_U.map((u) => Math.round(u * W));
  const colWidth   = Math.round((78 / 360) * W); // ~886px per column

  // Vertical range: keep text away from polar distortion.
  // U-mapping on sphere: V=0 = north pole, V=0.5 = equator, V=1 = south pole.
  // Stay between V=0.18 and V=0.80 to avoid pole squishing.
  const V_START = Math.round(H * 0.18); // top limit (below north-pole distortion zone)
  const V_END   = Math.round(H * 0.80); // bottom limit

  const TITLE_SIZE = 38;
  const BODY_SIZE  = 22;
  const LINE_TITLE = TITLE_SIZE * 1.3;
  const LINE_BODY  = BODY_SIZE  * 1.65;

  // Always use white text — the dark scrim provides contrast on light spheres.
  // No sphere color is opaque enough to make white-on-bright unreadable.
  const isBright      = false; // keep scrim logic path active but text stays white
  void luminance; // unused now
  const shadowColor   = 'rgba(0,0,0,0.95)';
  const bodyTextColor = '#e8e4f0';

  // Soft dark scrim over each column for bright spheres
  if (isBright) {
    COL_U.forEach((_, i) => {
      const cx = colCenters[i];
      const scrimX = cx - Math.round(colWidth * 0.56);
      const scrimW = Math.round(colWidth * 1.12);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0,    'rgba(4,6,15,0)');
      grad.addColorStop(0.12, 'rgba(4,6,15,0.62)');
      grad.addColorStop(0.88, 'rgba(4,6,15,0.62)');
      grad.addColorStop(1,    'rgba(4,6,15,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(scrimX, 0, scrimW, H);
    });
  }

  // ── Draw each facet column ────────────────────────────────────────────
  FACETS.forEach((facet, i) => {
    const cx = colCenters[i];
    let y    = V_START + TITLE_SIZE * 0.5;

    // Title
    ctx.save();
    ctx.shadowColor  = shadowColor;
    ctx.shadowBlur   = 16;
    ctx.font         = `500 ${TITLE_SIZE}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle    = isBright ? '#0a0a14' : facet.color;
    ctx.globalAlpha  = 0.96;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const line of wrapText(ctx, facet.title, colWidth * 0.85)) {
      if (y <= V_END) ctx.fillText(line, cx, y);
      y += LINE_TITLE;
    }
    ctx.restore();

    // Thin separator
    y += TITLE_SIZE * 0.15;
    if (y <= V_END) {
      ctx.save();
      ctx.strokeStyle = isBright ? 'rgba(10,10,20,0.35)' : facet.color;
      ctx.globalAlpha = 0.30;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(cx - colWidth * 0.32, y);
      ctx.lineTo(cx + colWidth * 0.32, y);
      ctx.stroke();
      ctx.restore();
    }
    y += TITLE_SIZE * 0.4;

    // Full body text — lines beyond V_END are simply not drawn
    const fullText = layer.facets[facet.key].replace(/\n+/g, ' ').trim();
    ctx.save();
    ctx.shadowColor  = shadowColor;
    ctx.shadowBlur   = 10;
    ctx.font         = `300 ${BODY_SIZE}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle    = bodyTextColor;
    ctx.globalAlpha  = 0.84;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const line of wrapText(ctx, fullText, colWidth * 0.88)) {
      if (y > V_END) break; // stop at equatorial band limit
      if (y >= V_START) ctx.fillText(line, cx, y);
      y += LINE_BODY;
    }
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

interface Props { layer: Layer }

export default function SphereText({ layer }: Props) {
  const meshRef    = useRef<THREE.Mesh>(null);
  const opacityRef = useRef(0);

  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const selectLayer     = useExplorerStore((s) => s.selectLayer);

  const activeLayerId = SORTED_LAYERS.find(
    (l) => !dissolvedLayers.includes(l.id),
  )?.id ?? null;

  const isActive     = layer.id === activeLayerId;
  const isDissolving = dissolvedLayers.includes(layer.id);

  const texture = useMemo(() => buildTexture(layer), [layer]);
  useEffect(() => () => { texture.dispose(); }, [texture]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;

    if (isDissolving) {
      opacityRef.current = 0;
    } else {
      const target = isActive ? 1 : 0;
      opacityRef.current += (target - opacityRef.current) * Math.min(delta * 2.2, 1);
    }

    mat.opacity = opacityRef.current;
    meshRef.current.visible = opacityRef.current > 0.004;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[0, Math.PI, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (isActive) selectLayer(layer.id);
      }}
    >
      <sphereGeometry args={[layer.radius + 0.06, 96, 48]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}
