import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';

export default function DepthIndicator() {
  const cameraDepthLayer = useExplorerStore((s) => s.cameraDepthLayer);
  const selectedLayer    = useExplorerStore((s) => s.selectedLayer);

  // Only show depth label when NOT in a selected panel (panel has its own identity)
  const layerId = selectedLayer === null ? cameraDepthLayer : null;
  const layer   = layerId !== null ? layers.find((l) => l.id === layerId) ?? null : null;

  return (
    <AnimatePresence mode="wait">
      {layer && (
        <motion.div
          key={layer.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0.1, 1] }}
          style={{
            position: 'fixed',
            top: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
          }}
        >
          {/* Colored pulse dot */}
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: layer.hexColor,
              boxShadow: `0 0 8px ${layer.hexColor}cc, 0 0 16px ${layer.hexColor}44`,
              flexShrink: 0,
            }}
          />
          {/* Layer name */}
          <span
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '0.9rem',
              fontWeight: 300,
              fontStyle: 'italic',
              letterSpacing: '0.04em',
              color: 'rgba(232, 228, 223, 0.75)',
              textShadow: `0 0 20px rgba(0,0,0,0.8)`,
              whiteSpace: 'nowrap',
            }}
          >
            {layer.name}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
