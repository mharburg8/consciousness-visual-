import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import { LEVEL_FACETS } from '../data/levelFacets';
import type { FacetKey } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SORTED = [...layers].sort((a, b) => b.radius - a.radius);

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const LEVEL_GRADIENTS: Record<string, [string, string, boolean?]> = {
  'Shame':               ['#1a0000', '#2d0a0a'],
  'Guilt':               ['#2d0a0a', '#3d1010'],
  'Apathy':              ['#3d1010', '#5c1a1a'],
  'Grief':               ['#5c1a1a', '#7a2020'],
  'Fear':                ['#7a2020', '#8b2500'],
  'Desire':              ['#8b2500', '#a33000'],
  'Anger':               ['#a33000', '#b84000'],
  'Pride':               ['#b84000', '#cc5500'],
  'Courage':             ['#cc5500', '#d4820a'],
  'Neutrality':          ['#d4820a', '#b8a800'],
  'Willingness':         ['#b8a800', '#7aaa00'],
  'Acceptance':          ['#7aaa00', '#3a9900'],
  'Inner Light/Reason':  ['#3a9900', '#008870'],
  'Inner Wisdom':        ['#008870', '#007799'],
  'Inner Love':          ['#007799', '#005599'],
  'Oneness/Joy':         ['#005599', '#0033aa'],
  'Presence/Peace':      ['#0033aa', '#2200aa'],
  'Non-Duality':         ['#2200aa', '#5500aa'],
  'Awareness':           ['#5500aa', '#7700bb'],
  'The Great Void':      ['#7700bb', '#9900cc'],
  'Divine Grace & Love': ['#9900cc', '#bb44dd', true],
  'Supra Causal Truth':  ['#bb44dd', '#ddaaee', true],
  'Full Consciousness':  ['#ddaaee', '#ffffff', true],
};

function midHex(a: string, b: string): string {
  const lerp = (ca: number, cb: number) => Math.round(ca + (cb - ca) * 0.5);
  const r  = lerp(parseInt(a.slice(1,3),16), parseInt(b.slice(1,3),16));
  const g  = lerp(parseInt(a.slice(3,5),16), parseInt(b.slice(3,5),16));
  const bv = lerp(parseInt(a.slice(5,7),16), parseInt(b.slice(5,7),16));
  return `rgb(${r},${g},${bv})`;
}

function getLevelStyle(name: string): { bg: string; border: string; color: string } {
  const g = LEVEL_GRADIENTS[name];
  if (!g) return { bg: 'transparent', border: 'transparent', color: T_BRIGHT };
  const [from, to, dark] = g;
  return {
    bg:     `linear-gradient(to right, ${from}, ${to})`,
    border: midHex(from, to),
    color:  dark ? '#111111' : 'rgba(255,255,255,0.92)',
  };
}

const T_BRIGHT  = 'rgba(255,255,255,0.92)';
const T_MID     = 'rgba(255,255,255,0.62)';
const T_DIM     = 'rgba(255,255,255,0.38)';
const T_FAINT   = 'rgba(255,255,255,0.20)';
const FONT_SANS = 'DM Sans, system-ui, sans-serif';
const FONT_SER  = 'Cormorant Garamond, Georgia, serif';

const TAB_W       = 56;   // drag + toggle tab width
const MIN_PANEL_W = 480;  // wide enough that 5-col grid stays readable
const MAX_PANEL_W = 860;
const DEFAULT_W   = 520;

const FACET_KEYS: FacetKey[] = ['experience', 'veil', 'dissolving', 'signs'];
const FACET_LABELS: Record<FacetKey, string> = {
  experience: 'Experience',
  veil:       'The Veil',
  dissolving: 'Dissolving',
  signs:      'Signs',
};
const FACET_TITLES: Record<FacetKey, { title: string; italic: string }> = {
  experience: { title: 'What You Experience', italic: 'Here' },
  veil:       { title: 'What Keeps This Layer', italic: 'Opaque' },
  dissolving: { title: 'How This Layer', italic: 'Dissolves' },
  signs:      { title: 'Signs of', italic: 'Thinning' },
};

const MOBILE_COLS = '72px 76px 84px 84px 84px 80px 64px';

export default function ChartPanel() {
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const bp              = useBreakpoint();
  const isMobile        = bp === 'mobile';

  const [collapsed,   setCollapsed]   = useState(false);
  const [panelWidth,  setPanelWidth]  = useState(DEFAULT_W);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [activeFacet, setActiveFacet] = useState<FacetKey>('experience');

  useLayoutEffect(() => {
    setCollapsed(window.innerWidth < 768);
  }, []);

  const activeLayer = SORTED.find((l) => !dissolvedLayers.includes(l.id)) ?? null;

  // Reset selected level when active layer changes
  useEffect(() => {
    setSelectedLevel(null);
    setActiveFacet('experience');
  }, [activeLayer?.id]);

  // ── Tab: drag to resize + click to toggle ──────────────────────────────
  const tabDragRef = useRef<{ startX: number; startWidth: number; moved: boolean } | null>(null);

  const handleTabPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    tabDragRef.current = { startX: e.clientX, startWidth: panelWidth, moved: false };

    const onMove = (ev: PointerEvent) => {
      if (!tabDragRef.current) return;
      const delta = tabDragRef.current.startX - ev.clientX;
      if (Math.abs(delta) > 5) tabDragRef.current.moved = true;
      if (tabDragRef.current.moved) {
        // Dragging right increases width (panel is on the left)
        setPanelWidth(Math.min(MAX_PANEL_W, Math.max(MIN_PANEL_W, tabDragRef.current.startWidth - delta)));
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

  if (!activeLayer) return null;

  const c = activeLayer.hexColor;
  const dimLabel = activeLayer.name.includes(':')
    ? activeLayer.name.split(':')[0].trim()
    : activeLayer.name;
  const dimDesc = activeLayer.name.includes(':')
    ? activeLayer.name.split(':')[1].trim()
    : '';

  const leftPos     = isMobile ? '0rem' : '1.5rem';
  const padH        = isMobile ? '0.55rem' : '1.1rem';
  const headerFontL = isMobile ? '1.11rem' : '1.32rem';
  const headerFontS = isMobile ? '0.69rem' : '0.78rem';
  const rowPad      = isMobile ? '0.38rem' : '0.48rem';
  const levelFont   = isMobile ? '1.02rem' : '1.17rem';
  const dataFont    = isMobile ? '0.86rem' : '0.93rem';
  const dimFont     = isMobile ? '0.75rem' : '0.86rem';

  const GRID_COLS  = '1fr 1fr 1.1fr 1.1fr 1.2fr';
  const STICKY_BG  = 'rgba(6, 9, 20, 0.97)';
  const effectiveW = isMobile
    ? Math.min(typeof window !== 'undefined' ? window.innerWidth - TAB_W - 8 : 320, 380)
    : panelWidth;

  const rowCount = activeLayer.levelData.length;
  const maxVH    = isMobile ? '80vh' : '78vh';
  // Mobile: estimated height (mobile has horizontal scroll grid, needs fixed height)
  // Desktop table view: 'auto' so panel grows to fit content exactly — no scroll for short layers
  // Desktop detail view: full height so facet content fills the space
  const panelH = isMobile
    ? (selectedLevel ? maxVH : `min(${maxVH}, calc(${rowCount * 4.6}rem + 13rem))`)
    : (selectedLevel ? maxVH : 'auto');

  // ── Level detail view ─────────────────────────────────────────────────
  const levelDetail = selectedLevel ? (() => {
    const facets = LEVEL_FACETS[selectedLevel];
    const ls = getLevelStyle(selectedLevel);
    const facetTitle = FACET_TITLES[activeFacet];
    const paragraphs = (facets?.[activeFacet] ?? '')
      .split('\n\n').map(p => p.trim()).filter(Boolean);

    return (
      <>
        {/* ── Detail header ── */}
        <div style={{
          padding: `0.7rem ${padH} 0.6rem`,
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          background: hexToRgba(c, 0.10),
          flexShrink: 0,
        }}>
          {/* Back button */}
          <button
            onClick={() => setSelectedLevel(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: T_MID, fontFamily: FONT_SANS, fontSize: '0.75rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '0 0 0.6rem 0', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T_BRIGHT)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T_MID)}
          >
            <span style={{ fontSize: '0.85rem' }}>←</span> Back to {dimLabel}
          </button>

          {/* Level name */}
          <div style={{
            fontFamily: FONT_SER,
            fontSize: headerFontL,
            fontStyle: 'italic',
            fontWeight: 400,
            color: ls.color === '#111111' ? ls.border : T_BRIGHT,
            lineHeight: 1.2,
            padding: `0.35rem ${padH === '1.1rem' ? '0' : '0'}`,
            background: ls.bg,
            borderLeft: `3px solid ${ls.border}`,
            borderRadius: '3px',
            paddingLeft: '0.6rem',
            marginBottom: '0.1rem',
          }}>
            {selectedLevel}
          </div>
        </div>

        {/* ── Facet tabs ── */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          flexShrink: 0,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {FACET_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveFacet(key)}
              style={{
                flex: 1, padding: '0.5rem 0.4rem',
                background: activeFacet === key
                  ? hexToRgba(c, 0.22)
                  : 'transparent',
                border: 'none',
                borderBottom: activeFacet === key
                  ? `2px solid ${c}`
                  : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: FONT_SANS,
                fontSize: isMobile ? '0.65rem' : '0.72rem',
                fontWeight: activeFacet === key ? 600 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeFacet === key ? T_BRIGHT : T_DIM,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {FACET_LABELS[key]}
            </button>
          ))}
        </div>

        {/* ── Facet content ── */}
        <div style={{
          overflowY: 'auto', flex: 1, minHeight: 0,
          padding: `1rem ${padH} 2rem`,
          scrollbarWidth: 'thin',
          scrollbarColor: `${hexToRgba(c, 0.4)} transparent`,
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{
              fontFamily: FONT_SER,
              fontSize: '0.95rem',
              fontWeight: 300,
              fontStyle: 'italic',
              color: c,
              letterSpacing: '0.02em',
              lineHeight: 1.3,
              marginBottom: '0.5rem',
            }}>
              {facetTitle.title} <em style={{ fontWeight: 400 }}>{facetTitle.italic}</em>
            </p>
            <div style={{ height: 1, width: '2.5rem', background: hexToRgba(c, 0.6) }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paragraphs.length > 0 ? paragraphs.map((para, i) => (
              <p key={i} style={{
                fontFamily: FONT_SANS,
                fontSize: i === 0 ? '0.88rem' : '0.82rem',
                lineHeight: i === 0 ? 1.82 : 1.78,
                color: i === 0 ? T_BRIGHT : T_MID,
                fontWeight: i === 0 ? 400 : 300,
              }}>
                {para}
              </p>
            )) : (
              <p style={{ fontFamily: FONT_SANS, fontSize: '0.82rem', color: T_DIM, fontStyle: 'italic' }}>
                No content available for this facet.
              </p>
            )}
          </div>
        </div>
      </>
    );
  })() : null;

  // ── Table view ────────────────────────────────────────────────────────
  const tableView = (
    <>
      {/* ── Header ── */}
      <div style={{
        padding: `0.7rem ${padH} 0.6rem`,
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        background: hexToRgba(c, 0.10),
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: FONT_SANS, fontSize: headerFontS, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: T_DIM, marginBottom: '0.15rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {dimLabel}{!isMobile && activeLayer.chartLocation ? `  ·  ${activeLayer.chartLocation}` : ''}
        </div>
        {dimDesc && (
          <div style={{
            fontFamily: FONT_SER, fontSize: headerFontL,
            fontStyle: 'italic', fontWeight: 400,
            color: T_BRIGHT, lineHeight: 1.2,
          }}>
            {dimDesc}
          </div>
        )}
        {/* Click hint */}
        <div style={{
          fontFamily: FONT_SANS, fontSize: '0.62rem',
          letterSpacing: '0.1em', color: T_FAINT,
          marginTop: '0.3rem', fontStyle: 'italic',
        }}>
          tap a row to explore
        </div>
      </div>

      {/* ── Removal indicator ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: `0.5rem ${padH} 0.4rem`,
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: FONT_SER, fontSize: headerFontL,
          fontWeight: 400, fontStyle: 'italic',
          letterSpacing: '0.1em', color: hexToRgba(c, 0.75),
        }}>
          ↓ Removal
        </span>
      </div>

      {/* ── Desktop column headers ── */}
      {!isMobile && (
        <div style={{
          display: 'grid', gridTemplateColumns: GRID_COLS,
          padding: `0.3rem ${padH}`,
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          gap: '0.9rem', flexShrink: 0,
        }}>
          {['State', 'View of Life', 'Removal', 'Experience', 'Consciousness'].map(lbl => (
            <span key={lbl} style={{
              fontFamily: FONT_SANS, fontSize: '0.72rem', fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: T_FAINT,
            }}>
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* ── Level rows ── */}
      {isMobile ? (
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <div style={{
            position: 'absolute', inset: 0, overflow: 'auto',
            WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
            scrollbarWidth: 'thin',
            scrollbarColor: `${hexToRgba(c, 0.5)} transparent`,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: MOBILE_COLS }}>
              {(['Level', 'State', 'View of Life', 'Removal', 'Experience', 'Consciousness', 'Location'] as const).map((lbl, ci) => (
                <div key={lbl} style={{
                  fontFamily: FONT_SANS, fontSize: '0.6rem', fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: T_FAINT,
                  padding: `0.28rem ${ci === 0 ? padH : '0.3rem'} 0.22rem`,
                  borderBottom: `1px solid rgba(255,255,255,0.08)`,
                  ...(ci === 0 ? { position: 'sticky' as const, left: 0, zIndex: 2, background: STICKY_BG } : {}),
                }}>
                  {lbl}
                </div>
              ))}
              {[...activeLayer.levelData].reverse().map((entry, i) => {
                const isLast = i === activeLayer.levelData.length - 1;
                const ls = getLevelStyle(entry.name);
                const cells = [
                  { text: entry.name,              style: { fontFamily: FONT_SER, fontSize: levelFont, fontStyle: 'italic', fontWeight: 400, color: ls.color } },
                  { text: entry.emotionalState,    style: { fontFamily: FONT_SANS, fontSize: dataFont, fontWeight: 400, color: ls.color } },
                  { text: entry.viewOfLife,        style: { fontFamily: FONT_SANS, fontSize: dimFont,  fontWeight: 300, color: ls.color, fontStyle: 'italic', opacity: 0.8 } },
                  { text: entry.keyToTranscending, style: { fontFamily: FONT_SANS, fontSize: dimFont,  fontWeight: 400, color: ls.color } },
                  { text: entry.experience,        style: { fontFamily: FONT_SANS, fontSize: dimFont,  fontWeight: 300, color: ls.color, fontStyle: 'italic', opacity: 0.8 } },
                  { text: entry.consciousness,     style: { fontFamily: FONT_SANS, fontSize: dimFont,  fontWeight: 300, color: ls.color, opacity: 0.65 } },
                  { text: entry.location,          style: { fontFamily: FONT_SANS, fontSize: dimFont,  fontWeight: 300, color: ls.color, opacity: 0.65 } },
                ];
                return cells.map((cell, ci) => (
                  <div
                    key={`${entry.name}-${ci}`}
                    onClick={ci === 0 ? () => { setSelectedLevel(entry.name); setActiveFacet('experience'); } : undefined}
                    style={{
                      padding: `${rowPad} ${ci === 0 ? padH : '0.3rem'}`,
                      borderBottom: isLast ? 'none' : `1px solid rgba(0,0,0,0.28)`,
                      overflow: 'hidden',
                      cursor: ci === 0 ? 'pointer' : 'default',
                      ...(ci === 0 ? {
                        position: 'sticky' as const, left: 0, zIndex: 1,
                        background: STICKY_BG, borderLeft: `3px solid ${ls.border}`,
                      } : { background: ls.bg }),
                    }}
                  >
                    <span style={{
                      ...cell.style, lineHeight: 1.25,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                    }}>
                      {cell.text}
                    </span>
                  </div>
                ));
              })}
            </div>
          </div>
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 28,
            background: `linear-gradient(to left, ${hexToRgba(c, 0.85)}, transparent)`,
            pointerEvents: 'none', zIndex: 3,
          }} />
        </div>
      ) : (
        <div style={{ overflowY: 'auto', maxHeight: `calc(${maxVH} - 10rem)`, scrollbarWidth: 'thin', scrollbarColor: `${hexToRgba(c, 0.5)} transparent`, paddingBottom: '1.5rem' }}>
          {[...activeLayer.levelData].reverse().map((entry, i) => {
            const ls = getLevelStyle(entry.name);
            return (
              <div
                key={entry.name}
                onClick={() => { setSelectedLevel(entry.name); setActiveFacet('experience'); }}
                style={{
                  padding: `${rowPad} ${padH}`,
                  borderBottom: i < activeLayer.levelData.length - 1
                    ? `1px solid rgba(0,0,0,0.28)` : 'none',
                  background: ls.bg,
                  borderLeft: `3px solid ${ls.border}`,
                  cursor: 'pointer',
                  transition: 'filter 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
              >
                <div style={{
                  fontFamily: FONT_SER, fontSize: levelFont,
                  fontStyle: 'italic', fontWeight: 400,
                  color: ls.color, lineHeight: 1.2, marginBottom: '0.14rem',
                }}>
                  {entry.name}
                  <span style={{ fontFamily: FONT_SANS, fontSize: '0.6rem', letterSpacing: '0.12em', marginLeft: '0.6rem', opacity: 0.5, fontStyle: 'normal' }}>
                    explore →
                  </span>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: GRID_COLS,
                  gap: '0.9rem', marginBottom: '0.1rem', alignItems: 'baseline',
                }}>
                  <span style={{ fontFamily: FONT_SANS, fontSize: dataFont, fontWeight: 400, color: ls.color, lineHeight: 1.2 }}>
                    {entry.emotionalState}
                  </span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 300, color: ls.color, fontStyle: 'italic', lineHeight: 1.2, opacity: 0.75 }}>
                    {entry.viewOfLife}
                  </span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 400, color: ls.color, lineHeight: 1.2 }}>
                    {entry.keyToTranscending}
                  </span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 300, color: ls.color, fontStyle: 'italic', lineHeight: 1.2, opacity: 0.75 }}>
                    {entry.experience}
                  </span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 300, color: ls.color, lineHeight: 1.2, opacity: 0.65 }}>
                    {entry.consciousness}
                    {entry.location ? <span style={{ opacity: 0.55 }}> · {entry.location}</span> : null}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div
      style={{
        position: 'fixed', left: leftPos, top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 25, pointerEvents: 'none',
        overflowX: 'clip' as React.CSSProperties['overflowX'],
        width: effectiveW + TAB_W,
        maxHeight: isMobile ? '80vh' : '78vh',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayer.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: collapsed ? -effectiveW : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          style={{ display: 'flex', alignItems: 'stretch' }}
        >
          {/* ── Panel content ── */}
          <div
            style={{
              width: effectiveW, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              background: `linear-gradient(160deg, ${hexToRgba(c, 0.20)} 0%, ${hexToRgba(c, 0.07)} 100%)`,
              backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
              borderRadius: '14px',
              border: `1px solid ${hexToRgba(c, 0.32)}`,
              boxShadow: `0 4px 40px ${hexToRgba(c, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.06)`,
              overflow: 'hidden',
              height: panelH,
              maxHeight: maxVH,
              pointerEvents: 'all',
            }}
          >
            <AnimatePresence mode="wait">
              {selectedLevel ? (
                <motion.div
                  key={`detail-${selectedLevel}-${activeFacet}`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22 }}
                  style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
                >
                  {levelDetail}
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 18 }}
                  transition={{ duration: 0.22 }}
                  style={{ display: 'flex', flexDirection: 'column', height: isMobile ? '100%' : 'auto', overflow: 'hidden' }}
                >
                  {tableView}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Tab: drag to resize + click to toggle ── */}
          <button
            onPointerDown={handleTabPointerDown}
            aria-label={collapsed ? 'Show chart panel' : 'Hide chart panel'}
            style={{
              width: TAB_W, alignSelf: 'center', flexShrink: 0,
              background: hexToRgba(c, 0.38),
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${hexToRgba(c, 0.50)}`,
              borderRadius: '0 12px 12px 0',
              marginLeft: '2px',
              cursor: 'ew-resize', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '12px 0', gap: '8px',
              boxShadow: `4px 0 16px ${hexToRgba(c, 0.22)}`,
              transition: 'background 0.2s',
              pointerEvents: 'all',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(c, 0.60);
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(c, 0.38);
            }}
          >
            {/* Arrow */}
            <span style={{
              color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', lineHeight: 1,
              display: 'inline-block',
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}>◀</span>

            {/* "drag out" */}
            <span style={{
              writingMode: 'vertical-rl' as React.CSSProperties['writingMode'],
              transform: 'rotate(180deg)',
              fontSize: '0.6rem', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontFamily: FONT_SANS,
              color: 'rgba(255,255,255,0.65)', lineHeight: 1, whiteSpace: 'nowrap',
            }}>drag out</span>

            {/* Divider */}
            <span style={{ width: 20, height: 1, background: hexToRgba(c, 0.5) }} />

            {/* "click to hide/open" */}
            <span style={{
              writingMode: 'vertical-rl' as React.CSSProperties['writingMode'],
              transform: 'rotate(180deg)',
              fontSize: '0.6rem', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontFamily: FONT_SANS,
              color: 'rgba(255,255,255,0.45)', lineHeight: 1, whiteSpace: 'nowrap',
            }}>{collapsed ? 'click to open' : 'click to hide'}</span>
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
