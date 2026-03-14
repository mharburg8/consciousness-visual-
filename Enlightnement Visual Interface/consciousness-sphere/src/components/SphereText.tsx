import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Layer, FacetKey } from '../types';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';

// 4 facets placed at equal intervals across a 130° arc
const ARC_DEG = 130;
const FACET_ANGLES_DEG = [-65, -21.67, 21.67, 65];

const FACETS: { key: FacetKey; title: string; color: string }[] = [
  { key: 'experience', title: 'What You Experience', color: '#e8e4df' },
  { key: 'veil',       title: 'The Veil',             color: '#9b95a0' },
  { key: 'dissolving', title: 'How It Dissolves',     color: '#c9a87c' },
  { key: 'signs',      title: 'Signs of Thinning',    color: '#7a8fa8' },
];

// Sorted outermost → innermost
const SORTED_LAYERS = [...layers].sort((a, b) => b.radius - a.radius);

function firstSentence(text: string): string {
  const cleaned = text.replace(/\n/g, ' ').trim();
  const end = cleaned.search(/[.!?]/);
  const sentence = end > 0 ? cleaned.slice(0, end + 1) : cleaned.slice(0, 120);
  return sentence.length > 140 ? sentence.slice(0, 137) + '…' : sentence;
}

interface Props { layer: Layer }

export default function SphereText({ layer }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(0);

  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const setActiveFacet  = useExplorerStore((s) => s.setActiveFacet);
  const selectLayer     = useExplorerStore((s) => s.selectLayer);

  const activeLayerId = SORTED_LAYERS.find(
    (l) => !dissolvedLayers.includes(l.id)
  )?.id ?? null;

  const isActive = layer.id === activeLayerId;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = isActive ? 1 : 0;
    opacityRef.current += (target - opacityRef.current) * delta * 1.5;
    groupRef.current.visible = opacityRef.current > 0.01;
  });

  if (!isActive && opacityRef.current < 0.01) return null;

  // Text scale relative to sphere radius — readable from outside
  const fontSize      = Math.max(0.18, layer.radius * 0.038);
  const bodyFontSize  = Math.max(0.13, layer.radius * 0.026);
  const textRadius    = layer.radius + 0.3; // sit slightly above sphere surface
  const yTitle        = layer.radius * 0.08;
  const maxWidth      = layer.radius * 1.1;

  return (
    <group ref={groupRef}>
      {FACET_ANGLES_DEG.map((deg, i) => {
        const facet = FACETS[i];
        const rad   = (deg * Math.PI) / 180;
        const x     =  Math.sin(rad) * textRadius;
        const z     =  Math.cos(rad) * textRadius;
        const rotY  = -rad; // face outward from center

        const snippet = firstSentence(layer.facets[facet.key]);

        return (
          <group
            key={facet.key}
            position={[x, yTitle, z]}
            rotation={[0, rotY, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setActiveFacet(facet.key);
              selectLayer(layer.id);
            }}
          >
            {/* Facet title */}
            <Text
              fontSize={fontSize}
              color={layer.hexColor}
              anchorX="center"
              anchorY="bottom"
              maxWidth={maxWidth}
              textAlign="center"
              position={[0, fontSize * 0.6, 0]}
              outlineWidth={fontSize * 0.04}
              outlineColor="#000000"
            >
              {facet.title}
            </Text>

            {/* Separator line (thin rectangle) */}
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[layer.radius * 0.35, 0.015]} />
              <meshBasicMaterial
                color={layer.hexColor}
                transparent
                opacity={0.5}
              />
            </mesh>

            {/* First sentence excerpt */}
            <Text
              fontSize={bodyFontSize}
              color="#c8c4d0"
              anchorX="center"
              anchorY="top"
              maxWidth={maxWidth}
              textAlign="center"
              position={[0, -bodyFontSize * 0.4, 0]}
              outlineWidth={bodyFontSize * 0.05}
              outlineColor="#000000"
            >
              {snippet}
            </Text>
          </group>
        );
      })}

      {/* Layer name above the arc — centered at top of sphere */}
      <Text
        fontSize={fontSize * 1.4}
        color="#f0ece6"
        anchorX="center"
        anchorY="middle"
        position={[0, layer.radius * 0.85, textRadius * 0.82]}
        rotation={[-0.18, 0, 0]}
        outlineWidth={fontSize * 0.06}
        outlineColor="#000000"
        maxWidth={maxWidth * 1.4}
        textAlign="center"
      >
        {layer.name}
      </Text>
    </group>
  );
}
