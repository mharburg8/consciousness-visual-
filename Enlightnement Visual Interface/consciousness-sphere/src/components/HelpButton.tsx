import React from 'react';
import useExplorerStore from '../stores/useExplorerStore';

const HelpButton: React.FC = () => {
  const toggleGuide = useExplorerStore((s) => s.toggleGuide);

  return (
    <button
      onClick={toggleGuide}
      aria-label="Open navigation guide"
      className="fixed bottom-4 left-4 z-50 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{
        background: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-warm)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201, 168, 124, 0.3)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }}
    >
      ?
    </button>
  );
};

export default HelpButton;
