import React from 'react';

export type MicState = 'idle' | 'recording' | 'processing';

interface MicButtonProps {
  state: MicState;
  onClick: () => void;
}

export const MicButton: React.FC<MicButtonProps> = ({ state, onClick }) => {
  // Determine text label based on active execution state
  const getButtonLabel = () => {
    switch (state) {
      case 'recording':
        return 'Stop Recording / Complete Answer';
      case 'processing':
        return 'Processing Speech...';
      case 'idle':
      default:
        return 'Push to Speak';
    }
  };

  // Determine styles dynamically matching status
  const getButtonStyle = () => {
    switch (state) {
      case 'recording':
        return { ...styles.button, ...styles.recording };
      case 'processing':
        return { ...styles.button, ...styles.processing };
      case 'idle':
      default:
        return { ...styles.button, ...styles.idle };
    }
  };

  return (
    <div style={styles.container}>
      <button
        onClick={onClick}
        disabled={state === 'processing'}
        style={getButtonStyle()}
      >
        <div style={styles.contentWrapper}>
          {/* Micro Icon Representation */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={styles.icon}
          >
            {state === 'recording' ? (
              // Stop indicator square icon
              <path d="M6 19h12V5H6v14z" />
            ) : (
              // Microphone path icon
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            )}
          </svg>
          <span style={styles.labelText}>{getButtonLabel()}</span>
        </div>
      </button>
      
      {state === 'recording' && (
        <span style={styles.hintText}>Click the button or speak to answer. Click again when finished.</span>
      )}
    </div>
  );
};

// ==========================================
// Styling (Inline Vanilla Styles for control)
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
  },
  button: {
    border: 'none',
    borderRadius: '50px',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#ffffff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idle: {
    backgroundColor: '#1a73e8', // Classic clean blue
  },
  recording: {
    backgroundColor: '#ea4335', // Attention grabbing red
    animation: 'pulseGlow 1.5s infinite',
  },
  processing: {
    backgroundColor: '#9aa0a6', // Non-interactive neutral gray
    cursor: 'not-allowed',
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  icon: {
    width: '24px',
    height: '24px',
  },
  labelText: {
    lineHeight: '24px',
  },
  hintText: {
    fontSize: '0.85rem',
    color: '#ea4335',
    fontWeight: 500,
    animation: 'fadeInOut 2s infinite',
  },
};

// Inject keyframe glow patterns for record indicators into the document DOM
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(234, 67, 53, 0); }
      100% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0); }
    }
    @keyframes fadeInOut {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(styleTag);
}