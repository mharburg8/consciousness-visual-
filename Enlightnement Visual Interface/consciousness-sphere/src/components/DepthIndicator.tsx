import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SORTED      = [...layers].sort((a, b) => b.radius - a.radius);
const PANEL_WIDTH = 420;

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
  const selectedLayer   = useExplorerStore((s) => s.selectedLayer);
  const bp              = useBreakpoint();

  const activeLayer = SORTED.find((l) => !dissolvedLayers.includes(l.id)) ?? null;

  const isPanelOpen = selectedLayer !== null;
  const leftOffset  = bp === 'desktop' && isPanelOpen ? -(PANEL_WIDTH / 2) : 0;

  if (!activeLayer) return null;

  // Only the very brightest sphere (layer 1, cream, lum > 0.75) gets dark text.
  // All others — including Great Void (lum≈0.69) — use white text.
  const lum         = luminance(activeLayer.hexColor);
  const useDarkText = lum > 0.75;
  const textPrimary = useDarkText ? '#0c0c18' : '#f4f0ea';
  const textDim     = useDarkText ? 'rgba(12,12,24,0.62)' : 'rgba(244,240,234,0.60)';
  const dividerCol  = useDarkText ? 'rgba(12,12,24,0.18)' : 'rgba(244,240,234,0.16)';

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
          left: `calc(50% + ${leftOffset}px)`,
          transform: 'translateX(-50%)',
          transition: 'left 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
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
            padding: '0.7rem 1.8rem 0.8rem',
            minWidth: '300px',
            maxWidth: '640px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.18rem',
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
              fontSize: '0.64rem',
              fontWeight: 600,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: textDim,
              whiteSpace: 'nowrap',
            }}>
              {dimLabel}{activeLayer.chartLocation ? `  ·  ${activeLayer.chartLocation}` : ''}
            </span>
          </div>

          {/* Row 2: large italic description */}
          {dimDesc && (
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

          {/* Divider */}
          <div style={{ width: '80%', height: 1, background: dividerCol, margin: '0.1rem 0' }} />

          {/* Row 3: emotions */}
          {activeLayer.levels.length > 0 && (
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 400,
              letterSpacing: '0.09em',
              color: textDim,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              {activeLayer.levels.join('  ·  ')}
            </span>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
