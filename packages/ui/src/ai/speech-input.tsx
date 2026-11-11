import { Button } from "@sift-design/ui/button";
import { Spinner } from "@sift-design/ui/spinner";
import { cn } from "cn";
import { IconMicrophone, IconPlayerStop } from "@tabler/icons-react";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

const recognitionConstructor = () => {
  const scope = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
};

type SpeechInputMode = "speech-recognition" | "media-recorder" | "none";

export type SpeechInputProps = ComponentProps<typeof Button> & {
  onTranscriptionChange?: (text: string) => void;
  /** Convert recorded audio to text when speech recognition is unavailable. */
  onAudioRecorded?: (audioBlob: Blob) => Promise<string>;
  lang?: string;
  /** Simulate listening without microphone access. Emits a growing transcript. */
  simulate?: boolean;
  simulatedTranscript?: string;
  onListeningChange?: (listening: boolean) => void;
  onSpeechError?: (message: string) => void;
};

const detectSpeechInputMode = (): SpeechInputMode => {
  if (typeof window === "undefined") return "none";
  if (recognitionConstructor()) return "speech-recognition";
  if (typeof MediaRecorder !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function")
    return "media-recorder";
  return "none";
};

export const SpeechInput = ({
  className,
  onTranscriptionChange,
  onAudioRecorded,
  lang = "en-US",
  simulate = false,
  simulatedTranscript = "Check the greenhouse vents before watering the seedlings.",
  onListeningChange,
  onSpeechError,
  onClick,
  disabled,
  children,
  size = "icon",
  variant = "outline",
  ...props
}: SpeechInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<SpeechInputMode>("none");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(false);
  const busyRef = useRef(false);
  const callbacks = useRef({ onTranscriptionChange, onAudioRecorded, onListeningChange, onSpeechError });
  callbacks.current = { onTranscriptionChange, onAudioRecorded, onListeningChange, onSpeechError };

  useEffect(() => {
    mounted.current = true;
    setMode(detectSpeechInputMode());
    return () => {
      mounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const listening = (value: boolean) => {
    if (!mounted.current) return;
    setIsListening(value);
    callbacks.current.onListeningChange?.(value);
  };
  const fail = (message: string) => {
    if (!mounted.current) return;
    busyRef.current = false;
    setIsStarting(false);
    setIsProcessing(false);
    listening(false);
    setError(message);
    callbacks.current.onSpeechError?.(message);
  };

  const start = async () => {
    if (busyRef.current) return;
    setError("");
    if (simulate) {
      listening(true);
      const words = simulatedTranscript.trim().split(/\s+/);
      let count = 0;
      timerRef.current = setInterval(() => {
        count += 1;
        callbacks.current.onTranscriptionChange?.(words.slice(0, count).join(" "));
        if (count >= words.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          listening(false);
        }
      }, 240);
      return;
    }
    busyRef.current = true;
    setIsStarting(true);
    try {
      if (mode === "speech-recognition") {
        const Recognition = recognitionConstructor();
        if (!Recognition) throw new Error("Speech recognition is unavailable.");
        const recognition = new Recognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;
        recognition.onstart = () => {
          if (!mounted.current) return;
          busyRef.current = false;
          setIsStarting(false);
          listening(true);
        };
        recognition.onend = () => {
          if (!mounted.current) return;
          busyRef.current = false;
          setIsStarting(false);
          listening(false);
        };
        recognition.onresult = (event) => {
          if (!mounted.current) return;
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            if (event.results[i].isFinal) transcript += event.results[i][0]?.transcript ?? "";
          }
          if (transcript) callbacks.current.onTranscriptionChange?.(transcript);
        };
        recognition.onerror = (event) =>
          fail(
            event.error === "not-allowed"
              ? "Microphone access was denied. Check browser permissions and try again."
              : "Speech capture stopped. Try recording again.",
          );
        recognition.start();
      } else if (mode === "media-recorder" && callbacks.current.onAudioRecorded) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size) chunks.push(event.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          if (!mounted.current) return;
          listening(false);
          setIsProcessing(true);
          try {
            const blob = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type });
            const text = await callbacks.current.onAudioRecorded?.(blob);
            if (mounted.current && text) callbacks.current.onTranscriptionChange?.(text);
          } catch {
            fail("Audio could not be transcribed. Try recording again.");
          } finally {
            if (mounted.current) setIsProcessing(false);
          }
        };
        recorder.onerror = () => {
          stream.getTracks().forEach((track) => track.stop());
          fail("Audio capture stopped. Try recording again.");
        };
        recorder.start();
        busyRef.current = false;
        setIsStarting(false);
        listening(true);
      } else {
        busyRef.current = false;
        setIsStarting(false);
      }
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      fail("Microphone access failed. Check browser permissions and try again.");
    }
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    recognitionRef.current?.stop();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    listening(false);
  };
  const unavailable = !simulate && (mode === "none" || (mode === "media-recorder" && !onAudioRecorded));
  const state = isStarting ? "starting" : isProcessing ? "processing" : isListening ? "listening" : "idle";

  return (
    <span data-slot="speech-input" data-state={state} className="relative inline-flex items-center">
      <Button
        type="button"
        size={size}
        variant={variant}
        className={cn(
          "relative rounded-full",
          isListening && "border-primary bg-accent-soft text-foreground",
          className,
        )}
        disabled={disabled || unavailable || isStarting || isProcessing}
        aria-label={isListening ? "Stop recording" : "Start recording"}
        aria-pressed={isListening}
        aria-busy={isProcessing || isStarting}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            if (isListening) stop();
            else void start();
          }
        }}
        {...props}
      >
        {isProcessing || isStarting ? (
          <Spinner />
        ) : isListening ? (
          <IconPlayerStop aria-hidden className="size-4" />
        ) : (
          <IconMicrophone aria-hidden className="size-4" />
        )}
        {children}
      </Button>
      <span className="sr-only" role="status">
        {error ||
          (unavailable
            ? "Speech input is unavailable."
            : isStarting
              ? "Waiting for microphone access."
              : isProcessing
                ? "Transcribing audio."
                : isListening
                  ? "Listening."
                  : "Ready to record.")}
      </span>
    </span>
  );
};
