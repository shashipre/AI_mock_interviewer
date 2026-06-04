import React from 'react';

// Structure matches typical LLM evaluation output templates
export interface CategoryScore {
  category: string;
  score: number;       // Score out of 10
  feedback: string;
}

export interface EvaluationData {
  session_id: string;
  overall_score: number;
  categories: CategoryScore[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface ScoreCardProps {
  evaluation: EvaluationData;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ evaluation }) => {
  return (
    <div style={styles.container}>
      {/* Overall Score Header */}
      <div style={styles.header}>
        <div style={styles.scoreCircle}>
          <span style={styles.scoreValue}>{evaluation.overall_score}</span>
          <span style={styles.scoreLabel}>/ 10</span>
        </div>
        <div style={styles.headerInfo}>
          <h2 style={styles.title}>Interview Performance Report</h2>
          <p style={styles.subtitle}>Session ID: {evaluation.session_id}</p>
        </div>
      </div>

      {/* Category Breakdowns */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Topic Breakdown</h3>
        <div style={styles.categoryGrid}>
          {evaluation.categories.map((cat, idx) => (
            <div key={idx} style={styles.categoryCard}>
              <div style={styles.categoryHeader}>
                <span style={styles.categoryName}>{cat.category}</span>
                <span style={styles.categoryScore}>{cat.score}/10</span>
              </div>
              {/* Visual gauge */}
              <div style={styles.gaugeBg}>
                <div 
                  style={{ 
                    ...styles.gaugeFill, 
                    width: `${cat.score * 10}%`,
                    backgroundColor: cat.score >= 7 ? '#188038' : cat.score >= 5 ? '#f2994a' : '#d9534f'
                  }} 
                />
              </div>
              <p style={styles.categoryFeedback}>{cat.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Weaknesses Grid */}
      <div style={styles.splitGrid}>
        <div style={{ ...styles.card, ...styles.strengthsCard }}>
          <h3 style={{ ...styles.sectionTitle, color: '#188038' }}>Key Strengths</h3>
          <ul style={styles.list}>
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} style={styles.listItem}>
                <span style={styles.bulletGreen}>✓</span> {str}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ ...styles.card, ...styles.weaknessesCard }}>
          <h3 style={{ ...styles.sectionTitle, color: '#ea4335' }}>Areas to Improve</h3>
          <ul style={styles.list}>
            {evaluation.weaknesses.map((weak, idx) => (
              <li key={idx} style={styles.listItem}>
                <span style={styles.bulletRed}>✗</span> {weak}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div style={styles.recommendationsCard}>
        <h3 style={{ ...styles.sectionTitle, color: '#1a73e8' }}>Actionable Recommendations</h3>
        <ul style={styles.list}>
          {evaluation.recommendations.map((rec, idx) => (
            <li key={idx} style={styles.listItem}>
              <span style={styles.bulletBlue}>➔</span> {rec}
            </li>
          ))}
        </ul>
      </div>
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
    gap: '2rem',
    width: '100%',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dadce0',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  scoreCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#e8f0fe',
    border: '4px solid #1a73e8',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(26, 115, 232, 0.1)',
  },
  scoreValue: {
    fontSize: '2.25rem',
    fontWeight: 700,
    color: '#1a73e8',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '0.85rem',
    color: '#1a73e8',
    fontWeight: 600,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  title: {
    margin: 0,
    fontSize: '1.6rem',
    color: '#202124',
    fontWeight: 600,
  },
  subtitle: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#5f6368',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#202124',
    fontWeight: 600,
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e8eaed',
  },
  categoryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  categoryCard: {
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#ffffff',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
  categoryName: {
    color: '#202124',
  },
  categoryScore: {
    color: '#1a73e8',
  },
  gaugeBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e8eaed',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease-out',
  },
  categoryFeedback: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#5f6368',
    lineHeight: 1.4,
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  card: {
    border: '1px solid #dadce0',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
  },
  strengthsCard: {
    borderLeft: '5px solid #188038',
  },
  weaknessesCard: {
    borderLeft: '5px solid #ea4335',
  },
  recommendationsCard: {
    border: '1px solid #dadce0',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderLeft: '5px solid #1a73e8',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '1rem 0 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItem: {
    fontSize: '0.95rem',
    lineHeight: 1.45,
    color: '#3c4043',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  bulletGreen: {
    color: '#188038',
    fontWeight: 'bold',
  },
  bulletRed: {
    color: '#ea4335',
    fontWeight: 'bold',
  },
  bulletBlue: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
};

// Handle responsive columns dynamically via screen widths
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth < 600;
    const splitGrid = document.querySelector('[style*="gridTemplateColumns"]') as HTMLElement;
    if (splitGrid) {
      splitGrid.style.gridTemplateColumns = isMobile ? '1fr' : '1fr 1fr';
    }
  });
}