import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import FacetTabs from './FacetTabs';
import type { FacetKey } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

// Per-layer gradient colors — [darkest, mid, brightest]
const LAYER_GRADIENTS: Record<number, [string, string, string]> = {
  7: ['#3a0606', '#b81a10', '#e04828'],
  6: ['#9a2e06', '#d85818', '#e8922a'],
  5: ['#706000', '#b8a010', '#d8c830'],
  4: ['#1a5808', '#48a010', '#78c828'],
  3: ['#084838', '#10987a', '#28c8a0'],
  2: ['#08107a', '#2048b8', '#4070e0'],
  1: ['#180860', '#6018b0', '#a040d8'],
};

const FACET_TITLES: Record<FacetKey, { title: string; italic: string }> = {
  experience: { title: 'What You Experience', italic: 'Here' },
  veil:       { title: 'What Keeps This Layer', italic: 'Opaque' },
  dissolving: { title: 'How This Layer', italic: 'Dissolves' },
  signs:      { title: 'Signs of', italic: 'Thinning' },
};

const TAB_W       = 56;   // collapse + drag tab width
const MIN_PANEL_W = 320;
const MAX_PANEL_W = 820;
const DEFAULT_W   = 440;

// Sort once — outermost first
const SORTED_LAYERS = [...layers].sort((a, b) => b.radius - a.radius);

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function InfoPanel() {
  const selectedLayer   = useExplorerStore((s) => s.selectedLayer);
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const selectLayer     = useExplorerStore((s) => s.selectLayer);
  const activeFacet     = useExplorerStore((s) => s.activeFacet);
  const bp              = useBreakpoint();

  // Derive active layer (outermost un-dissolved)
  const activeLayerId = SORTED_LAYERS.find(l => !dissolvedLayers.includes(l.id))?.id ?? null;
  // Show selected layer if clicked, otherwise auto-show the active layer
  const displayLayerId = selectedLayer ?? activeLayerId;
  const layer = displayLayerId !== null
    ? layers.find((l) => l.id === displayLayerId) ?? null
    : null;

  const [collapsed,  setCollapsed]  = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_W);

  const isDesktop   = bp === 'desktop';
  const panelHeight = bp === 'tablet' ? '60vh' : '82vh';

  // Desktop: open automatically when active layer changes
  useEffect(() => {
    if (isDesktop && activeLayerId !== null) setCollapsed(false);
  }, [activeLayerId, isDesktop]);

  // Mobile: start collapsed when layer changes
  useEffect(() => {
    if (!isDesktop && displayLayerId !== null) setCollapsed(true);
  }, [displayLayerId, isDesktop]);

  // Escape closes explicit selection (falls back to active layer)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') selectLayer(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectLayer]);

  // ── Tab: drag to resize OR click to toggle (desktop only) ──────────────
  const tabDragRef = useRef<{ startX: number; startWidth: number; moved: boolean } | null>(null);

  const handleTabPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    tabDragRef.current = { startX: e.clientX, startWidth: panelWidth, moved: false };

    const onMove = (ev: PointerEvent) => {
      if (!tabDragRef.current) return;
      const delta = tabDragRef.current.startX - ev.clientX;
      if (Math.abs(delta) > 5) tabDragRef.current.moved = true;
      if (tabDragRef.current.moved) {
        // Dragging left increases width; dragging right decreases
        setPanelWidth(Math.min(MAX_PANEL_W, Math.max(MIN_PANEL_W, tabDragRef.current.startWidth + delta)));
        // Ensure panel is visible while resizing
        setCollapsed(false);
      }
    };
    const onUp = () => {
      if (tabDragRef.current && !tabDragRef.current.moved) {
        setCollapsed((s) => !s);
      }
      tabDragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [panelWidth]);

  // ── Mobile swipe-to-dismiss / tap-to-expand ──────────────────────────────
  const dragStartY = useRef<number | null>(null);
  const handleDragHandlePointerDown = (e: React.PointerEvent) => { dragStartY.current = e.clientY; };
  const handleDragHandlePointerUp   = (e: React.PointerEvent) => {
    if (dragStartY.current !== null) {
      const delta = e.clientY - dragStartY.current;
      if (delta > 70)          selectLayer(null);
      else if (Math.abs(delta) < 10) setCollapsed((s) => !s);
    }
    dragStartY.current = null;
  };

  const paragraphs = layer
    ? layer.facets[activeFacet].split('\n\n').map((p) => p.trim()).filter(Boolean)
    : [];
  const facetLabel = layer ? FACET_TITLES[activeFacet] : null;

  // ── Gradient background for the panel ────────────────────────────────────
  const panelBg = (direction: string) => {
    if (!layer) return '#06080f';
    const [dark, mid, bright] = LAYER_GRADIENTS[layer.id] ?? [layer.hexColor, layer.hexColor, layer.hexColor];
    return `linear-gradient(${direction}, ${bright}50 0%, ${mid}3a 35%, ${dark}48 75%, #06080f 100%)`;
  };

  // ── Shared panel body ─────────────────────────────────────────────────────
  const panelBody = layer ? (
    <>
      {/* ── HEADER ── */}
      <div style={{
        padding: isDesktop ? '2rem 2rem 1rem' : '0.75rem 1.25rem 0.5rem',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: layer.hexColor,
              boxShadow: `0 0 8px ${layer.hexColor}bb`,
              display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.68rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'rgba(220,216,228,0.7)',
            }}>
              Layer {8 - layer.id} inward · {layer.chartLocation}
            </span>
          </div>
          {selectedLayer !== null && (
            <button
              onClick={() => selectLayer(null)}
              aria-label="Close panel"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(180,174,190,0.5)', padding: '4px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#e8e4df')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(180,174,190,0.5)')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: isDesktop ? '2rem' : '1.65rem',
          fontWeight: 300, lineHeight: 1.15, letterSpacing: '0.015em',
          color: '#f0ece6', marginBottom: '0.35rem',
        }}>
          {layer.name.includes(':') ? (
            <>
              <span style={{ color: 'rgba(232,228,223,0.55)', fontSize: '0.75em', display: 'block', marginBottom: '0.1em', letterSpacing: '0.08em' }}>
                {layer.name.split(':')[0]}
              </span>
              <em style={{ fontStyle: 'italic', color: '#f0ece6' }}>
                {layer.name.split(':')[1].trim()}
              </em>
            </>
          ) : layer.name}
        </h2>

        <p style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '0.8rem', color: `${layer.hexColor}ee`,
          letterSpacing: '0.04em', fontStyle: 'italic', marginBottom: '1.25rem',
        }}>
          {layer.subtitle}
        </p>

        <div style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '0.75rem', letterSpacing: '0.06em',
          color: 'rgba(180,174,190,0.65)', lineHeight: 1.8, marginBottom: '0.4rem',
        }}>
          {layer.levels.map((lvl, i) => (
            <span key={lvl}>
              <span style={{ color: `${layer.hexColor}cc` }}>{lvl}</span>
              {i < layer.levels.length - 1 && (
                <span style={{ margin: '0 0.35em', color: `${layer.hexColor}55` }}>·</span>
              )}
            </span>
          ))}
        </div>

        {layer.levelData.length > 0 && (
          <div style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: '0.68rem', letterSpacing: '0.05em',
            color: 'rgba(180,174,190,0.42)', lineHeight: 1.8,
            fontStyle: 'italic', marginBottom: '1.25rem',
          }}>
            {layer.levelData.map((e, i) => (
              <span key={e.name}>
                {e.emotionalState}
                {i < layer.levelData.length - 1 && (
                  <span style={{ margin: '0 0.35em', color: `${layer.hexColor}44` }}>·</span>
                )}
              </span>
            ))}
          </div>
        )}

        <div style={{ height: 1, background: `linear-gradient(to right, ${layer.hexColor}88, transparent)` }} />
      </div>

      {/* ── FACET TABS ── */}
      <div style={{ padding: '0 2rem', flexShrink: 0 }}>
        <FacetTabs layerColor={layer.hexColor} />
      </div>

      {/* ── FACET CONTENT ── scrollable */}
      <div
        id={`facet-panel-${activeFacet}`}
        role="tabpanel"
        aria-labelledby={`facet-tab-${activeFacet}`}
        aria-live="polite"
        style={{
          flex: 1, overflowY: 'auto', minHeight: 0,
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
          padding: isDesktop ? '1.5rem 2rem 4rem' : '1rem 1.25rem 2rem',
          scrollbarWidth: 'thin',
          scrollbarColor: `${layer.hexColor}55 transparent`,
        }}
      >
        {facetLabel && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.05rem', fontWeight: 300,
              color: `${layer.hexColor}ff`, fontStyle: 'italic',
              letterSpacing: '0.02em', lineHeight: 1.3, marginBottom: '0.65rem',
            }}>
              {facetLabel.title} <em style={{ fontWeight: 400 }}>{facetLabel.italic}</em>
            </p>
            <div style={{ height: 1, width: '3rem', background: `${layer.hexColor}99` }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {paragraphs.map((para, i) => (
            <p key={i} style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: i === 0 ? '0.935rem' : '0.865rem',
              lineHeight: i === 0 ? 1.85 : 1.8,
              color: i === 0 ? 'rgba(232,228,223,0.92)' : 'rgba(200,196,210,0.78)',
              fontWeight: i === 0 ? 400 : 300,
            }}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </>
  ) : null;

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    const totalW = TAB_W + panelWidth;
    return (
      <AnimatePresence>
        {layer && (
          <motion.div
            key="desktop-panel"
            initial={{ x: panelWidth + TAB_W }}
            animate={{ x: collapsed ? panelWidth : 0 }}
            exit={{ x: panelWidth + TAB_W }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'fixed', right: 0, top: 0, height: '100%',
              width: totalW,
              overflowX: 'clip' as React.CSSProperties['overflowX'],
              zIndex: 40, display: 'flex', pointerEvents: 'all',
            }}
          >
            {/* ── Tab: drag to resize + click to toggle ── */}
            <button
              onPointerDown={handleTabPointerDown}
              aria-label={collapsed ? 'Show info panel' : 'Hide info panel'}
              style={{
                width: TAB_W, alignSelf: 'center', flexShrink: 0,
                background: hexToRgba(layer.hexColor, 0.40),
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${hexToRgba(layer.hexColor, 0.55)}`,
                borderRight: 'none', borderRadius: '12px 0 0 12px',
                cursor: 'ew-resize', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '12px 0', gap: '8px',
                boxShadow: `-4px 0 16px ${hexToRgba(layer.hexColor, 0.25)}`,
                transition: 'background 0.2s',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(layer.hexColor, 0.65);
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(layer.hexColor, 0.40);
              }}
            >
              {/* Arrow */}
              <span style={{
                color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', lineHeight: 1,
                display: 'inline-block',
                transform: collapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s ease',
              }}>▶</span>

              {/* Vertical label: "drag out" */}
              <span style={{
                writingMode: 'vertical-rl' as React.CSSProperties['writingMode'],
                transform: 'rotate(180deg)',
                fontSize: '0.6rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontFamily: 'DM Sans, system-ui, sans-serif',
                color: 'rgba(255,255,255,0.65)', lineHeight: 1, whiteSpace: 'nowrap',
              }}>drag out</span>

              {/* Divider */}
              <span style={{ width: 20, height: 1, background: `${hexToRgba(layer.hexColor, 0.5)}` }} />

              {/* Vertical label: "click to hide / open" */}
              <span style={{
                writingMode: 'vertical-rl' as React.CSSProperties['writingMode'],
                transform: 'rotate(180deg)',
                fontSize: '0.6rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontFamily: 'DM Sans, system-ui, sans-serif',
                color: 'rgba(255,255,255,0.45)', lineHeight: 1, whiteSpace: 'nowrap',
              }}>{collapsed ? 'click to open' : 'click to hide'}</span>
            </button>

            {/* ── Panel body ── */}
            <aside
              role="complementary"
              aria-label={`Details for ${layer.name}`}
              style={{
                width: panelWidth, height: '100%',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                borderLeft: `3px solid ${(LAYER_GRADIENTS[layer.id] ?? [layer.hexColor])[1]}`,
                boxShadow: `inset 4px 0 40px ${(LAYER_GRADIENTS[layer.id] ?? [layer.hexColor])[1]}40, -8px 0 40px rgba(0,0,0,0.6)`,
                background: panelBg('175deg'),
                backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
              }}
            >
              {panelBody}
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── MOBILE / TABLET ───────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {layer && (
        <motion.aside
          key="info-panel-mobile"
          initial={{ y: '100%', opacity: 0 }}
          animate={collapsed ? { y: 'calc(100% - 44px)', opacity: 1 } : { y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          role="complementary"
          aria-label={`Details for ${layer.name}`}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: panelHeight, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', zIndex: 40,
            borderTop: `2px solid ${(LAYER_GRADIENTS[layer.id] ?? [layer.hexColor])[1]}`,
            boxShadow: `0 -4px 40px ${(LAYER_GRADIENTS[layer.id] ?? [layer.hexColor])[1]}55`,
            background: panelBg('180deg'),
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <div
            onPointerDown={handleDragHandlePointerDown}
            onPointerUp={handleDragHandlePointerUp}
            style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px', cursor: 'pointer', touchAction: 'none', flexShrink: 0 }}
          >
            <div style={{ width: 36, height: 3, borderRadius: 9999, background: `${layer.hexColor}99` }} />
          </div>
          {panelBody}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
