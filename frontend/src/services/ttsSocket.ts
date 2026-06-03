export type TTSAudioChunkCallback = (audioData: ArrayBuffer) => void;
export type TTSCompleteCallback = () => void;
export type TTSErrorCallback = (event: Event) => void;
export class TTSWebSocketManager {
  private socket: WebSocket | null = null;
  private wsUrl: string;
  constructor() {
    const baseWSUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
    this.wsUrl = `${baseWSUrl}/api/v1/audio/speak`;
  }
  /**
   * Connect to the TTS service, send the target text, and receive streamed audio chunks.
   * 
   * @param text The question text to convert to speech.
   * @param onAudioChunk Callback executed when a raw binary audio chunk (PCM) is received.
   * @param onComplete Callback executed when backend signals that synthesis is complete.
   * @param onError Optional callback for handling error events.
   */
  public requestSpeech(
    text: string,
    onAudioChunk: TTSAudioChunkCallback,
    onComplete: TTSCompleteCallback,
    onError?: TTSErrorCallback
  ): void {
    // If there is an existing stream running, close it first
    this.disconnect();
    this.socket = new WebSocket(this.wsUrl);
    
    // Explicitly enforce binary responses as ArrayBuffer for streaming playback processing
    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = () => {
      console.log("Connected to TTS WebSocket server. Sending request payload...");
      // Send text configuration payload to synthesis engine
      this.socket?.send(JSON.stringify({ text }));
    };
    this.socket.onmessage = (event: MessageEvent) => {
      // Audio chunks are returned as ArrayBuffer binaries
      if (event.data instanceof ArrayBuffer) {
        onAudioChunk(event.data);
      } else {
        // String messages signify metadata signals (e.g. status complete)
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'complete') {
            console.log("TTS audio streaming complete.");
            onComplete();
            this.disconnect(); // Clean up connection
          }
        } catch (err) {
          console.error("Failed to parse non-binary TTS message:", err);
        }
      }
    };
    this.socket.onerror = (event: Event) => {
      console.error("TTS WebSocket encountered an error:", event);
      if (onError) {
        onError(event);
      }
    };
    this.socket.onclose = (event: CloseEvent) => {
      console.log(`TTS WebSocket connection closed (Code: ${event.code}).`);
    };
  }
  /**
   * Tear down the WebSocket connection.
   */
  public disconnect(): void {
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close(1000, "Normal closure / Disconnect");
      }
      this.socket = null;
    }
  }
  /**
   * Check connection status
   */
  public isStreaming(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
export const ttsSocketManager = new TTSWebSocketManager();