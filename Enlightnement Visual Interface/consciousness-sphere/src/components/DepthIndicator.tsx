import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SORTED = [...layers].sort((a, b) => b.radius - a.radius);

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export default function DepthIndicator() {
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const bp              = useBreakpoint();

  // activeLayer is null when all dissolved OR when only innermost (Layer 1) remains
  // and black hole is active — both cases show the void/pure consciousness header.
  const activeLayer = SORTED.find((l) => !dissolvedLayers.includes(l.id)) ?? null;
  const showVoidHeader = !activeLayer || dissolvedLayers.length >= SORTED.length - 1;

  const isMobile    = bp === 'mobile';

  // Always white text — the sphere-tinted frosted card provides enough contrast
  // for all layers, including the lightest (Great Void, Supra-Causal).
  void luminance; // kept for potential future use
  const textPrimary = '#f4f0ea';
  const textDim     = 'rgba(244,240,234,0.62)';
  const dividerCol  = 'rgba(244,240,234,0.16)';

  // When all layers dissolved OR Layer 1 (black hole) is active — show Pure Consciousness header
  if (showVoidHeader) {
    return (
      <AnimatePresence mode="wait">
      <div
        key="pure-consciousness-wrapper"
        style={{
          position: 'fixed',
          top: '0.9rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          key="pure-consciousness"
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.55, ease: [0.2, 0, 0.1, 1] }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 4px 32px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.12)',
            padding: isMobile ? '0.38rem 0.9rem 0.42rem' : '0.7rem 1.8rem 0.8rem',
            minWidth: isMobile ? 0 : '300px',
            maxWidth: isMobile ? 'min(88vw, 360px)' : '640px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isMobile ? '0.1rem' : '0.18rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                display: 'inline-block',
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: '#ffffff',
              }}
            />
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: isMobile ? '0.52rem' : '0.64rem',
              fontWeight: 600,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
              whiteSpace: 'nowrap',
            }}>
              Pure Consciousness · Pure Consciousness
            </span>
          </div>

          {!isMobile && (
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.55rem',
              fontWeight: 400,
              fontStyle: 'italic',
              letterSpacing: '0.01em',
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
            }}>
              Pure Consciousness
            </span>
          )}
          {isMobile && (
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '0.95rem',
              fontWeight: 400,
              fontStyle: 'italic',
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.15,
            }}>
              Pure Consciousness
            </span>
          )}

          <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.15)', margin: '0.1rem 0' }} />

          <span style={{
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: isMobile ? '0.6rem' : '0.78rem',
            fontWeight: 400,
            letterSpacing: '0.09em',
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}>
            Supra-Causal Truth  ·  Full Consciousness
          </span>

          {!isMobile && (
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.66rem',
              fontWeight: 300,
              letterSpacing: '0.07em',
              color: 'rgba(255,255,255,0.28)',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              Ineffable  ·  Ineffable
            </span>
          )}
        </motion.div>
      </div>
      </AnimatePresence>
    );
  }

  const colonIdx = activeLayer.name.indexOf(':');
  const dimLabel = colonIdx >= 0 ? activeLayer.name.slice(0, colonIdx).trim() : activeLayer.name;
  const dimDesc  = colonIdx >= 0 ? activeLayer.name.slice(colonIdx + 1).trim() : '';

  return (
    <AnimatePresence mode="wait">
      {/* Outer div owns the position/centering so framer-motion scale doesn't break translateX */}
      <div
        key={activeLayer.id}
        style={{
          position: 'fixed',
          top: '0.9rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.2, 0, 0.1, 1] }}
          style={{
            background: hexToRgba(activeLayer.hexColor, 0.60),
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: '16px',
            border: `1px solid ${hexToRgba(activeLayer.hexColor, 0.80)}`,
            boxShadow: `0 4px 32px ${hexToRgba(activeLayer.hexColor, 0.30)}, inset 0 1px 0 rgba(255,255,255,0.08)`,
            padding: isMobile ? '0.38rem 0.9rem 0.42rem' : '0.7rem 1.8rem 0.8rem',
            minWidth: isMobile ? 0 : '300px',
            maxWidth: isMobile ? 'min(88vw, 360px)' : '640px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isMobile ? '0.1rem' : '0.18rem',
          }}
        >
          {/* Row 1: dimension label + chart location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <motion.span
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                display: 'inline-block',
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: textPrimary,
                opacity: 0.75,
              }}
            />
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: isMobile ? '0.52rem' : '0.64rem',
              fontWeight: 600,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: textDim,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? '70vw' : undefined,
            }}>
              {dimLabel}{!isMobile && activeLayer.chartLocation ? `  ·  ${activeLayer.chartLocation}` : ''}
            </span>
          </div>

          {/* Row 2: large italic description — hidden on mobile to save space */}
          {dimDesc && !isMobile && (
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.55rem',
              fontWeight: 400,
              fontStyle: 'italic',
              letterSpacing: '0.01em',
              color: textPrimary,
              textAlign: 'center',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
            }}>
              {dimDesc}
            </span>
          )}
          {/* Row 2 mobile: smaller version */}
          {dimDesc && isMobile && (
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '0.95rem',
              fontWeight: 400,
              fontStyle: 'italic',
              color: textPrimary,
              textAlign: 'center',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80vw',
            }}>
              {dimDesc}
            </span>
          )}

          {/* Divider */}
          <div style={{ width: '80%', height: 1, background: dividerCol, margin: '0.1rem 0' }} />

          {/* Row 3: level names */}
          {activeLayer.levels.length > 0 && (
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: isMobile ? '0.6rem' : '0.78rem',
              fontWeight: 400,
              letterSpacing: '0.09em',
              color: textDim,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? '86vw' : undefined,
            }}>
              {activeLayer.levels.join('  ·  ')}
            </span>
          )}

          {/* Row 4: associated emotional states — hidden on mobile to save space */}
          {activeLayer.levelData.length > 0 && !isMobile && (
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.66rem',
              fontWeight: 300,
              letterSpacing: '0.07em',
              color: 'rgba(244,240,234,0.38)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontStyle: 'italic',
            }}>
              {activeLayer.levelData.map((e) => e.emotionalState).join('  ·  ')}
            </span>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
