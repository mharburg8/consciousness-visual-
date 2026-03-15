import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import { useBreakpoint } from '../hooks/useBreakpoint';
import * as THREE from 'three';

const PANEL_WIDTH = 420;
const SORTED      = [...layers].sort((a, b) => b.radius - a.radius);

interface Props {
  getCameraRef: () => { camera: THREE.Camera; controls: { target: THREE.Vector3; update: () => void } } | null;
}

export default function BottomBar({ getCameraRef: _getCameraRef }: Props) {
  const [navOpen, setNavOpen] = useState(false);

  const dissolvedLayers    = useExplorerStore((s) => s.dissolvedLayers);
  const dissolveLayer      = useExplorerStore((s) => s.dissolveLayer);
  const resetDissolved     = useExplorerStore((s) => s.resetDissolved);
  const selectedLayer      = useExplorerStore((s) => s.selectedLayer);
  const selectLayer        = useExplorerStore((s) => s.selectLayer);
  const requestCameraReset = useExplorerStore((s) => s.requestCameraReset);
  const cameraDepthLayer   = useExplorerStore((s) => s.cameraDepthLayer);
  const bp                 = useBreakpoint();

  // Active = outermost undissolved layer
  const active    = SORTED.find((l) => !dissolvedLayers.includes(l.id)) ?? null;
  const activeIdx = active ? SORTED.findIndex((l) => l.id === active.id) : -1;
  const next      = SORTED[activeIdx + 1] ?? null;
  const allDissolved = dissolvedLayers.length >= SORTED.length;

  // Center in scene area (shift left when panel is open on desktop)
  const isPanelOpen = selectedLayer !== null;
  const leftOffset  = bp === 'desktop' && isPanelOpen ? -(PANEL_WIDTH / 2) : 0;

  const navSorted = [...layers].sort((a, b) => b.id - a.id);

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
        alignItems: 'flex-end',
        gap: '0.5rem',
        pointerEvents: 'all',
      }}
    >
      {/* ── LEFT: Dissolve / Reset button ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {allDissolved ? (
          <motion.div
            key="reset"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}
          >
            <motion.button
              onClick={() => {
                resetDissolved();
                selectLayer(null);
                requestCameraReset();
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: 'rgba(255, 248, 220, 0.08)',
                border: '1px solid rgba(255, 248, 220, 0.3)',
                borderRadius: '20px',
                padding: '0.45rem 1.4rem',
                cursor: 'pointer',
                backdropFilter: 'blur(16px)',
                color: '#fff8e8',
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '0.82rem',
                fontStyle: 'italic',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              Return to the Beginning
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="dissolve"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.28rem' }}
          >
            {/* Next layer hint */}
            {next && (
              <p style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: '0.68rem',
                fontStyle: 'italic',
                color: `${next.hexColor}88`,
                letterSpacing: '0.05em',
                textAlign: 'center',
                pointerEvents: 'none',
                margin: 0,
                whiteSpace: 'nowrap',
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
                border: `1px solid ${active ? active.hexColor + '50' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '20px',
                padding: '0.45rem 1.4rem',
                cursor: 'pointer',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (active) (e.currentTarget as HTMLButtonElement).style.background = `${active.hexColor}26`;
              }}
              onMouseLeave={(e) => {
                if (active) (e.currentTarget as HTMLButtonElement).style.background = `${active.hexColor}14`;
              }}
            >
              <span style={{
                fontFamily: 'DM Sans, system-ui, sans-serif',
                fontSize: '0.68rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: active ? active.hexColor : 'rgba(201,168,124,0.7)',
              }}>
                Dissolve this Layer
              </span>
              <svg width="13" height="9" viewBox="0 0 13 9" fill="none">
                <path
                  d="M1 4.5H10M7.5 1L12 4.5L7.5 8"
                  stroke={active?.hexColor ?? 'rgba(201,168,124,0.7)'}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RIGHT: Jump to Layer dropdown ───────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0.1, 1] }}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 0.5rem)',
                right: 0,
                background: 'rgba(8, 11, 24, 0.94)',
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
              <button
                onClick={() => { selectLayer(null); setNavOpen(false); }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '0.5rem 0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  borderRadius: '8px', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: '#fff8e8', boxShadow: '0 0 6px #fff8e8bb' }} />
                <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.875rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(240,236,230,0.8)', letterSpacing: '0.02em' }}>
                  The Center · Pure Awareness
                </span>
              </button>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0.5rem' }} />

              {navSorted.map((layer) => {
                const isActive = selectedLayer === layer.id || cameraDepthLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => { selectLayer(layer.id); setNavOpen(false); }}
                    style={{
                      background: isActive ? `${layer.hexColor}18` : 'transparent',
                      border: 'none', cursor: 'pointer',
                      padding: '0.5rem 0.9rem',
                      display: 'flex', alignItems: 'center', gap: '0.7rem',
                      borderRadius: '8px', transition: 'background 0.15s', textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${layer.hexColor}22`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isActive ? `${layer.hexColor}18` : 'transparent')}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: layer.hexColor, boxShadow: isActive ? `0 0 6px ${layer.hexColor}cc` : 'none', opacity: isActive ? 1 : 0.7 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.875rem', fontWeight: 300, color: isActive ? '#f0ece6' : 'rgba(232,228,223,0.65)', letterSpacing: '0.01em', fontStyle: isActive ? 'italic' : 'normal' }}>
                        {layer.name.includes(':') ? layer.name.split(':')[1].trim() : layer.name}
                      </span>
                      <span style={{ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '0.62rem', letterSpacing: '0.08em', color: `${layer.hexColor}99`, textTransform: 'uppercase' }}>
                        {layer.levels.slice(0, 3).join(' · ')}{layer.levels.length > 3 ? ' …' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setNavOpen((o) => !o)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            background: navOpen ? 'rgba(20,24,40,0.95)' : 'rgba(12,16,28,0.8)',
            border: '1px solid rgba(201,168,124,0.25)',
            borderRadius: '20px',
            padding: '0.45rem 1.1rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            transition: 'background 0.2s, border-color 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,124,0.55)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,124,0.25)')}
        >
          <span style={{ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,124,0.8)' }}>
            {navOpen ? 'Close' : 'Jump to Layer'}
          </span>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ transform: navOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M1 7L5 3L9 7" stroke="rgba(201,168,124,0.8)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
