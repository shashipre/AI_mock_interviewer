import React from 'react';

interface AnswerCompleteButtonProps {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
}

export const AnswerCompleteButton: React.FC<AnswerCompleteButtonProps> = ({
  onClick,
  disabled,
  isProcessing,
}) => {
  return (
    <div style={styles.container}>
      <button
        onClick={onClick}
        disabled={disabled || isProcessing}
        style={disabled || isProcessing ? styles.buttonDisabled : styles.buttonActive}
      >
        <div style={styles.content}>
          {isProcessing ? (
            <>
              {/* Simple inline spinning SVG loader */}
              <svg style={styles.spinner} viewBox="0 0 24 24">
                <circle
                  style={styles.spinnerCircle}
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  strokeWidth="3"
                />
              </svg>
              <span>Submitting Answer...</span>
            </>
          ) : (
            <>
              <span style={styles.icon}>check_circle</span>
              <span>Answer Complete</span>
            </>
          )}
        </div>
      </button>
      <p style={styles.hint}>
        Clicking this finishes your current response and requests the next question.
      </p>
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
    gap: '0.5rem',
    width: '100%',
    marginTop: '1rem',
  },
  buttonActive: {
    backgroundColor: '#188038', // Trustworthy green
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(24, 128, 56, 0.2)',
    transition: 'background-color 0.2s, transform 0.1s',
    outline: 'none',
  },
  buttonDisabled: {
    backgroundColor: '#f1f3f4',
    color: '#9aa0a6',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'not-allowed',
    outline: 'none',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  icon: {
    fontFamily: 'Material Icons, sans-serif',
    fontSize: '1.25rem',
    lineHeight: 1,
  },
  hint: {
    fontSize: '0.8rem',
    color: '#5f6368',
    margin: 0,
    textAlign: 'center',
  },
  spinner: {
    width: '18px',
    height: '18px',
    animation: 'spin 1s linear infinite',
  },
  spinnerCircle: {
    stroke: '#188038',
    strokeLinecap: 'round',
    animation: 'dash 1.5s ease-in-out infinite',
  },
};

// Inject keyframe animation utilities for spinner elements into document DOM
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    @keyframes dash {
      0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
      50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
      100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
    }
  `;
  document.head.appendChild(styleTag);
}