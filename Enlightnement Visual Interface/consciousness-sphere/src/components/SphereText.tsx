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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
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

/** 0–1 perceived brightness of a hex color */
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function firstNSentences(text: string, n: number): string {
  const cleaned = text.replace(/\n+/g, ' ').trim();
  let count = 0;
  let i = 0;
  while (i < cleaned.length && count < n) {
    const ch = cleaned[i];
    if (ch === '.' || ch === '!' || ch === '?') count++;
    i++;
  }
  return count >= n ? cleaned.slice(0, i) : cleaned;
}

function buildTexture(layer: Layer): THREE.CanvasTexture {
  const W = 4096;
  const H = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);

  // The sphere mesh is rotated π on Y so U=0.5 faces the camera (+Z).
  // 130° arc centered at U=0.5: column U offsets for -65°, -21.67°, +21.67°, +65°
  const colUs = [0.3194, 0.4398, 0.5602, 0.6806];
  const colCenters = colUs.map((u) => Math.round(u * W));
  // Each column gets ~85px text area per 4096 canvas (≈ 38.7° arc width)
  const colWidth = Math.round(0.082 * W); // ~336px

  const LAYER_SIZE = 68;
  const TITLE_SIZE = 52;
  const BODY_SIZE  = 42;
  const LINE_TITLE = TITLE_SIZE * 1.35;
  const LINE_BODY  = BODY_SIZE  * 1.6;

  // Adaptive colors based on sphere brightness
  const lum           = luminance(layer.hexColor);
  const isBright      = lum > 0.42;
  const shadowColor   = isBright ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.95)';
  const bodyTextColor = isBright ? '#1a1825'                : '#d0ccda';
  // For bright spheres, draw a soft dark scrim behind the text region
  if (isBright) {
    const scrimX = Math.round(colCenters[0] - colWidth * 0.6);
    const scrimW = Math.round(colCenters[3] - colCenters[0] + colWidth * 1.2);
    const scrimY = Math.round(H * 0.11);
    const scrimH = Math.round(H * 0.76);
    const grad = ctx.createLinearGradient(0, scrimY, 0, scrimY + scrimH);
    grad.addColorStop(0,   'rgba(4,6,15,0)');
    grad.addColorStop(0.1, 'rgba(4,6,15,0.55)');
    grad.addColorStop(0.9, 'rgba(4,6,15,0.55)');
    grad.addColorStop(1,   'rgba(4,6,15,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(scrimX, scrimY, scrimW, scrimH);
  }

  // ── Layer name ──────────────────────────────────────────────────────────
  ctx.save();
  ctx.shadowColor  = shadowColor;
  ctx.shadowBlur   = 20;
  ctx.font         = `300 italic ${LAYER_SIZE}px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle    = isBright ? '#0e1022' : layer.hexColor;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha  = 0.92;
  ctx.fillText(layer.name, W * 0.5, H * 0.16);
  ctx.restore();

  // Thin horizontal rule under layer name
  const ruleY = H * 0.20;
  const ruleHalf = Math.round(0.16 * W);
  ctx.save();
  ctx.strokeStyle = layer.hexColor;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.5 - ruleHalf, ruleY);
  ctx.lineTo(W * 0.5 + ruleHalf, ruleY);
  ctx.stroke();
  ctx.restore();

  // ── Facet columns ────────────────────────────────────────────────────────
  FACETS.forEach((facet, i) => {
    const cx = colCenters[i];
    let y    = H * 0.28;

    // Title
    ctx.save();
    ctx.shadowColor  = shadowColor;
    ctx.shadowBlur   = 16;
    ctx.font         = `500 ${TITLE_SIZE}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle    = isBright ? '#0e1022' : facet.color;
    ctx.globalAlpha  = 0.95;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const line of wrapText(ctx, facet.title, colWidth)) {
      ctx.fillText(line, cx, y);
      y += LINE_TITLE;
    }
    ctx.restore();

    // Separator
    y += TITLE_SIZE * 0.25;
    ctx.save();
    ctx.strokeStyle = isBright ? 'rgba(14,16,34,0.5)' : facet.color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(cx - colWidth * 0.38, y);
    ctx.lineTo(cx + colWidth * 0.38, y);
    ctx.stroke();
    ctx.restore();
    y += TITLE_SIZE * 0.5;

    // Body — first 3 sentences
    const snippet = firstNSentences(layer.facets[facet.key], 3);
    ctx.save();
    ctx.shadowColor  = shadowColor;
    ctx.shadowBlur   = 12;
    ctx.font         = `300 ${BODY_SIZE}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle    = bodyTextColor;
    ctx.globalAlpha  = 0.82;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const line of wrapText(ctx, snippet, colWidth).slice(0, 9)) {
      ctx.fillText(line, cx, y);
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
  const meshRef     = useRef<THREE.Mesh>(null);
  const opacityRef  = useRef(0);

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
      // Snap to invisible the moment dissolution begins
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
