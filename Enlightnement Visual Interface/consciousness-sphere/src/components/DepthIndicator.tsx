import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SORTED = [...layers].sort((a, b) => b.radius - a.radius);
const PANEL_WIDTH = 420;

export default function DepthIndicator() {
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const selectedLayer   = useExplorerStore((s) => s.selectedLayer);
  const bp              = useBreakpoint();

  // Always show the outermost undissolved (active) layer as the header
  const activeLayer = SORTED.find((l) => !dissolvedLayers.includes(l.id)) ?? null;

  // Shift left on desktop when panel is open so header stays centered in scene
  const isPanelOpen = selectedLayer !== null;
  const leftOffset  = bp === 'desktop' && isPanelOpen ? -(PANEL_WIDTH / 2) : 0;

  // Split name into dimension label + description
  const [dimLabel, dimDesc] = activeLayer
    ? activeLayer.name.includes(':')
      ? [activeLayer.name.split(':')[0].trim(), activeLayer.name.split(':')[1].trim()]
      : [activeLayer.name, '']
    : ['', ''];

  return (
    <AnimatePresence mode="wait">
      {activeLayer && (
        <motion.div
          key={activeLayer.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0.1, 1] }}
          style={{
            position: 'fixed',
            top: '1.25rem',
            left: `calc(50% + ${leftOffset}px)`,
            transform: 'translateX(-50%)',
            transition: 'left 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
            zIndex: 30,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.1rem',
          }}
        >
          {/* Dimension label — small caps, colored */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.1, 0.85] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: activeLayer.hexColor,
                boxShadow: `0 0 8px ${activeLayer.hexColor}cc, 0 0 18px ${activeLayer.hexColor}44`,
                flexShrink: 0,
              }}
            />
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.62rem',
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: `${activeLayer.hexColor}cc`,
              textShadow: '0 1px 12px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
            }}>
              {dimLabel}
            </span>
          </div>

          {/* Main description — larger italic serif */}
          {dimDesc && (
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '1.05rem',
              fontWeight: 300,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
              color: 'rgba(240, 236, 230, 0.88)',
              textShadow: '0 1px 16px rgba(0,0,0,0.95), 0 0 32px rgba(0,0,0,0.7)',
              whiteSpace: 'nowrap',
            }}>
              {dimDesc}
            </span>
          )}

          {/* Emotions / levels — inline dot-separated */}
          {activeLayer.levels.length > 0 && (
            <span style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.6rem',
              fontWeight: 400,
              letterSpacing: '0.10em',
              color: `${activeLayer.hexColor}99`,
              textShadow: '0 1px 8px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
            }}>
              {activeLayer.levels.join(' · ')}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
