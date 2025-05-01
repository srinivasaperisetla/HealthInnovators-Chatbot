'use client';
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from "react";
import { GeminiWebSocket } from '../services/geminiWebSocket';
import { Base64 } from 'js-base64';

// types/nppes.ts
type Provider = {
  number: string;
  basic: { first_name: string; last_name: string };
  addresses?: Array<{
    address_purpose: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    telephone_number?: string;
  }>;
  taxonomies?: Array<{ code?: string; desc?: string; primary?: boolean | 'Y' | 'N' }>;
};


interface CameraPreviewProps {
  onTranscription: (text: string) => void;
  onToolResponse: (providers: Provider[]) => void;
}

export interface CameraPreviewHandle {
  toggleCamera: () => void;
}

export interface CameraPreviewHandles {
  toggleCamera: () => Promise<void> | void;
  toggleAudio: () => Promise<void> | void;
  isStreaming: boolean;
  isAudioOnly: boolean;
  connectionStatus: string;
  audioLevel: number;
  isModelSpeaking: boolean;
  outputAudioLevel: number;
} 

const CameraPreview = forwardRef<CameraPreviewHandle, CameraPreviewProps>(
  ({ onTranscription, onToolResponse }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const geminiWsRef = useRef<GeminiWebSocket | null>(null);
    const videoCanvasRef = useRef<HTMLCanvasElement>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const [isAudioSetup, setIsAudioSetup] = useState(false);
    const setupInProgressRef = useRef(false);
    const [isWebSocketReady, setIsWebSocketReady] = useState(false);
    const imageIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [outputAudioLevel, setOutputAudioLevel] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

    useImperativeHandle(ref, () => ({
      toggleCamera,
    }));

    const cleanupWebSocket = useCallback(() => {
      geminiWsRef.current?.disconnect();
      geminiWsRef.current = null;
    }, []);

    const sendAudioData = (b64Data: string) => {
      geminiWsRef.current?.sendMediaChunk(b64Data, "audio/pcm");
    };

    // Initialize WebSocket connection
    useEffect(() => {
      if (!isStreaming) {
        setConnectionStatus('disconnected');
        return;
      }

      setConnectionStatus('connecting');
      geminiWsRef.current = new GeminiWebSocket(
        (text) => {
          console.log("Received from Gemini:", text);
        },
        () => {
          console.log("[Camera] WebSocket setup complete, starting media capture");
          setIsWebSocketReady(true);
          setConnectionStatus('connected');
        },
        (isPlaying) => {
          setIsModelSpeaking(isPlaying);
        },
        (level) => {
          setOutputAudioLevel(level);
        },
        onTranscription,
        onToolResponse
      );
      geminiWsRef.current.connect();

      return () => {
        if (imageIntervalRef.current) {
          clearInterval(imageIntervalRef.current);
          imageIntervalRef.current = null;
        }
        cleanupWebSocket();
        setIsWebSocketReady(false);
        setConnectionStatus('disconnected');
      };
    }, [isStreaming, onTranscription, onToolResponse, cleanupWebSocket]);

    useEffect(() => {
      if (!isStreaming || !isWebSocketReady) return;

      imageIntervalRef.current = setInterval(captureAndSendImage, 1000);

      return () => {
        if (imageIntervalRef.current) {
          clearInterval(imageIntervalRef.current);
          imageIntervalRef.current = null;
        }
      };
    }, [isStreaming, isWebSocketReady]);

    useEffect(() => {
      if (
        !isStreaming ||
        !stream ||
        !audioContextRef.current ||
        !isWebSocketReady ||
        isAudioSetup ||
        setupInProgressRef.current
      ) return;

      let isActive = true;
      setupInProgressRef.current = true;

      const setupAudioProcessing = async () => {
        try {
          const ctx = audioContextRef.current;
          if (!ctx || ctx.state === 'closed' || !isActive) return;

          if (ctx.state === 'suspended') await ctx.resume();

          await ctx.audioWorklet.addModule('/worklets/audio-processor.js');

          if (!isActive) return;

          audioWorkletNodeRef.current = new AudioWorkletNode(ctx, 'audio-processor', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            processorOptions: {
              sampleRate: 16000,
              bufferSize: 4096,
            },
            channelCount: 1,
            channelCountMode: 'explicit',
            channelInterpretation: 'speakers'
          });

          const source = ctx.createMediaStreamSource(stream);
          audioWorkletNodeRef.current.port.onmessage = (event) => {
            if (!isActive || isModelSpeaking) return;
            const { pcmData, level } = event.data;
            setAudioLevel(level);

            const pcmArray = new Uint8Array(pcmData);
            const b64Data = Base64.fromUint8Array(pcmArray);
            sendAudioData(b64Data);
          };

          source.connect(audioWorkletNodeRef.current);
          setIsAudioSetup(true);
        } catch (err) {
          cleanupAudio();
          setIsAudioSetup(false);
        } finally {
          setupInProgressRef.current = false;
        }
      };

      setupAudioProcessing();

      return () => {
        isActive = false;
        setIsAudioSetup(false);
        setupInProgressRef.current = false;
        if (audioWorkletNodeRef.current) {
          audioWorkletNodeRef.current.disconnect();
          audioWorkletNodeRef.current = null;
        }
      };
    }, [isStreaming, stream, isWebSocketReady, isModelSpeaking]);

    const cleanupAudio = useCallback(() => {
      audioWorkletNodeRef.current?.disconnect();
      audioWorkletNodeRef.current = null;

      audioContextRef.current?.close();
      audioContextRef.current = null;
    }, []);

    const toggleCamera = async () => {
      if (isStreaming && stream) {
        setIsStreaming(false);
        cleanupWebSocket();
        cleanupAudio();
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setStream(null);
      } else {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });

          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: true,
              autoGainControl: true,
              noiseSuppression: true,
            },
          });

          audioContextRef.current = new AudioContext({ sampleRate: 16000 });

          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
            videoRef.current.muted = true;
          }

          const combinedStream = new MediaStream([
            ...videoStream.getTracks(),
            ...audioStream.getTracks(),
          ]);

          setStream(combinedStream);
          setIsStreaming(true);
        } catch (err) {
          console.error("Error accessing media devices:", err);
          cleanupAudio();
        }
      }
    };

    const captureAndSendImage = () => {
      if (!videoRef.current || !videoCanvasRef.current || !geminiWsRef.current) return;

      const canvas = videoCanvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      const b64Data = imageData.split(',')[1];
      geminiWsRef.current.sendMediaChunk(b64Data, "image/jpeg");
    };

    return (
      <div className="h-full w-full rounded-lg bg-neutral-900 border border-neutral-700 flex flex-col items-center justify-center p-4 space-y-4 relative">
  
        {/* Video Feed */}
        <div className="flex justify-center items-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-[640px] h-[480px] bg-muted rounded-lg overflow-hidden"
          />
        </div>
      
        {/* Connection Overlay */}
        {isStreaming && connectionStatus !== 'connected' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
              <p className="text-white font-medium">
                {connectionStatus === 'connecting' ? 'Connecting to Gemini...' : 'Disconnected'}
              </p>
              <p className="text-white/70 text-sm">
                Please wait while we establish a secure connection
              </p>
            </div>
          </div>
        )}
      
        {/* Audio Level Bar */}
        {isStreaming && (
          <div className="w-[640px] h-2 rounded-full bg-green-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{
                width: `${isModelSpeaking ? outputAudioLevel : audioLevel}%`,
                transition: 'width 100ms ease-out',
              }}
            />
          </div>
        )}
      
        {/* Hidden canvas for image snapshots */}
        <canvas ref={videoCanvasRef} className="hidden" />
      </div>
      
    );
  }
);

export default CameraPreview;
