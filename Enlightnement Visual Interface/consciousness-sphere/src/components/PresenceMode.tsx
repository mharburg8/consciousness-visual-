import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import useExplorerStore from '../stores/useExplorerStore';
import { presenceQuestions } from '../data/presenceQuestions';
import { layers } from '../data/layers';

const FADE = { duration: 1.1, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

export default function PresenceMode() {
  const mode             = useExplorerStore((s) => s.mode);
  const phase            = useExplorerStore((s) => s.presencePhase);
  const questionIndex    = useExplorerStore((s) => s.presenceQuestionIndex);
  const resonantLayer    = useExplorerStore((s) => s.presenceResonantLayer);
  const answerQuestion   = useExplorerStore((s) => s.answerPresenceQuestion);
  const sitWith          = useExplorerStore((s) => s.sitWithResonantLayer);
  const dissolve         = useExplorerStore((s) => s.dissolveFromPresence);
  const exit             = useExplorerStore((s) => s.exitPresenceMode);

  // Escape always exits presence mode.
  useEffect(() => {
    if (mode !== 'presence') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, exit]);

  const active = mode === 'presence';
  const currentQuestion =
    phase === 'questions' ? presenceQuestions[questionIndex] : null;
  const resonantLayerData =
    resonantLayer != null ? layers.find((l) => l.id === resonantLayer) : null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="presence-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background:
              'radial-gradient(ellipse at center, #0b0e1c 0%, #040612 70%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 1.5rem',
            overflow: 'hidden',
          }}
          aria-modal="true"
          role="dialog"
          aria-label="Presence Mode"
        >
          {/* Ambient grain */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
              pointerEvents: 'none',
              opacity: 0.55,
            }}
          />

          {/* Soft breathing halo — always present, sets the pace */}
          <motion.div
            aria-hidden="true"
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.35, 0.55, 0.35],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: 520,
              height: 520,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(201,168,124,0.08) 0%, rgba(201,168,124,0.02) 45%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Exit button — top right, unobtrusive */}
          <button
            onClick={exit}
            aria-label="Leave Presence Mode"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.75rem',
              background: 'transparent',
              border: 'none',
              color: 'rgba(232,228,223,0.5)',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = '#e8e4df')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                'rgba(232,228,223,0.5)')
            }
          >
            Leave
          </button>

          <AnimatePresence mode="wait">
            {/* ── QUESTIONS PHASE ───────────────────────────────────────── */}
            {phase === 'questions' && currentQuestion && (
              <motion.div
                key={`q-${questionIndex}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.9, ease: [0.2, 0, 0.1, 1] }}
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  maxWidth: '640px',
                  width: '100%',
                }}
              >
                <p
                  style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontSize: '0.66rem',
                    letterSpacing: '0.32em',
                    textTransform: 'uppercase',
                    color: 'rgba(201,168,124,0.65)',
                    marginBottom: '1.8rem',
                  }}
                >
                  {questionIndex + 1} of {presenceQuestions.length}
                </p>

                <h2
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontWeight: 300,
                    fontSize: 'clamp(1.75rem, 4.2vw, 2.5rem)',
                    lineHeight: 1.25,
                    color: '#f0ece6',
                    margin: 0,
                    letterSpacing: '0.005em',
                  }}
                >
                  {currentQuestion.prompt}
                </h2>

                {currentQuestion.hint && (
                  <p
                    style={{
                      fontFamily: 'DM Sans, system-ui, sans-serif',
                      fontSize: '0.86rem',
                      fontStyle: 'italic',
                      color: 'rgba(180,174,190,0.7)',
                      marginTop: '1rem',
                      marginBottom: '2.6rem',
                    }}
                  >
                    {currentQuestion.hint}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                    marginTop: currentQuestion.hint ? 0 : '2.4rem',
                  }}
                >
                  {currentQuestion.options.map((opt, i) => (
                    <motion.button
                      key={opt.text}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
                      onClick={() => answerQuestion(opt.layer)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      style={{
                        background: 'rgba(12,16,28,0.6)',
                        border: '1px solid rgba(201,168,124,0.18)',
                        borderRadius: '2px',
                        color: 'rgba(232,228,223,0.88)',
                        fontFamily: 'Cormorant Garamond, Georgia, serif',
                        fontSize: '1.05rem',
                        fontWeight: 300,
                        letterSpacing: '0.01em',
                        padding: '0.9rem 1.4rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'border-color 0.25s, background 0.25s, color 0.25s',
                        backdropFilter: 'blur(8px)',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.borderColor = 'rgba(201,168,124,0.5)';
                        el.style.background = 'rgba(20,24,40,0.75)';
                        el.style.color = '#f0ece6';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.borderColor = 'rgba(201,168,124,0.18)';
                        el.style.background = 'rgba(12,16,28,0.6)';
                        el.style.color = 'rgba(232,228,223,0.88)';
                      }}
                    >
                      {opt.text}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── RESONANCE PHASE ───────────────────────────────────────── */}
            {phase === 'resonance' && resonantLayerData && (
              <motion.div
                key="resonance"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 1.2, ease: [0.2, 0, 0.1, 1] }}
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  maxWidth: '620px',
                  width: '100%',
                }}
              >
                {/* Quiet color orb */}
                <motion.div
                  aria-hidden="true"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.8, 0.55] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    margin: '0 auto 2rem',
                    background: `radial-gradient(circle, ${resonantLayerData.hexColor}cc 0%, ${resonantLayerData.hexColor}33 55%, transparent 80%)`,
                    boxShadow: `0 0 60px 12px ${resonantLayerData.hexColor}33`,
                  }}
                />

                <p
                  style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontSize: '0.68rem',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: 'rgba(201,168,124,0.65)',
                    marginBottom: '0.8rem',
                  }}
                >
                  What resonates is near
                </p>

                <h2
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontWeight: 300,
                    fontSize: 'clamp(1.8rem, 4.4vw, 2.6rem)',
                    lineHeight: 1.2,
                    color: '#f0ece6',
                    margin: 0,
                    letterSpacing: '0.005em',
                  }}
                >
                  {resonantLayerData.name.includes(':')
                    ? resonantLayerData.name.split(':')[1].trim()
                    : resonantLayerData.name}
                </h2>

                <p
                  style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontSize: '0.82rem',
                    letterSpacing: '0.04em',
                    color: `${resonantLayerData.hexColor}cc`,
                    marginTop: '0.6rem',
                    marginBottom: '2rem',
                  }}
                >
                  {resonantLayerData.levels.join(' · ')}
                </p>

                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: '1.05rem',
                    fontStyle: 'italic',
                    lineHeight: 1.7,
                    color: 'rgba(232,228,223,0.78)',
                    maxWidth: '520px',
                    margin: '0 auto 2.6rem',
                  }}
                >
                  This is not where you are. It is what is asking for attention,
                  right now. Move however feels honest.
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.8rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <motion.button
                    onClick={sitWith}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(201,168,124,0.4)',
                      borderRadius: '1px',
                      color: '#c9a87c',
                      fontFamily: 'DM Sans, system-ui, sans-serif',
                      fontSize: '0.75rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      padding: '0.85rem 2.2rem',
                      cursor: 'pointer',
                    }}
                  >
                    Sit with this
                  </motion.button>

                  <motion.button
                    onClick={dissolve}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(201,168,124,0.4)',
                      borderRadius: '1px',
                      color: '#c9a87c',
                      fontFamily: 'DM Sans, system-ui, sans-serif',
                      fontSize: '0.75rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      padding: '0.85rem 2.2rem',
                      cursor: 'pointer',
                    }}
                  >
                    Enter this layer
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── SITTING PHASE ─────────────────────────────────────────── */}
            {phase === 'sitting' && resonantLayerData && (
              <motion.div
                key="sitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6 }}
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  maxWidth: '580px',
                  width: '100%',
                }}
              >
                <motion.div
                  aria-hidden="true"
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    margin: '0 auto 2.4rem',
                    background: `radial-gradient(circle, ${resonantLayerData.hexColor}bb 0%, ${resonantLayerData.hexColor}22 55%, transparent 82%)`,
                    boxShadow: `0 0 90px 20px ${resonantLayerData.hexColor}22`,
                  }}
                />

                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: '1.15rem',
                    fontStyle: 'italic',
                    color: 'rgba(232,228,223,0.82)',
                    lineHeight: 1.8,
                    margin: '0 auto 2rem',
                    maxWidth: '440px',
                  }}
                >
                  Breathe with this shape. In as it opens. Out as it softens.
                </p>

                <p
                  style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontSize: '0.88rem',
                    lineHeight: 1.75,
                    color: 'rgba(180,174,190,0.82)',
                    maxWidth: '500px',
                    margin: '0 auto 2.4rem',
                  }}
                >
                  {firstParagraph(resonantLayerData.facets.experience)}
                </p>

                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: '1rem',
                    fontStyle: 'italic',
                    color: 'rgba(201,168,124,0.82)',
                    letterSpacing: '0.02em',
                    margin: '0 auto 2.6rem',
                  }}
                >
                  Stay here as long as you like.
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.8rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <motion.button
                    onClick={dissolve}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(201,168,124,0.35)',
                      borderRadius: '1px',
                      color: '#c9a87c',
                      fontFamily: 'DM Sans, system-ui, sans-serif',
                      fontSize: '0.72rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      padding: '0.75rem 1.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Enter this layer
                  </motion.button>

                  <motion.button
                    onClick={exit}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(232,228,223,0.22)',
                      borderRadius: '1px',
                      color: 'rgba(232,228,223,0.7)',
                      fontFamily: 'DM Sans, system-ui, sans-serif',
                      fontSize: '0.72rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      padding: '0.75rem 1.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function firstParagraph(text: string): string {
  const para = text.split(/\n\s*\n/)[0] ?? text;
  // Keep it brief — truncate if very long.
  if (para.length <= 340) return para;
  const cut = para.slice(0, 340);
  const lastPeriod = cut.lastIndexOf('.');
  return (lastPeriod > 200 ? cut.slice(0, lastPeriod + 1) : cut) + '…';
}
