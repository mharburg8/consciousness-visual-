import React from 'react';
import useExplorerStore from '../stores/useExplorerStore';

const QualityToggle: React.FC = () => {
  const isHighQuality = useExplorerStore((s) => s.isHighQuality);
  const toggleQuality = useExplorerStore((s) => s.toggleQuality);

  return (
    <button
      onClick={toggleQuality}
      aria-label={isHighQuality ? 'Switch to low quality' : 'Switch to high quality'}
      aria-pressed={isHighQuality}
      title={isHighQuality ? 'High quality — click to reduce' : 'Low quality — click to increase'}
      className="fixed bottom-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{
        background: isHighQuality ? 'rgba(201, 168, 124, 0.15)' : 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        border: isHighQuality
          ? '1px solid rgba(201, 168, 124, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        color: isHighQuality ? 'var(--accent-warm)' : 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-warm)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201, 168, 124, 0.3)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = isHighQuality
          ? 'var(--accent-warm)'
          : 'var(--text-secondary)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = isHighQuality
          ? 'rgba(201, 168, 124, 0.4)'
          : 'rgba(255, 255, 255, 0.08)';
      }}
    >
      {/* Star icon — filled = high quality, outlined = low quality */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isHighQuality ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
};

export default QualityToggle;
