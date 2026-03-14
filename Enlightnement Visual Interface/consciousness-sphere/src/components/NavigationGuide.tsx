import { AnimatePresence, motion } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { useBreakpoint } from '../hooks/useBreakpoint';

const DESKTOP_CONTROLS = [
  { icon: '🖱️', action: 'Rotate', detail: 'Click and drag' },
  { icon: '🔍', action: 'Zoom', detail: 'Scroll wheel' },
  { icon: '👆', action: 'Explore a Layer', detail: 'Click any sphere' },
  { icon: '📑', action: 'Switch Views', detail: 'Tabs in the info panel' },
  { icon: '↩️', action: 'Reset', detail: 'Double-click center or press R' },
];

const MOBILE_CONTROLS = [
  { icon: '👆', action: 'Rotate', detail: 'Drag with one finger' },
  { icon: '🤏', action: 'Zoom', detail: 'Pinch' },
  { icon: '👆', action: 'Explore', detail: 'Tap any sphere' },
  { icon: '↩️', action: 'Reset', detail: 'Double-tap center' },
];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 8 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function NavigationGuide() {
  const isGuideOpen = useExplorerStore((s) => s.isGuideOpen);
  const markGuideSeen = useExplorerStore((s) => s.markGuideSeen);
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';

  return (
    <AnimatePresence>
      {isGuideOpen && (
        <motion.div
          key="guide-backdrop"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(4, 6, 14, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            variants={cardVariants}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgba(10, 14, 26, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: 20,
              padding: isMobile ? '1.75rem 1.25rem 1.5rem' : '2.5rem 2.25rem 2rem',
            }}
          >
            {/* Subtle inner glow at top */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: 1,
                background:
                  'linear-gradient(90deg, transparent, rgba(212, 160, 74, 0.45), transparent)',
                borderRadius: 1,
              }}
            />

            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              {/* Title */}
              <motion.h1
                id="guide-title"
                variants={fadeUp}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  lineHeight: 1.2,
                  letterSpacing: '0.01em',
                  color: 'var(--accent-glow)',
                  marginBottom: '1.25rem',
                }}
              >
                You're Not Climbing.
                <br />
                You're Seeing Through.
              </motion.h1>

              {/* Intro */}
              <motion.p
                variants={fadeUp}
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.75,
                  marginBottom: '1.75rem',
                }}
              >
                This is a map of consciousness — not as a ladder to ascend, but as layers
                to dissolve. The outermost sphere holds the densest patterns of fear and
                contraction. Each layer inward is more translucent, more spacious. The
                center isn't a destination. It's what's always been here, underneath
                everything else.
              </motion.p>

              {/* Divider */}
              <motion.div
                variants={fadeUp}
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                  marginBottom: '1.5rem',
                }}
              />

              {/* Controls — Desktop */}
              <motion.div variants={fadeUp}>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '0.875rem',
                  }}
                >
                  Desktop
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '0.5rem 1.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {DESKTOP_CONTROLS.map((c) => (
                    <div key={c.action} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>{c.icon}</span>
                      <span>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                          }}
                        >
                          {c.action}
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginLeft: '0.3rem',
                          }}
                        >
                          — {c.detail}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Controls — Mobile */}
              <motion.div variants={fadeUp}>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '0.875rem',
                  }}
                >
                  Mobile
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '0.5rem 1.5rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  {MOBILE_CONTROLS.map((c) => (
                    <div key={c.action + c.detail} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>{c.icon}</span>
                      <span>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                          }}
                        >
                          {c.action}
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginLeft: '0.3rem',
                          }}
                        >
                          — {c.detail}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Closing line */}
              <motion.p
                variants={fadeUp}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontStyle: 'italic',
                  fontSize: '0.975rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.75rem',
                  borderLeft: '2px solid rgba(212, 160, 74, 0.35)',
                  paddingLeft: '0.875rem',
                }}
              >
                Start from the outside. See what you recognize. Then go deeper.
              </motion.p>

              {/* Begin button */}
              <motion.div variants={fadeUp}>
                <motion.button
                  onClick={markGuideSeen}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.5rem',
                    background: 'rgba(212, 160, 74, 0.12)',
                    border: '1px solid rgba(212, 160, 74, 0.35)',
                    borderRadius: 10,
                    color: 'var(--accent-warm)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 160, 74, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(212, 160, 74, 0.6)';
                    e.currentTarget.style.boxShadow = '0 0 24px rgba(212, 160, 74, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 160, 74, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(212, 160, 74, 0.35)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Begin Exploring
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
