import { useState, useCallback, useRef, KeyboardEvent } from 'react';
import { layers } from '../data/layers';
import type { FacetKey } from '../types';

const FACETS: { key: FacetKey; label: string; title: string }[] = [
  { key: 'experience', label: 'Experience', title: 'What You Experience Here' },
  { key: 'veil',       label: 'The Veil',   title: 'What Keeps This Layer Opaque' },
  { key: 'dissolving', label: 'Dissolving', title: 'How This Layer Dissolves' },
  { key: 'signs',      label: 'Signs',      title: 'Signs of Thinning' },
];

// FEAR↔LOVE threshold is between layer 7 (id=7) and layer 6 (id=6)
const THRESHOLD_AFTER_ID = 7;

function FacetSection({
  label,
  title,
  content,
  isOpen,
  onToggle,
  id,
  headingId,
}: {
  facetKey?: FacetKey;
  label: string;
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
  headingId: string;
}) {
  const paragraphs = content.split('\n\n').filter(Boolean);

  return (
    <div className="border-t border-white/5">
      <button
        id={headingId}
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-warm)] focus-visible:ring-inset"
      >
        <span>{label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        id={id}
        role="region"
        aria-labelledby={headingId}
        hidden={!isOpen}
      >
        <div className="px-4 pb-5">
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--accent-warm)', fontFamily: 'var(--font-body)' }}
          >
            {title}
          </p>
          <div className="space-y-4">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LayerAccordionItem({
  layer,
  isOpen,
  onToggle,
  layerIndex,
  totalLayers,
}: {
  layer: (typeof layers)[number];
  isOpen: boolean;
  onToggle: () => void;
  layerIndex: number;
  totalLayers: number;
}) {
  const [openFacets, setOpenFacets] = useState<Set<FacetKey>>(new Set());
  const headerId = `layer-header-${layer.id}`;
  const panelId = `layer-panel-${layer.id}`;

  const toggleFacet = useCallback((key: FacetKey) => {
    setOpenFacets(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }, [onToggle]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(10, 14, 26, 0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Layer header button */}
      <button
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`${layer.name} — Layer ${totalLayers - layerIndex} of ${totalLayers}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full flex items-start gap-4 px-5 py-4 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-warm)] focus-visible:ring-inset transition-colors hover:bg-white/[0.03]"
      >
        {/* Color swatch */}
        <span
          className="mt-1 shrink-0 w-3 h-3 rounded-full ring-1 ring-white/10"
          style={{ backgroundColor: layer.hexColor }}
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0">
          <span
            className="block text-base font-medium leading-snug"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {layer.name}
          </span>
          <span
            className="block text-sm mt-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {layer.subtitle}
          </span>
          {!isOpen && (
            <span
              className="block text-xs mt-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {layer.levels.join(' · ')}
            </span>
          )}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 mt-1 transition-transform duration-200 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Layer content panel */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isOpen}
      >
        {/* Levels list */}
        <div className="px-5 pt-1 pb-4">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Levels within this layer
          </p>
          <div className="flex flex-wrap gap-2">
            {layer.levels.map(level => (
              <span
                key={level}
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{
                  background: `${layer.hexColor}22`,
                  border: `1px solid ${layer.hexColor}44`,
                  color: 'var(--text-secondary)',
                }}
              >
                {level}
              </span>
            ))}
          </div>
        </div>

        {/* Facets */}
        {FACETS.map(facet => (
          <FacetSection
            key={facet.key}
            facetKey={facet.key}
            label={facet.label}
            title={facet.title}
            content={layer.facets[facet.key]}
            isOpen={openFacets.has(facet.key)}
            onToggle={() => toggleFacet(facet.key)}
            id={`facet-panel-${layer.id}-${facet.key}`}
            headingId={`facet-header-${layer.id}-${facet.key}`}
          />
        ))}
      </div>
    </div>
  );
}

function ThresholdBadge() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg my-1"
      style={{ background: 'rgba(212,160,74,0.08)', border: '1px solid rgba(212,160,74,0.2)' }}
      aria-label="FEAR to LOVE threshold — the most significant transition on the map"
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: 'var(--threshold-glow)', boxShadow: '0 0 8px var(--threshold-glow)' }}
        aria-hidden="true"
      />
      <span className="text-xs" style={{ color: 'var(--threshold-glow)' }}>
        FEAR ↔ LOVE threshold — this is where contraction meets expansion
      </span>
    </div>
  );
}

export default function TextModeAccordion() {
  const [openLayer, setOpenLayer] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const toggleLayer = useCallback((id: number) => {
    setOpenLayer(prev => (prev === id ? null : id));
  }, []);

  // Arrow key navigation between layer headers
  const handleListKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const headers = listRef.current?.querySelectorAll<HTMLButtonElement>('[id^="layer-header-"]');
    if (!headers) return;
    const arr = Array.from(headers);
    const focused = document.activeElement as HTMLElement;
    const idx = arr.indexOf(focused as HTMLButtonElement);
    if (idx === -1) return;
    e.preventDefault();
    const next = e.key === 'ArrowDown' ? arr[idx + 1] : arr[idx - 1];
    next?.focus();
  }, []);

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1
            className="text-3xl font-light mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Map of Consciousness
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Seven layers of experience — not a ladder to climb, but veils to dissolve.
            Explore each layer and its four facets below.
          </p>
        </header>

        {/* Layers */}
        <div
          ref={listRef}
          role="list"
          aria-label="Consciousness layers, outermost to innermost"
          className="space-y-3"
          onKeyDown={handleListKeyDown}
        >
          {layers.map((layer, idx) => (
            <div role="listitem" key={layer.id}>
              <LayerAccordionItem
                layer={layer}
                isOpen={openLayer === layer.id}
                onToggle={() => toggleLayer(layer.id)}
                layerIndex={idx}
                totalLayers={layers.length}
              />
              {layer.id === THRESHOLD_AFTER_ID && <ThresholdBadge />}
            </div>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-white/5 text-center">
          <p
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            You are not climbing. You are seeing through.
          </p>
        </footer>
      </div>
    </div>
  );
}
