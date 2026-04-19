import { motion, AnimatePresence } from 'framer-motion';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface Props {
  visible: boolean;
  onEnter: () => void;
  onEnterPresence?: () => void;
}

const RING_SIZES = [600, 460, 340, 240, 160, 96];

export default function IntroOverlay({ visible, onEnter, onEnterPresence }: Props) {
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #0d1020 0%, #04060f 65%)',
            padding: '2rem',
            overflow: 'hidden',
          }}
          aria-modal="true"
          role="dialog"
          aria-label="Welcome to Consciousness Sphere Explorer"
        >
          {/* Pulsing concentric rings — mirror the sphere metaphor */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            {RING_SIZES.map((size, i) => (
              <motion.div
                key={size}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: [0, 0.06 + i * 0.012, 0.04 + i * 0.01],
                  scale: [0.85, 1, 1],
                }}
                transition={{
                  duration: 3.5,
                  delay: i * 0.18,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  border: `1px solid rgba(212, 190, 140, ${0.12 + i * 0.04})`,
                  boxShadow: i > 3
                    ? `0 0 ${20 + i * 8}px rgba(255, 240, 200, ${0.04 + i * 0.02}), inset 0 0 ${10 + i * 4}px rgba(255, 240, 200, ${0.02})`
                    : undefined,
                }}
              />
            ))}

            {/* Central glow point */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px 4px rgba(255, 248, 220, 0.25), 0 0 60px 20px rgba(255, 240, 180, 0.08)',
                  '0 0 35px 8px rgba(255, 248, 220, 0.4),  0 0 90px 35px rgba(255, 240, 180, 0.15)',
                  '0 0 20px 4px rgba(255, 248, 220, 0.25), 0 0 60px 20px rgba(255, 240, 180, 0.08)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fffde8 0%, #fff3b0 60%, transparent 100%)',
              }}
            />
          </div>

          {/* Grain overlay for texture */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
              pointerEvents: 'none',
              opacity: 0.6,
            }}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.2, 0, 0.1, 1] }}
            style={{
              position: 'relative',
              textAlign: 'center',
              maxWidth: '520px',
            }}
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.4em' }}
              animate={{ opacity: 0.7, letterSpacing: '0.22em' }}
              transition={{ delay: 0.8, duration: 1.4 }}
              style={{
                fontFamily: 'DM Sans, system-ui, sans-serif',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                color: '#c9a87c',
                marginBottom: '1.5rem',
              }}
            >
              A Map of Consciousness
            </motion.p>

            <h1
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)',
                fontWeight: 300,
                lineHeight: 1.18,
                color: '#f0e8d8',
                marginBottom: '1.6rem',
                letterSpacing: '0.01em',
              }}
            >
              What remains when every
              <br />
              <em style={{ color: '#e8dcc8', fontStyle: 'italic', fontWeight: 300 }}>
                layer is seen through?
              </em>
            </h1>

            <p
              style={{
                fontFamily: 'DM Sans, system-ui, sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(180, 174, 190, 0.85)',
                marginBottom: '3rem',
              }}
            >
              Seven spheres. Seven veils of identification.
              <br />
              Not a ladder to climb — layers to dissolve.
              <br />
              The center was always already here.
            </p>

            {/* Mobile rotation hint */}
            {isMobile && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 1.0 }}
                style={{
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  fontSize: '0.78rem',
                  color: 'rgba(201,168,124,0.7)',
                  letterSpacing: '0.05em',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <path d="M12 18h.01" />
                </svg>
                Rotate your phone for the best experience
              </motion.p>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.4rem',
              }}
            >
              {/* PRIMARY — Presence Mode (highlighted) */}
              {onEnterPresence && (
                <motion.button
                  onClick={onEnterPresence}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 1.1 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(201,168,124,0.22) 0%, rgba(201,168,124,0.10) 100%)',
                    border: '1px solid rgba(201, 168, 124, 0.85)',
                    borderRadius: '2px',
                    color: '#f7ecd4',
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    letterSpacing: '0.26em',
                    textTransform: 'uppercase',
                    padding: '1rem 3.2rem',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow:
                      '0 0 34px rgba(201, 168, 124, 0.28), inset 0 0 22px rgba(201, 168, 124, 0.10)',
                    transition: 'box-shadow 0.3s, background 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.boxShadow =
                      '0 0 48px rgba(201, 168, 124, 0.48), inset 0 0 28px rgba(201, 168, 124, 0.18)';
                    el.style.background =
                      'linear-gradient(135deg, rgba(201,168,124,0.32) 0%, rgba(201,168,124,0.16) 100%)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.boxShadow =
                      '0 0 34px rgba(201, 168, 124, 0.28), inset 0 0 22px rgba(201, 168, 124, 0.10)';
                    el.style.background =
                      'linear-gradient(135deg, rgba(201,168,124,0.22) 0%, rgba(201,168,124,0.10) 100%)';
                  }}
                >
                  Presence Mode
                </motion.button>
              )}

              {onEnterPresence && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  transition={{ delay: 1.4, duration: 1.2 }}
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    color: 'rgba(232,228,223,0.75)',
                    maxWidth: '360px',
                    margin: '-0.6rem 0 0.4rem',
                    letterSpacing: '0.01em',
                  }}
                >
                  A guided meditation. Begin from where you are.
                </motion.p>
              )}

              {/* Soft divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 0.35, scaleX: 1 }}
                transition={{ delay: 1.8, duration: 1.0 }}
                style={{
                  width: 160,
                  height: 1,
                  background:
                    'linear-gradient(to right, transparent, rgba(201,168,124,0.5), transparent)',
                }}
              />

              {/* SECONDARY — Explore (muted) */}
              <motion.button
                onClick={onEnter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ delay: 2.0, duration: 1.0 }}
                whileHover={{ opacity: 1, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(180, 174, 190, 0.22)',
                  borderRadius: '1px',
                  color: 'rgba(220,216,228,0.85)',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  fontSize: '0.72rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  padding: '0.7rem 2.4rem',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'rgba(201, 168, 124, 0.45)';
                  el.style.color = '#f0e6d3';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'rgba(180, 174, 190, 0.22)';
                  el.style.color = 'rgba(220,216,228,0.85)';
                }}
              >
                Explore the Map
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                transition={{ delay: 2.3, duration: 1.0 }}
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  color: 'rgba(180,174,190,0.7)',
                  margin: '-0.9rem 0 0',
                  letterSpacing: '0.01em',
                }}
              >
                Browse all seven layers at your own pace.
              </motion.p>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
