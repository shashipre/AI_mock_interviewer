export type AudioDataCallBack = (chunk: Blob) => void;

export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private stream: MediaStream | null = null;
    private timeslice: number;

    constructor(timeslice: number = 250){
        this.timeslice = timeslice
    }

    public async requestPermission(): Promise<boolean>{
        try{
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            return true
        } catch(error){
            console.error("Microphone access denied or unavailable:", error);
            return false;
        }
    }

    public async start(onDataAvailable: AudioDataCallBack): Promise<void> {
        // 1. Verify and request mic stream if not present
        if (!this.stream || !this.stream.active) {
            const granted = await this.requestPermission();
            if (!granted) {
                throw new Error("Unable to start recording: Microphone permission not granted.");
            }
        }
        // 2. Prevent starting if already recording
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            console.warn("AudioRecorder is already recording.");
            return;
        }
        // 3. Select browser-supported audio mime-types
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
            mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
        }
        // 4. Construct MediaRecorder, assign callback, and start slicing chunks
        try {
            this.mediaRecorder = new MediaRecorder(this.stream!, { mimeType });
            this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data && event.data.size > 0) {
                    onDataAvailable(event.data); // <-- This uses onDataAvailable parameter
                }
            };
            this.mediaRecorder.start(this.timeslice);
            console.log(`Audio recording started with mimeType: ${mimeType} at ${this.timeslice}ms intervals.`);
        } catch (error) {
            console.error("Failed to initialize MediaRecorder:", error);
            throw error;
        }
    }
    public isRecording(): boolean {
        return this.mediaRecorder !== null && this.mediaRecorder.state === "recording";
    }

    public stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
      console.log("Audio recording stopped.");
    }
    // Stop all audio tracks in the media stream to release hardware indicators (microphone light)
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      this.stream = null;
    }
    this.mediaRecorder = null;
  }
}

export const audioRecorder = new AudioRecorder(250);