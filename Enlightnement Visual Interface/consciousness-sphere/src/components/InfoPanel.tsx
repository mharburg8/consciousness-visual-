import { useEffect } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';
import FacetTabs from './FacetTabs';
import type { FacetKey } from '../types';
import { useBreakpoint } from '../hooks/useBreakpoint';

const FACET_TITLES: Record<FacetKey, { title: string; italic: string }> = {
  experience: { title: 'What You Experience', italic: 'Here' },
  veil:       { title: 'What Keeps This Layer', italic: 'Opaque' },
  dissolving: { title: 'How This Layer', italic: 'Dissolves' },
  signs:      { title: 'Signs of', italic: 'Thinning' },
};

const desktopVariants = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0,      opacity: 1 },
  exit:    { x: '100%', opacity: 0 },
};

const bottomVariants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0,      opacity: 1 },
  exit:    { y: '100%', opacity: 0 },
};

export default function InfoPanel() {
  const selectedLayer = useExplorerStore((s) => s.selectedLayer);
  const selectLayer   = useExplorerStore((s) => s.selectLayer);
  const activeFacet   = useExplorerStore((s) => s.activeFacet);
  const bp            = useBreakpoint();

  const layer = selectedLayer !== null
    ? layers.find((l) => l.id === selectedLayer) ?? null
    : null;

  const isDesktop = bp === 'desktop';
  const isMobile  = bp === 'mobile';
  const variants  = isDesktop ? desktopVariants : bottomVariants;
  const panelHeight = bp === 'tablet' ? '55vh' : '65vh';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectLayer(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectLayer]);

  const dragProps = isMobile
    ? {
        drag: 'y' as const,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.4 },
        onDragEnd: (_: PointerEvent, info: PanInfo) => {
          if (info.offset.y > 80) selectLayer(null);
        },
      }
    : {};

  const paragraphs = layer
    ? layer.facets[activeFacet].split('\n\n').map((p) => p.trim()).filter(Boolean)
    : [];

  const facetLabel = layer ? FACET_TITLES[activeFacet] : null;

  return (
    <AnimatePresence>
      {layer && (
        <motion.aside
          key="info-panel"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          role="complementary"
          aria-label={`Details for ${layer.name}`}
          {...dragProps}
          style={
            isDesktop
              ? {
                  position: 'fixed',
                  top: 0, right: 0,
                  width: 420,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 40,
                  // Left edge: layer-colored accent bar
                  borderLeft: `3px solid ${layer.hexColor}`,
                  boxShadow: `inset 4px 0 24px ${layer.hexColor}22, -8px 0 40px rgba(0,0,0,0.5)`,
                  background: `linear-gradient(160deg, color-mix(in srgb, ${layer.hexColor} 22%, #080b18) 0%, #080b18 200px)`,
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                }
              : {
                  position: 'fixed',
                  bottom: 0, left: 0, right: 0,
                  height: panelHeight,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 40,
                  borderTop: `2px solid ${layer.hexColor}`,
                  boxShadow: `0 -4px 40px ${layer.hexColor}33`,
                  background: `linear-gradient(180deg, color-mix(in srgb, ${layer.hexColor} 20%, #080b18) 0%, #080b18 120px)`,
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  borderRadius: '16px 16px 0 0',
                }
          }
        >
          {/* Drag handle (mobile/tablet) */}
          {!isDesktop && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
              <div style={{
                width: 36, height: 3, borderRadius: 9999,
                background: `${layer.hexColor}88`,
              }} />
            </div>
          )}

          {/* ── HEADER ── */}
          <div style={{
            padding: isDesktop ? '2rem 2rem 1rem' : '1rem 1.5rem 0.75rem',
            flexShrink: 0,
          }}>
            {/* Top row: layer counter + close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Colored depth dot */}
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: layer.hexColor,
                  boxShadow: `0 0 8px ${layer.hexColor}bb`,
                  display: 'inline-block',
                }} />
                <span style={{
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  fontSize: '0.68rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: 'rgba(180,174,190,0.6)',
                }}>
                  Layer {8 - layer.id} inward · {layer.chartLocation}
                </span>
              </div>

              <button
                onClick={() => selectLayer(null)}
                aria-label="Close panel"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(180,174,190,0.5)', padding: '4px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e8e4df')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(180,174,190,0.5)')}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Layer name — the dominant visual element */}
            <h2 style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: isDesktop ? '2rem' : '1.65rem',
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '0.015em',
              color: '#f0ece6',
              marginBottom: '0.35rem',
            }}>
              {layer.name.includes(':') ? (
                <>
                  <span style={{ color: 'rgba(232,228,223,0.5)', fontSize: '0.75em', display: 'block', marginBottom: '0.1em', letterSpacing: '0.08em' }}>
                    {layer.name.split(':')[0]}
                  </span>
                  <em style={{ fontStyle: 'italic', color: '#f0ece6' }}>
                    {layer.name.split(':')[1].trim()}
                  </em>
                </>
              ) : layer.name}
            </h2>

            <p style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.8rem', color: `${layer.hexColor}dd`,
              letterSpacing: '0.04em', fontStyle: 'italic',
              marginBottom: '1.25rem',
            }}>
              {layer.subtitle}
            </p>

            {/* Levels — inline constellation */}
            <div style={{
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.75rem', letterSpacing: '0.06em',
              color: 'rgba(180,174,190,0.65)',
              lineHeight: 1.8,
              marginBottom: '0.4rem',
            }}>
              {layer.levels.map((lvl, i) => (
                <span key={lvl}>
                  <span style={{ color: `${layer.hexColor}cc` }}>{lvl}</span>
                  {i < layer.levels.length - 1 && (
                    <span style={{ margin: '0 0.35em', color: `${layer.hexColor}55` }}>·</span>
                  )}
                </span>
              ))}
            </div>

            {/* Emotional states — aligned with levels */}
            {layer.levelData.length > 0 && (
              <div style={{
                fontFamily: 'DM Sans, system-ui, sans-serif',
                fontSize: '0.68rem', letterSpacing: '0.05em',
                color: 'rgba(180,174,190,0.42)',
                lineHeight: 1.8,
                fontStyle: 'italic',
                marginBottom: '1.25rem',
              }}>
                {layer.levelData.map((e, i) => (
                  <span key={e.name}>
                    {e.emotionalState}
                    {i < layer.levelData.length - 1 && (
                      <span style={{ margin: '0 0.35em', color: `${layer.hexColor}44` }}>·</span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Divider with layer color */}
            <div style={{
              height: 1,
              background: `linear-gradient(to right, ${layer.hexColor}66, transparent)`,
              marginBottom: 0,
            }} />
          </div>

          {/* ── FACET TABS ── */}
          <div style={{ padding: '0 2rem', flexShrink: 0 }}>
            <FacetTabs layerColor={layer.hexColor} />
          </div>

          {/* ── FACET CONTENT ── scrollable */}
          <div
            id={`facet-panel-${activeFacet}`}
            role="tabpanel"
            aria-labelledby={`facet-tab-${activeFacet}`}
            aria-live="polite"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isDesktop ? '1.5rem 2rem 4rem' : '1.25rem 1.5rem 3rem',
              minHeight: 0,
              scrollbarWidth: 'thin',
              scrollbarColor: `${layer.hexColor}44 transparent`,
            }}
          >
            {/* Facet title */}
            {facetLabel && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: '1.05rem',
                  fontWeight: 300,
                  color: `${layer.hexColor}ee`,
                  fontStyle: 'italic',
                  letterSpacing: '0.02em',
                  lineHeight: 1.3,
                  marginBottom: '0.65rem',
                }}>
                  {facetLabel.title} <em style={{ fontWeight: 400 }}>{facetLabel.italic}</em>
                </p>
                <div style={{
                  height: 1,
                  width: '3rem',
                  background: `${layer.hexColor}88`,
                }} />
              </div>
            )}

            {/* Paragraphs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                    fontSize: i === 0 ? '0.935rem' : '0.865rem',
                    lineHeight: i === 0 ? 1.85 : 1.8,
                    color: i === 0
                      ? 'rgba(232, 228, 223, 0.88)'
                      : 'rgba(180, 174, 190, 0.72)',
                    fontWeight: i === 0 ? 400 : 300,
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
