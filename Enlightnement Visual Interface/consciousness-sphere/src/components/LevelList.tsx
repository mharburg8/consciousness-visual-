import React from 'react';
import type { Layer } from '../types';

interface LevelListProps {
  layer: Layer;
}

function LevelList({ layer }: LevelListProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      aria-label={`Levels within ${layer.name}`}
    >
      {layer.levels.map((level) => (
        <span
          key={level}
          className="px-3 py-1 rounded-full text-xs font-medium tracking-wide
            border border-white/10 text-[var(--text-secondary)]
            transition-colors duration-200"
          style={{
            background: `color-mix(in srgb, ${layer.hexColor} 25%, rgba(10, 14, 26, 0.6))`,
          }}
        >
          {level}
        </span>
      ))}
    </div>
  );
}

export default React.memo(LevelList);
