import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ScoreCard, EvaluationData } from '../components/ScoreCard';

interface ReportProps {
  sessionId: string;
  onRestart: () => void;
}

export const Report: React.FC<ReportProps> = ({ sessionId, onRestart }) => {
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedback scores from database when report mounts
  useEffect(() => {
    const fetchEvaluation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.getEvaluation(sessionId);
        
        // Match response format back into the ScoreCard contract
        const formattedEvaluation: EvaluationData = {
          session_id: response.session_id || sessionId,
          overall_score: response.score ?? 0,
          categories: response.categories || [],
          strengths: response.strengths || [],
          weaknesses: response.weaknesses || [],
          recommendations: response.recommendations || [],
        };
        
        setEvaluation(formattedEvaluation);
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.detail || 
          'Failed to retrieve evaluation results. You can try refreshing the page.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [sessionId]);

  return (
    <div style={styles.container}>
      {isLoading && (
        <div style={styles.loadingContainer}>
          {/* Custom SVG spinner */}
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
          <p style={styles.loadingText}>Compiling interviewer evaluation feedback...</p>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}><strong>Error:</strong> {error}</p>
          <div style={styles.actionRow}>
            <button 
              onClick={() => window.location.reload()} 
              style={styles.retryButton}
            >
              Retry
            </button>
            <button onClick={onRestart} style={styles.secondaryButton}>
              Back to Home
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && evaluation && (
        <div style={styles.content}>
          {/* Main Performance Scores Display */}
          <ScoreCard evaluation={evaluation} />

          {/* Bottom Actions */}
          <div style={styles.actions}>
            <button onClick={onRestart} style={styles.restartButton}>
              Start a New Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Styling (Inline Vanilla Styles for control)
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '1rem',
  },
  loadingText: {
    fontSize: '1.1rem',
    color: '#5f6368',
    fontWeight: 500,
    margin: 0,
  },
  errorContainer: {
    backgroundColor: '#fce8e6',
    border: '1px solid #f5c2c1',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    marginTop: '2rem',
  },
  errorText: {
    color: '#c5221f',
    fontSize: '1.1rem',
    margin: '0 0 1.5rem 0',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  retryButton: {
    backgroundColor: '#ea4335',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    color: '#3c4043',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e8eaed',
  },
  restartButton: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(26, 115, 232, 0.2)',
    transition: 'background-color 0.2s',
  },
  spinner: {
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  spinnerCircle: {
    stroke: '#1a73e8',
    strokeLinecap: 'round',
    animation: 'dash 1.5s ease-in-out infinite',
  },
};

// Inject critical animations support into DOM if not already present
if (typeof document !== 'undefined') {
  const styleId = 'report-page-animations';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
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
}