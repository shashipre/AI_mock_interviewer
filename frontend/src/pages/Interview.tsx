import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import type { QuestionResponse } from '../services/api';
import { QuestionCard } from '../components/QuestionCard';
import { TranscriptBox } from '../components/TranscriptBox';
import { MicButton } from '../components/MicButton';
import type { MicState } from '../components/MicButton';
import { AnswerCompleteButton } from '../components/AnswerCompleteButton';
import { audioRecorder } from '../services/audioRecorder';
import { sttSocketManager } from '../services/sttSocket';
import { ttsSocketManager } from '../services/ttsSocket';

interface InterviewProps {
  initialSession: QuestionResponse;
  onInterviewEnded: (sessionId: string) => void;
}

export const Interview: React.FC<InterviewProps> = ({ initialSession, onInterviewEnded }) => {
  const [session, setSession] = useState<QuestionResponse>(initialSession);
  const [transcript, setTranscript] = useState<string>('');
  const [micState, setMicState] = useState<MicState>('idle');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Web Audio Context reference for playing raw PCM audio stream back
  const audioContextRef = useRef<AudioContext | null>(null);
  const scheduledTimeRef = useRef<number>(0);

  // Synthesize and play initial question on load, clean up sockets on unmount
  useEffect(() => {
    speakQuestion(initialSession.question);
    return () => {
      audioRecorder.stop();
      sttSocketManager.disconnect();
      ttsSocketManager.disconnect();
    };
  }, []);

  // -------------------------------------------------------------
  // TTS (Text-to-Speech) Audio Chunk Scheduling & Playback
  // -------------------------------------------------------------
  const speakQuestion = (text: string) => {
    if (!text) return;
    setError(null);

    // Initialize/resume the AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 22050, // Match Piper model sample rate output configuration
      });
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Reset playback scheduler clock
    scheduledTimeRef.current = audioContextRef.current.currentTime;

    ttsSocketManager.requestSpeech(
      text,
      (audioChunk: ArrayBuffer) => {
        playRawPCMChunk(audioChunk);
      },
      () => {
        console.log("TTS audio streaming finished successfully.");
      },
      (_err) => {
        setError("Error streaming voice audio. You can read the question text instead.");
      }
    );
  };

  /**
   * Decodes a raw binary float16/int16 PCM audio chunk and schedules it on the Web Audio timeline.
   */
  const playRawPCMChunk = (arrayBuffer: ArrayBuffer) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    // Piper synthesizes 16-bit Mono PCM (2 bytes per sample)
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);

    // Convert PCM signed 16-bit integers back into float amplitudes [-1.0, 1.0]
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    // Create an audio buffer
    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, audioCtx.sampleRate);
    audioBuffer.copyToChannel(float32Array, 0);

    // Play buffer
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    // Schedule the buffer to play continuously after the previously scheduled chunks
    const startTime = Math.max(scheduledTimeRef.current, audioCtx.currentTime);
    source.start(startTime);

    // Increment the schedule clock by the duration of the current chunk
    scheduledTimeRef.current = startTime + audioBuffer.duration;
  };

  // -------------------------------------------------------------
  // STT (Speech-to-Text) Audio Capture Handlers
  // -------------------------------------------------------------
  const handleMicToggle = async () => {
    if (micState === 'idle') {
      setError(null);
      setTranscript('');
      setMicState('recording');

      // 1. Connect Speech-to-Text WebSocket
      sttSocketManager.connect(
        (data) => {
          setTranscript(data.transcript);
        },
        (_err) => {
          setError("Speech translation server disconnected. You can type in the box.");
          setMicState('idle');
          audioRecorder.stop();
        }
      );

      // 2. Start capturing microphone stream and feed it to the WebSocket
      try {
        await audioRecorder.start((blobChunk) => {
          sttSocketManager.sendAudioChunk(blobChunk);
        });
      } catch (err: any) {
        setError(err.message || "Failed to access microphone.");
        setMicState('idle');
        sttSocketManager.disconnect();
      }

    } else if (micState === 'recording') {
      // Toggle off recording
      setMicState('idle');
      audioRecorder.stop();
      sttSocketManager.disconnect();
    }
  };

  // -------------------------------------------------------------
  // Submit Finalized Answer
  // -------------------------------------------------------------
  const handleAnswerSubmit = async () => {
    if (!transcript.trim()) return;

    setIsSubmitting(true);
    setError(null);

    // Stop recorder and sockets if they are still recording
    if (micState === 'recording') {
      audioRecorder.stop();
      sttSocketManager.disconnect();
      setMicState('idle');
    }

    try {
      const response = await api.submitAnswer(session.session_id, transcript);

      if (response.is_complete) {
        onInterviewEnded(session.session_id);
      } else {
        // Clear screen elements and set next question state
        setSession(response);
        setTranscript('');
        
        // Auto-play the next question
        speakQuestion(response.question);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndInterviewEarly = async () => {
    if (window.confirm("Are you sure you want to end this interview early?")) {
      try {
        await api.endSession(session.session_id);
        onInterviewEnded(session.session_id);
      } catch (err) {
        console.error("Error ending session:", err);
        onInterviewEnded(session.session_id); // Transition anyway
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Live Interview Room</h2>
        <button onClick={handleEndInterviewEarly} style={styles.exitButton}>
          Leave Room
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <strong>Warning:</strong> {error}
        </div>
      )}

      <div style={styles.content}>
        {/* Current Question Info */}
        <QuestionCard
          question={session.question}
          questionNumber={session.question_number}
          questionType={session.question_type}
        />

        {/* User live speech verification box */}
        <TranscriptBox
          transcript={transcript}
          isRecording={micState === 'recording'}
          onTranscriptChange={setTranscript}
        />

        {/* Input Interface Area */}
        <div style={styles.controlsSection}>
          <MicButton state={micState} onClick={handleMicToggle} />
          
          <AnswerCompleteButton
            onClick={handleAnswerSubmit}
            disabled={!transcript.trim() || micState === 'recording'}
            isProcessing={isSubmitting}
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
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #e8eaed',
    paddingBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    color: '#202124',
    fontWeight: 600,
  },
  exitButton: {
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    border: '1px solid #f5c2c1',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  errorBanner: {
    backgroundColor: '#fce8e6',
    color: '#c5221f',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #f5c2c1',
    fontSize: '0.95rem',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  controlsSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #dadce0',
  },
};