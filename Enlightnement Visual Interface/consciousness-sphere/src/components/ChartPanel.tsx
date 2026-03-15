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

// Unified white palette — all text is white at varying opacity
const T_BRIGHT  = 'rgba(255,255,255,0.92)';
const T_MID     = 'rgba(255,255,255,0.62)';
const T_DIM     = 'rgba(255,255,255,0.38)';
const T_FAINT   = 'rgba(255,255,255,0.22)';
const FONT_SANS = 'DM Sans, system-ui, sans-serif';
const FONT_SER  = 'Cormorant Garamond, Georgia, serif';

export default function ChartPanel() {
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const bp              = useBreakpoint();

  if (bp !== 'desktop') return null;

  const activeLayer = SORTED.find((l) => !dissolvedLayers.includes(l.id)) ?? null;
  if (!activeLayer) return null;

  const c = activeLayer.hexColor;
  const dimLabel = activeLayer.name.includes(':')
    ? activeLayer.name.split(':')[0].trim()
    : activeLayer.name;
  const dimDesc = activeLayer.name.includes(':')
    ? activeLayer.name.split(':')[1].trim()
    : '';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeLayer.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.45, ease: [0.2, 0, 0.1, 1] }}
        style={{
          position: 'fixed',
          left: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 230,
          maxHeight: '78vh',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(160deg, ${hexToRgba(c, 0.20)} 0%, ${hexToRgba(c, 0.07)} 100%)`,
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          borderRadius: 14,
          border: `1px solid ${hexToRgba(c, 0.32)}`,
          boxShadow: `0 4px 40px ${hexToRgba(c, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.06)`,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '0.8rem 1rem 0.65rem',
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          background: hexToRgba(c, 0.10),
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: FONT_SANS,
            fontSize: '0.57rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: T_DIM,
            marginBottom: '0.18rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {dimLabel}{activeLayer.chartLocation ? `  ·  ${activeLayer.chartLocation}` : ''}
          </div>
          {dimDesc && (
            <div style={{
              fontFamily: FONT_SER,
              fontSize: '0.92rem',
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '0.35rem 1rem',
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          gap: '0.5rem',
        }}>
          {['State', 'View of Life'].map((label) => (
            <span key={label} style={{
              fontFamily: FONT_SANS,
              fontSize: '0.52rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: T_FAINT,
            }}>
              {label}
            </span>
          ))}
        </div>

        {/* ── Level rows ── */}
        <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {activeLayer.levelData.map((entry, i) => (
            <div
              key={entry.name}
              style={{
                padding: '0.42rem 1rem',
                borderBottom: i < activeLayer.levelData.length - 1
                  ? `1px solid rgba(255,255,255,0.05)`
                  : 'none',
              }}
            >
              {/* Level name — full width */}
              <div style={{
                fontFamily: FONT_SER,
                fontSize: '0.84rem',
                fontStyle: 'italic',
                fontWeight: 400,
                color: T_BRIGHT,
                lineHeight: 1.2,
                marginBottom: '0.18rem',
              }}>
                {entry.name}
              </div>

              {/* State + View of Life — 2-col, each with room to breathe */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                alignItems: 'baseline',
              }}>
                <span style={{
                  fontFamily: FONT_SANS,
                  fontSize: '0.68rem',
                  fontWeight: 400,
                  color: T_MID,
                  lineHeight: 1.2,
                }}>
                  {entry.emotionalState}
                </span>
                <span style={{
                  fontFamily: FONT_SANS,
                  fontSize: '0.65rem',
                  fontWeight: 300,
                  color: T_DIM,
                  fontStyle: 'italic',
                  lineHeight: 1.2,
                }}>
                  {entry.viewOfLife}
                </span>
              </div>

              {/* Key to transcending */}
              {entry.keyToTranscending && entry.keyToTranscending !== '—' && (
                <div style={{
                  marginTop: '0.14rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  <span style={{
                    width: 3, height: 3, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.22)',
                    display: 'inline-block',
                  }} />
                  <span style={{
                    fontFamily: FONT_SANS,
                    fontSize: '0.58rem',
                    fontWeight: 300,
                    color: T_FAINT,
                    letterSpacing: '0.02em',
                  }}>
                    {entry.keyToTranscending}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Footer: experience + state ── */}
        {(activeLayer.whatWeExperience || activeLayer.stateOfConsciousness) && (
          <div style={{
            padding: '0.6rem 1rem',
            borderTop: `1px solid rgba(255,255,255,0.08)`,
            background: hexToRgba(c, 0.10),
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}>
            {activeLayer.whatWeExperience && (
              <div>
                <div style={{
                  fontFamily: FONT_SANS,
                  fontSize: '0.5rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: T_FAINT,
                  marginBottom: '0.1rem',
                }}>
                  What We Experience
                </div>
                <div style={{
                  fontFamily: FONT_SER,
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: T_MID,
                  lineHeight: 1.3,
                }}>
                  {activeLayer.whatWeExperience}
                </div>
              </div>
            )}
            {activeLayer.stateOfConsciousness && (
              <div>
                <div style={{
                  fontFamily: FONT_SANS,
                  fontSize: '0.5rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: T_FAINT,
                  marginBottom: '0.1rem',
                }}>
                  State of Consciousness
                </div>
                <div style={{
                  fontFamily: FONT_SER,
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: T_MID,
                  lineHeight: 1.3,
                }}>
                  {activeLayer.stateOfConsciousness}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
