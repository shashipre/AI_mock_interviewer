import React from 'react';

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  questionType: string; // e.g., 'bank' or 'followup'
  totalEstimatedQuestions?: number; // Visual helper for progress estimation
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  questionType,
  totalEstimatedQuestions = 5, // Default expectation config helper
}) => {
  // Calculate percentage completion for visual progress bar
  const progressPercentage = Math.min(
    Math.round((questionNumber / totalEstimatedQuestions) * 100),
    100
  );

  return (
    <div style={styles.cardContainer}>
      {/* Header Info */}
      <div style={styles.headerRow}>
        <span style={styles.badge}>
          Question #{questionNumber}
        </span>
        <span style={questionType === 'followup' ? styles.followupBadge : styles.bankBadge}>
          {questionType === 'followup' ? 'Follow-up Context' : 'Core Topic'}
        </span>
      </div>

      {/* Main Question Display */}
      <div style={styles.questionSection}>
        <p style={styles.questionText}>
          {question || 'Generating next question...'}
        </p>
      </div>

      {/* Progress Bar Indicators */}
      <div style={styles.progressSection}>
        <div style={styles.progressLabels}>
          <span style={styles.progressLabelText}>Interview Progress</span>
          <span style={styles.progressLabelText}>{questionNumber} / {totalEstimatedQuestions}</span>
        </div>
        <div style={styles.progressBarBackground}>
          <div 
            style={{ 
              ...styles.progressBarFill, 
              width: `${progressPercentage}%` 
            }} 
          />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Styling (Inline Vanilla Styles for control)
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
  cardContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #dadce0',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#f1f3f4',
    color: '#3c4043',
    padding: '0.4rem 0.8rem',
    borderRadius: '16px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  bankBadge: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    padding: '0.4rem 0.8rem',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  followupBadge: {
    backgroundColor: '#fef7e0',
    color: '#b06000',
    padding: '0.4rem 0.8rem',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  questionSection: {
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
  },
  questionText: {
    fontSize: '1.4rem',
    fontWeight: 500,
    color: '#202124',
    lineHeight: 1.5,
    margin: 0,
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderTop: '1px solid #f1f3f4',
    paddingTop: '1.2rem',
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#5f6368',
    fontWeight: 500,
  },
  progressLabelText: {
    margin: 0,
  },
  progressBarBackground: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e8eaed',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1a73e8',
    borderRadius: '4px',
    transition: 'width 0.4s ease-out',
  },
};