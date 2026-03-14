import { memo } from 'react';
import useExplorerStore from '../stores/useExplorerStore';
import { layers } from '../data/layers';

const TOTAL_LAYERS = 7;

// Depth increases as layer id decreases (layer 7 = outermost, layer 1 = innermost)
function getDepthFraction(layerId: number): number {
  return (TOTAL_LAYERS - layerId) / (TOTAL_LAYERS - 1);
}

export default memo(function LayerBreadcrumb() {
  const selectedId = useExplorerStore((s) => s.selectedLayer);

  if (selectedId === null) return null;

  const layer = layers.find((l) => l.id === selectedId);
  if (!layer) return null;

  const depthFraction = getDepthFraction(selectedId);

  return (
    <div
      aria-label={`Layer ${selectedId} of ${TOTAL_LAYERS}: ${layer.name}`}
      className="flex flex-col gap-1.5"
    >
      {/* Layer counter */}
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          Layer
        </span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: 'var(--accent-warm)' }}
        >
          {selectedId}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          / {TOTAL_LAYERS}
        </span>
      </div>

      {/* Depth indicator: 7 dots, filled inward from right */}
      <div
        role="presentation"
        aria-hidden="true"
        className="flex items-center gap-1"
      >
        {Array.from({ length: TOTAL_LAYERS }, (_, i) => {
          // i=0 → outermost (layer 7), i=6 → innermost (layer 1)
          const isFilled = i >= selectedId - 1;
          return (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: isFilled ? '6px' : '4px',
                height: isFilled ? '6px' : '4px',
                backgroundColor: isFilled
                  ? layer.hexColor
                  : 'var(--text-muted)',
                opacity: isFilled ? 0.9 - depthFraction * 0.3 : 0.25,
                boxShadow: isFilled
                  ? `0 0 4px ${layer.hexColor}88`
                  : 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
});
