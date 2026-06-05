import React, { useState } from 'react';
import { Upload } from './pages/Upload';
import { Interview } from './pages/Interview';
import { Report } from './pages/Report';
import type { QuestionResponse } from './services/api';

type AppStep = 'upload' | 'interview' | 'report';

export const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [sessionData, setSessionData] = useState<QuestionResponse | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  // Transitions the application from Resume Upload to Live Interview
  const handleInterviewStarted = (data: QuestionResponse) => {
    setSessionData(data);
    setActiveSessionId(data.session_id);
    setStep('interview');
  };

  // Transitions the application from Interview Room to final Evaluation Report
  const handleInterviewEnded = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setStep('report');
  };

  // Resets the state machine back to home/upload page for a new attempt
  const handleRestart = () => {
    setSessionData(null);
    setActiveSessionId('');
    setStep('upload');
  };

  // Routing Switchboard
  const renderCurrentPage = () => {
    switch (step) {
      case 'interview':
        if (!sessionData) {
          setStep('upload');
          return <Upload onInterviewStarted={handleInterviewStarted} />;
        }
        return (
          <Interview
            initialSession={sessionData}
            onInterviewEnded={handleInterviewEnded}
          />
        );
      case 'report':
        return (
          <Report
            sessionId={activeSessionId}
            onRestart={handleRestart}
          />
        );
      case 'upload':
      default:
        return <Upload onInterviewStarted={handleInterviewStarted} />;
    }
  };

  return (
    <div style={styles.appWrapper}>
      {/* Navigation Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <div style={styles.brand} onClick={handleRestart}>
            <span style={styles.logoIcon}>🎙️</span>
            <span style={styles.brandText}>AI Mock Interviewer</span>
          </div>
          <div style={styles.navLinks}>
            <button 
              onClick={handleRestart}
              style={{
                ...styles.navButton,
                color: step === 'upload' ? '#1a73e8' : '#5f6368',
                borderBottom: step === 'upload' ? '2px solid #1a73e8' : 'none'
              }}
            >
              Upload
            </button>
            <button 
              disabled={step === 'upload'}
              style={{
                ...styles.navButton,
                color: step === 'interview' ? '#1a73e8' : '#5f6368',
                borderBottom: step === 'interview' ? '2px solid #1a73e8' : 'none',
                cursor: step === 'upload' ? 'not-allowed' : 'pointer'
              }}
            >
              Interview
            </button>
            <button 
              disabled={step !== 'report'}
              style={{
                ...styles.navButton,
                color: step === 'report' ? '#1a73e8' : '#5f6368',
                borderBottom: step === 'report' ? '2px solid #1a73e8' : 'none',
                cursor: step !== 'report' ? 'not-allowed' : 'pointer'
              }}
            >
              Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main style={styles.mainContent}>
        {renderCurrentPage()}
      </main>

      {/* Footer copyright section */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          &copy; {new Date().getFullYear()} AI Mock Interviewer. Built with React + FastAPI.
        </p>
      </footer>
    </div>
  );
};

// ==========================================
// Styling (Inline Vanilla Styles for control)
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e8eaed',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  logoIcon: {
    fontSize: '1.5rem',
  },
  brandText: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#202124',
  },
  navLinks: {
    display: 'flex',
    height: '100%',
    gap: '1rem',
  },
  navButton: {
    background: 'none',
    border: 'none',
    padding: '0 0.5rem',
    height: '100%',
    fontSize: '0.95rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    outline: 'none',
  },
  mainContent: {
    flex: '1 0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e8eaed',
    padding: '1.5rem 0',
    marginTop: 'auto',
  },
  footerText: {
    textAlign: 'center',
    margin: 0,
    fontSize: '0.85rem',
    color: '#70757a',
  },
};

export default App;