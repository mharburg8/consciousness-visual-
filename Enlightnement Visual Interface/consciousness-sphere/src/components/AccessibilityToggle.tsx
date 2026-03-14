import React from 'react';
import useExplorerStore from '../stores/useExplorerStore';

const AccessibilityToggle: React.FC = () => {
  const isTextMode = useExplorerStore((s) => s.isTextMode);
  const toggleTextMode = useExplorerStore((s) => s.toggleTextMode);

  return (
    <button
      onClick={toggleTextMode}
      aria-label={isTextMode ? 'Switch to 3D view' : 'Switch to text-only view'}
      aria-pressed={isTextMode}
      title={isTextMode ? '3D view' : 'Text-only view'}
      className="fixed bottom-4 left-16 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{
        background: isTextMode ? 'rgba(201, 168, 124, 0.15)' : 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        border: isTextMode
          ? '1px solid rgba(201, 168, 124, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        color: isTextMode ? 'var(--accent-warm)' : 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-warm)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201, 168, 124, 0.3)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = isTextMode
          ? 'var(--accent-warm)'
          : 'var(--text-secondary)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = isTextMode
          ? 'rgba(201, 168, 124, 0.4)'
          : 'rgba(255, 255, 255, 0.08)';
      }}
    >
      {/* Aa icon — represents text/reading mode */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    </button>
  );
};

export default AccessibilityToggle;
