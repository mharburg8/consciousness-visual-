import { useCallback, useRef } from 'react';
import useExplorerStore from '../stores/useExplorerStore';
import type { FacetKey } from '../types';

const TABS: { key: FacetKey; label: string; short: string }[] = [
  { key: 'experience', label: 'Experience', short: 'Exp.' },
  { key: 'veil',       label: 'The Veil',   short: 'Veil' },
  { key: 'dissolving', label: 'Dissolving', short: 'Dis.' },
  { key: 'signs',      label: 'Signs',      short: 'Signs' },
];

interface Props {
  layerColor: string;
}

export default function FacetTabs({ layerColor }: Props) {
  const activeFacet   = useExplorerStore((s) => s.activeFacet);
  const setActiveFacet = useExplorerStore((s) => s.setActiveFacet);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (index + 1) % TABS.length;
        setActiveFacet(TABS[next].key);
        tabRefs.current[next]?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (index - 1 + TABS.length) % TABS.length;
        setActiveFacet(TABS[prev].key);
        tabRefs.current[prev]?.focus();
      }
    },
    [setActiveFacet]
  );

  return (
    <div
      role="tablist"
      aria-label="Facet tabs"
      style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        gap: '0',
        marginTop: '0.75rem',
      }}
    >
      {TABS.map(({ key, label }, index) => {
        const isActive = activeFacet === key;
        return (
          <button
            key={key}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`facet-panel-${key}`}
            id={`facet-tab-${key}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setActiveFacet(key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              flex: 1,
              padding: '0.65rem 0.25rem 0.6rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
              color: isActive ? layerColor : 'rgba(155,149,160,0.6)',
              borderBottom: isActive
                ? `2px solid ${layerColor}`
                : '2px solid transparent',
              marginBottom: '-1px',
              outline: 'none',
              fontWeight: isActive ? 500 : 400,
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(232,228,223,0.7)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(155,149,160,0.6)';
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
