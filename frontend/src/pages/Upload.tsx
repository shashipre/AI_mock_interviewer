import React, { useState } from 'react';
import api from '../services/api';
import type { ResumeAnalysis, QuestionResponse } from '../services/api';

interface UploadProps {
  onInterviewStarted: (sessionData: QuestionResponse) => void;
}

export const Upload: React.FC<UploadProps> = ({ onInterviewStarted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);

  // Handle file selection change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setAnalysis(null); // Clear old results if uploading a new file
    }
  };

  // Upload file and parse resume
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await api.uploadResume(file);
      setAnalysis(response.analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to parse the resume. Please check the file format.');
    } finally {
      setIsUploading(false);
    }
  };

  // Start the interview session using the parsed analysis
  const handleStartInterview = async () => {
    if (!analysis) return;

    setIsStartingSession(true);
    setError(null);

    try {
      const sessionData = await api.startSession(analysis);
      onInterviewStarted(sessionData);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to start the interview session. Please try again.');
    } finally {
      setIsStartingSession(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI Mock Interviewer</h1>
      <p style={styles.subtitle}>Upload your resume to generate a tailored interview experience.</p>

      {/* Upload Box */}
      {!analysis && (
        <form onSubmit={handleUpload} style={styles.uploadCard}>
          <div style={styles.dropZone}>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.txt" 
              onChange={handleFileChange} 
              id="resume-file-input" 
              style={styles.fileInput}
            />
            <label htmlFor="resume-file-input" style={styles.fileLabel}>
              {file ? `Selected: ${file.name}` : 'Click here to choose your Resume (PDF, DOCX, TXT)'}
            </label>
          </div>
          <button 
            type="submit" 
            disabled={!file || isUploading} 
            style={file && !isUploading ? styles.button : styles.buttonDisabled}
          >
            {isUploading ? 'Parsing Resume...' : 'Analyze Resume'}
          </button>
        </form>
      )}

      {/* Error Message Display */}
      {error && (
        <div style={styles.errorBanner}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Parsed Summary Display */}
      {analysis && (
        <div style={styles.summaryCard}>
          <h2 style={styles.sectionHeader}>Resume Summary Profile</h2>
          
          <div style={styles.profileSection}>
            <p><strong>Candidate Name:</strong> {analysis.candidate_info.candidate_name || 'N/A'}</p>
            <p><strong>Target Role:</strong> {analysis.candidate_info.target_role}</p>
            <p><strong>Interviewer Summary:</strong> {analysis.candidate_info.interviewer_summary}</p>
          </div>

          <div style={styles.skillsContainer}>
            <strong>Matched Skills:</strong>
            <div style={styles.tagGrid}>
              {analysis.skills.map((skill, index) => (
                <span key={index} style={styles.skillTag}>{skill}</span>
              ))}
            </div>
          </div>

          {analysis.experience.length > 0 && (
            <div style={styles.listSection}>
              <h3>Work Experience</h3>
              {analysis.experience.map((exp, index) => (
                <div key={index} style={styles.listItem}>
                  <p><strong>{exp.role}</strong> at {exp.company} ({exp.duration})</p>
                  <p style={styles.listSummary}>{exp.summary}</p>
                </div>
              ))}
            </div>
          )}

          {analysis.projects.length > 0 && (
            <div style={styles.listSection}>
              <h3>Projects</h3>
              {analysis.projects.map((proj, index) => (
                <div key={index} style={styles.listItem}>
                  <p><strong>{proj.name}</strong> — <span style={styles.techText}>{proj.tech_stack.join(', ')}</span></p>
                  <p style={styles.listSummary}>{proj.summary}</p>
                </div>
              ))}
            </div>
          )}

          <div style={styles.actionContainer}>
            <button 
              onClick={handleStartInterview} 
              disabled={isStartingSession}
              style={styles.startButton}
            >
              {isStartingSession ? 'Starting Session...' : 'Start Mock Interview Now'}
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
    color: '#333',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#1a73e8',
  },
  subtitle: {
    fontSize: '1.1rem',
    textAlign: 'center',
    color: '#666',
    marginBottom: '2.5rem',
  },
  uploadCard: {
    backgroundColor: '#fff',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  dropZone: {
    width: '100%',
    minHeight: '120px',
    border: '2px dashed #1a73e8',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    position: 'relative',
    textAlign: 'center',
    padding: '1rem',
  },
  fileInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  fileLabel: {
    fontSize: '1rem',
    color: '#1a73e8',
    fontWeight: 500,
    pointerEvents: 'none',
  },
  button: {
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'not-allowed',
  },
  errorBanner: {
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    padding: '1rem',
    borderRadius: '4px',
    border: '1px solid #f5c2c1',
    marginTop: '1.5rem',
    fontSize: '0.95rem',
  },
  summaryCard: {
    backgroundColor: '#fff',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionHeader: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#1a73e8',
    borderBottom: '2px solid #e8eaed',
    paddingBottom: '0.5rem',
  },
  profileSection: {
    lineHeight: 1.6,
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '6px',
  },
  skillsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillTag: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    padding: '0.25rem 0.75rem',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  listSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItem: {
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #f1f3f4',
  },
  listSummary: {
    margin: '0.25rem 0 0 0',
    color: '#5f6368',
    fontSize: '0.9rem',
    lineHeight: 1.4,
  },
  techText: {
    color: '#188038',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  actionContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  startButton: {
    backgroundColor: '#188038',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '1rem 3rem',
    fontSize: '1.2rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};