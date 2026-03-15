import { useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SORTED = [...layers].sort((a, b) => b.radius - a.radius);

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const T_BRIGHT  = 'rgba(255,255,255,0.92)';
const T_MID     = 'rgba(255,255,255,0.62)';
const T_DIM     = 'rgba(255,255,255,0.38)';
const T_FAINT   = 'rgba(255,255,255,0.20)';
const FONT_SANS = 'DM Sans, system-ui, sans-serif';
const FONT_SER  = 'Cormorant Garamond, Georgia, serif';

const TAB_W = 28; // px — tab button width

export default function ChartPanel() {
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const bp              = useBreakpoint();
  const isMobile        = bp === 'mobile';

  // Desktop: wide enough for 4 columns; mobile: near full-width
  const panelWidth = isMobile
    ? Math.min(typeof window !== 'undefined' ? window.innerWidth - TAB_W - 8 : 320, 380)
    : 420;

  const leftPos    = isMobile ? '0rem' : '1.5rem';
  const padH       = isMobile ? '0.55rem' : '0.85rem';
  const headerFontL = isMobile ? '0.74rem' : '0.88rem';
  const headerFontS = isMobile ? '0.46rem' : '0.52rem';
  const rowPad      = isMobile ? '0.28rem' : '0.36rem';
  const levelFont   = isMobile ? '0.68rem' : '0.78rem';
  const dataFont    = isMobile ? '0.57rem' : '0.62rem';
  const dimFont     = isMobile ? '0.5rem'  : '0.57rem';

  // Mobile starts collapsed; desktop starts open
  const [collapsed, setCollapsed] = useState(false);
  useLayoutEffect(() => {
    setCollapsed(window.innerWidth < 768);
  }, []);

  const activeLayer = SORTED.find((l) => !dissolvedLayers.includes(l.id)) ?? null;
  if (!activeLayer) return null;

  const c = activeLayer.hexColor;
  const dimLabel = activeLayer.name.includes(':')
    ? activeLayer.name.split(':')[0].trim()
    : activeLayer.name;
  const dimDesc = activeLayer.name.includes(':')
    ? activeLayer.name.split(':')[1].trim()
    : '';

  // Desktop: 4-col grid columns
  const GRID_COLS = '1fr 1fr 1.1fr 1.2fr';

  return (
    <>
      {/*
        CENTERING FIX:
        Outer div owns top:50% + translateY(-50%) with pure CSS.
        The inner motion.div animates only translateX for collapse.
        The two transforms never compete.
      */}
      <div
        style={{
          position: 'fixed',
          left: leftPos,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 25,
          pointerEvents: 'none',
          // Clip the panel when it slides left past this edge
          overflowX: 'clip' as React.CSSProperties['overflowX'],
          width: panelWidth + TAB_W,
          maxHeight: isMobile ? '80vh' : '78vh',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: collapsed ? -panelWidth : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              height: '100%',
            }}
          >
            {/* ── Panel content ── */}
            <div style={{
              width: panelWidth,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              background: `linear-gradient(160deg, ${hexToRgba(c, 0.20)} 0%, ${hexToRgba(c, 0.07)} 100%)`,
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              borderRadius: '14px 0 0 14px',
              border: `1px solid ${hexToRgba(c, 0.32)}`,
              borderRight: 'none',
              boxShadow: `0 4px 40px ${hexToRgba(c, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.06)`,
              overflow: 'hidden',
              maxHeight: isMobile ? '80vh' : '78vh',
            }}>

              {/* ── Header ── */}
              <div style={{
                padding: `0.7rem ${padH} 0.6rem`,
                borderBottom: `1px solid rgba(255,255,255,0.08)`,
                background: hexToRgba(c, 0.10),
                flexShrink: 0,
              }}>
                <div style={{
                  fontFamily: FONT_SANS,
                  fontSize: headerFontS,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: T_DIM,
                  marginBottom: '0.15rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {dimLabel}{!isMobile && activeLayer.chartLocation ? `  ·  ${activeLayer.chartLocation}` : ''}
                </div>
                {dimDesc && (
                  <div style={{
                    fontFamily: FONT_SER,
                    fontSize: headerFontL,
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: T_BRIGHT,
                    lineHeight: 1.2,
                  }}>
                    {dimDesc}
                  </div>
                )}
              </div>

              {/* ── Column headers ── */}
              {isMobile ? (
                <div style={{
                  padding: `0.28rem ${padH} 0.22rem`,
                  borderBottom: `1px solid rgba(255,255,255,0.06)`,
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginBottom: '0.12rem' }}>
                    {['State', 'View of Life'].map(lbl => (
                      <span key={lbl} style={{ fontFamily: FONT_SANS, fontSize: '0.45rem', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: T_FAINT }}>{lbl}</span>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                    {['Removal', 'Experience'].map(lbl => (
                      <span key={lbl} style={{ fontFamily: FONT_SANS, fontSize: '0.45rem', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: T_FAINT }}>{lbl}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: GRID_COLS,
                  padding: `0.3rem ${padH}`,
                  borderBottom: `1px solid rgba(255,255,255,0.06)`,
                  gap: '0.4rem',
                  flexShrink: 0,
                }}>
                  {['State', 'View of Life', 'Removal', 'Experience'].map(lbl => (
                    <span key={lbl} style={{
                      fontFamily: FONT_SANS,
                      fontSize: '0.48rem',
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: T_FAINT,
                    }}>
                      {lbl}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Level rows ── */}
              <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>
                {activeLayer.levelData.map((entry, i) => (
                  <div
                    key={entry.name}
                    style={{
                      padding: `${rowPad} ${padH}`,
                      borderBottom: i < activeLayer.levelData.length - 1
                        ? `1px solid rgba(255,255,255,0.05)`
                        : 'none',
                    }}
                  >
                    {/* Level name — full width */}
                    <div style={{
                      fontFamily: FONT_SER,
                      fontSize: levelFont,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: T_BRIGHT,
                      lineHeight: 1.2,
                      marginBottom: '0.14rem',
                    }}>
                      {entry.name}
                    </div>

                    {/* Data grid */}
                    {isMobile ? (
                      <>
                        {/* Mobile row 1: State | View */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.08rem' }}>
                          <span style={{ fontFamily: FONT_SANS, fontSize: dataFont, fontWeight: 400, color: T_MID, lineHeight: 1.2 }}>
                            {entry.emotionalState}
                          </span>
                          <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 300, color: T_DIM, fontStyle: 'italic', lineHeight: 1.2 }}>
                            {entry.viewOfLife}
                          </span>
                        </div>
                        {/* Mobile row 2: Removal | Experience */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.08rem' }}>
                          <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 400, color: T_MID, lineHeight: 1.2 }}>
                            {entry.keyToTranscending}
                          </span>
                          <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 300, color: T_DIM, fontStyle: 'italic', lineHeight: 1.2 }}>
                            {entry.experience}
                          </span>
                        </div>
                      </>
                    ) : (
                      /* Desktop: 4-col grid */
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: GRID_COLS,
                        gap: '0.4rem',
                        marginBottom: '0.1rem',
                        alignItems: 'baseline',
                      }}>
                        <span style={{ fontFamily: FONT_SANS, fontSize: dataFont, fontWeight: 400, color: T_MID, lineHeight: 1.2 }}>
                          {entry.emotionalState}
                        </span>
                        <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 300, color: T_DIM, fontStyle: 'italic', lineHeight: 1.2 }}>
                          {entry.viewOfLife}
                        </span>
                        <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 400, color: T_MID, lineHeight: 1.2 }}>
                          {entry.keyToTranscending}
                        </span>
                        <span style={{ fontFamily: FONT_SANS, fontSize: dimFont, fontWeight: 300, color: T_DIM, fontStyle: 'italic', lineHeight: 1.2 }}>
                          {entry.experience}
                        </span>
                      </div>
                    )}

                    {/* Second line: Consciousness · Location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.22rem' }}>
                      <span style={{ fontFamily: FONT_SANS, fontSize: '0.48rem', fontWeight: 300, color: T_FAINT, lineHeight: 1.2 }}>
                        {entry.consciousness}
                      </span>
                      <span style={{ color: T_FAINT, fontSize: '0.4rem' }}>·</span>
                      <span style={{ fontFamily: FONT_SANS, fontSize: '0.48rem', fontWeight: 300, color: T_FAINT, lineHeight: 1.2 }}>
                        {entry.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Collapse/expand tab — right edge ── */}
            <button
              onClick={() => setCollapsed((s) => !s)}
              aria-label={collapsed ? 'Show chart panel' : 'Hide chart panel'}
              style={{
                width: TAB_W,
                minHeight: 56,
                alignSelf: 'center',
                flexShrink: 0,
                background: hexToRgba(c, 0.28),
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${hexToRgba(c, 0.40)}`,
                borderLeft: 'none',
                borderRadius: '0 10px 10px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'all',
                padding: 0,
              }}
            >
              <span style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '0.85rem',
                lineHeight: 1,
                display: 'inline-block',
                transform: collapsed ? 'none' : 'rotate(180deg)',
                transition: 'transform 0.3s ease',
              }}>
                ▶
              </span>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
