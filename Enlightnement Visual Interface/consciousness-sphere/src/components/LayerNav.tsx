import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import { useBreakpoint } from '../hooks/useBreakpoint';
import * as THREE from 'three';

// Sorted outermost → innermost for display
const SORTED = [...layers].sort((a, b) => b.id - a.id);

interface Props {
  /** OrbitControls ref for camera manipulation — passed down from App */
  getCameraRef: () => { camera: THREE.Camera; controls: { target: THREE.Vector3; update: () => void } } | null;
}

const PANEL_WIDTH = 420;

export default function LayerNav({ getCameraRef: _getCameraRef }: Props) {
  const [open, setOpen] = useState(false);
  const selectedLayer    = useExplorerStore((s) => s.selectedLayer);
  const selectLayer      = useExplorerStore((s) => s.selectLayer);
  const cameraDepthLayer = useExplorerStore((s) => s.cameraDepthLayer);
  const bp               = useBreakpoint();

  const handleSelect = (layerId: number) => {
    selectLayer(layerId);
    setOpen(false);
  };

  const isPanelOpen = selectedLayer !== null;
  const leftOffset  = bp === 'desktop' && isPanelOpen ? -(PANEL_WIDTH / 2) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: `calc(50% + ${leftOffset}px)`,
        transform: 'translateX(-50%)',
        transition: 'left 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0.1, 1] }}
            style={{
              background: 'rgba(8, 11, 24, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              minWidth: '220px',
            }}
          >
            {/* Center option */}
            <button
              onClick={() => { selectLayer(null); setOpen(false); }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '0.55rem 0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                borderRadius: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: '#fff8e8',
                boxShadow: '0 0 6px #fff8e8cc',
              }} />
              <span style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '0.875rem', fontWeight: 300, fontStyle: 'italic',
                color: 'rgba(240, 236, 230, 0.8)',
                letterSpacing: '0.02em',
              }}>
                The Center · Pure Awareness
              </span>
            </button>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0.5rem' }} />

            {SORTED.map((layer) => {
              const isActive = selectedLayer === layer.id || cameraDepthLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => handleSelect(layer.id)}
                  style={{
                    background: isActive ? `${layer.hexColor}18` : 'transparent',
                    border: 'none', cursor: 'pointer',
                    padding: '0.5rem 0.9rem',
                    display: 'flex', alignItems: 'center', gap: '0.7rem',
                    borderRadius: '8px',
                    transition: 'background 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${layer.hexColor}22`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = isActive ? `${layer.hexColor}18` : 'transparent')}
                >
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: layer.hexColor,
                    boxShadow: isActive ? `0 0 6px ${layer.hexColor}cc` : 'none',
                    opacity: isActive ? 1 : 0.7,
                  }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontSize: '0.875rem', fontWeight: 300,
                      color: isActive ? '#f0ece6' : 'rgba(232,228,223,0.65)',
                      letterSpacing: '0.01em',
                      fontStyle: isActive ? 'italic' : 'normal',
                    }}>
                      {layer.name.includes(':') ? layer.name.split(':')[1].trim() : layer.name}
                    </span>
                    <span style={{
                      fontFamily: 'DM Sans, system-ui, sans-serif',
                      fontSize: '0.65rem', letterSpacing: '0.08em',
                      color: `${layer.hexColor}99`,
                      textTransform: 'uppercase',
                    }}>
                      {layer.levels.slice(0, 3).join(' · ')}{layer.levels.length > 3 ? ' …' : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          background: open
            ? 'rgba(20, 24, 40, 0.95)'
            : 'rgba(12, 16, 28, 0.8)',
          border: '1px solid rgba(201, 168, 124, 0.25)',
          borderRadius: '20px',
          padding: '0.45rem 1.2rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,124,0.55)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,124,0.25)')}
      >
        <span style={{
          fontFamily: 'DM Sans, system-ui, sans-serif',
          fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(201, 168, 124, 0.8)',
        }}>
          {open ? 'Close' : 'Jump to Layer'}
        </span>
        <svg
          width="10" height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M1 7L5 3L9 7" stroke="rgba(201,168,124,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </motion.button>
    </div>
  );
}
