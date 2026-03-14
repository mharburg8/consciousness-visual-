import { motion, AnimatePresence } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';

const SORTED = [...layers].sort((a, b) => b.radius - a.radius);

export default function NextLayerButton() {
  const dissolvedLayers = useExplorerStore((s) => s.dissolvedLayers);
  const dissolveLayer   = useExplorerStore((s) => s.dissolveLayer);
  const resetDissolved  = useExplorerStore((s) => s.resetDissolved);
  const selectedLayer   = useExplorerStore((s) => s.selectedLayer);

  // Active = outermost undissolved
  const active = SORTED.find((l) => !dissolvedLayers.includes(l.id)) ?? null;
  // Next = one layer in from active
  const activeIdx = active ? SORTED.findIndex((l) => l.id === active.id) : -1;
  const next      = SORTED[activeIdx + 1] ?? null;

  // Don't show when panel is open
  if (selectedLayer !== null) return null;

  const allDissolved = dissolvedLayers.length >= SORTED.length;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={allDissolved ? 'reset' : 'next'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0.1, 1] }}
        style={{
          position: 'fixed',
          bottom: '5.5rem', // above LayerNav
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 34,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem',
          pointerEvents: 'all',
        }}
      >
        {allDissolved ? (
          // Show reset when everything dissolved (at the center)
          <motion.button
            onClick={resetDissolved}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: 'rgba(255, 248, 220, 0.08)',
              border: '1px solid rgba(255, 248, 220, 0.3)',
              borderRadius: '20px',
              padding: '0.5rem 1.6rem',
              cursor: 'pointer',
              backdropFilter: 'blur(16px)',
              color: '#fff8e8',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              letterSpacing: '0.04em',
            }}
          >
            Return to the Beginning
          </motion.button>
        ) : (
          <>
            {/* Next layer name hint */}
            {next && (
              <p style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '0.72rem',
                fontStyle: 'italic',
                color: `${next.hexColor}99`,
                letterSpacing: '0.06em',
                textAlign: 'center',
                pointerEvents: 'none',
              }}>
                {next.name.includes(':') ? next.name.split(':')[1].trim() : next.name} awaits
              </p>
            )}

            <motion.button
              onClick={() => active && dissolveLayer(active.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: active ? `${active.hexColor}14` : 'rgba(20,24,40,0.7)',
                border: `1px solid ${active ? active.hexColor + '55' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '20px',
                padding: '0.5rem 1.8rem',
                cursor: 'pointer',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
              onMouseEnter={(e) => {
                if (active) (e.currentTarget as HTMLButtonElement).style.background = `${active.hexColor}28`;
              }}
              onMouseLeave={(e) => {
                if (active) (e.currentTarget as HTMLButtonElement).style.background = `${active.hexColor}14`;
              }}
            >
              <span style={{
                fontFamily: 'DM Sans, system-ui, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: active ? active.hexColor : 'rgba(201,168,124,0.7)',
              }}>
                Dissolve this Layer
              </span>
              {/* Wind arrow */}
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path
                  d="M1 5H11M8 1L13 5L8 9"
                  stroke={active?.hexColor ?? 'rgba(201,168,124,0.7)'}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
