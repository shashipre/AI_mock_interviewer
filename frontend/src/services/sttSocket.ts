export interface STTMessage {
    transcript: string;
    is_final: boolean;
    confidence: number;
}

export type STTCallback = (data: STTMessage) => void;
export type STTErrorCallback = (event: Event) => void;

export class STTWebSocketManager {
    private socket: WebSocket | null = null;
    private wsUrl: string;

    constructor() {
        const basseWSUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

        this.wsUrl = `${basseWSUrl}/api/v1/audio/stream`;
    }

    public connect(onMessage: STTCallback, onError?: STTErrorCallback): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.warn("STT WebSocket is already connected.");
            return;
        }

        this.socket = new WebSocket(this.wsUrl);

        this.socket.onopen = () => {
            console.log("Connected to STT WebSocket server.");
        };

        this.socket.onmessage = (event: MessageEvent) => {
            try {
                const payload: STTMessage = JSON.parse(event.data);
                onMessage(payload);
            } catch(err) {
                console.error("Failed to parse STT message:", err, event.data);
            }
        };

        this.socket.onerror = (event: Event) => {
            console.error("STT WebSocket encountered an error:", event);

            if(onError) {
                onError(event);
            }
        };

        this.socket.onclose = (event: CloseEvent) => {
            console.groupCollapsed(`STT WebSocket connection cloases (Code: ${event.code}).`);
        };
    }

    public sendAudioChunk(chunk: ArrayBuffer| Blob): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("STT WebSocket is not open. Unable to send audio chunk. ");
            return;
        }

        this.socket.send(chunk);
    }

    public disconnect(): void {
        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                this.socket.close(1000, "Normal closure");
            }
            this.socket = null;
        }
    }

    public isConnected(): boolean {
        return this.socket != null && this.socket.readyState === WebSocket.OPEN;
    }
}

export const sttSocketManager = new STTWebSocketManager();