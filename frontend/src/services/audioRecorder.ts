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

        if(!this.stream || !this.stream.active) {
            const granted = await this.requestPermission();
            if(!granted){
                throw new Error("Unable to start recording: Microphone permission not granted.");
            }
        }
        if(this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            this.mediaRecorder.stop();
            console.log("Audio recording stopped.");
        }

        if(this.stream) {
            this.stream.getTracks().forEach((track) => {
                if(track.readyState === "live"){
                    track.stop();
                }
            });
            this.stream = null;
        }

        this.mediaRecorder = null;
    }

    public isRecording(): boolean {
        return this.mediaRecorder !== null && this.mediaRecorder.state === "recording";
    }
}

export const audioRecorder = new AudioRecorder(250);