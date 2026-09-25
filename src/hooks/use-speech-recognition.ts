"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type SpeechRecognitionResultLike = ArrayLike<{ transcript: string }> & {
  isFinal: boolean;
};

type SpeechRecognitionResultEventLike = Event & {
  results: ArrayLike<SpeechRecognitionResultLike>;
  resultIndex?: number;
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
  message?: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function speechErrorMessage(code: string) {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. Allow microphone permission for this site, then try again.";
    case "audio-capture":
      return "No working microphone was found. Check your device input settings and try again.";
    case "no-speech":
      return "I could not hear any speech. Move closer to the microphone and try again.";
    case "network":
      return "Voice recognition could not reach the speech service. Check your connection and try again.";
    case "language-not-supported":
      return "Your current speech language is not supported. Try English in your browser settings.";
    default:
      return "Voice recognition stopped unexpectedly. Please try the microphone again.";
  }
}

const subscribeToSpeechSupport = () => () => {};
const getServerSpeechSupport = () => false;
const getBrowserSpeechSupport = () =>
  window.isSecureContext &&
  Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

type MicrophonePermission = "granted" | "prompt" | "denied" | "unknown";

function microphoneAccessError(caught: unknown) {
  if (caught instanceof DOMException) {
    if (caught.name === "NotAllowedError" || caught.name === "SecurityError") {
      return "Microphone permission is blocked at the browser or operating-system level. Allow it for this site, then return here and press Use mic again.";
    }
    if (caught.name === "NotFoundError" || caught.name === "DevicesNotFoundError") {
      return "No microphone was found. Connect or enable a microphone in your device settings.";
    }
    if (caught.name === "NotReadableError" || caught.name === "TrackStartError") {
      return "Another application may be using the microphone. Close it and try again.";
    }
  }
  return "The microphone could not be opened. Check the site and operating-system permissions, then try again.";
}

export function useSpeechRecognition({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const isSupported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getBrowserSpeechSupport,
    getServerSpeechSupport,
  );
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<MicrophonePermission>("unknown");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wantsToListenRef = useRef(false);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  useEffect(() => {
    return () => {
      wantsToListenRef.current = false;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!navigator.permissions?.query) return;
    let active = true;
    let status: PermissionStatus | null = null;
    let updatePermission: (() => void) | null = null;

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        if (!active) return;
        status = result;
        updatePermission = () => {
          if (!active || !status) return;
          setPermissionState(status.state);
          if (status.state === "granted") setError(null);
        };
        updatePermission();
        status.addEventListener("change", updatePermission);
      })
      .catch(() => setPermissionState("unknown"));

    return () => {
      active = false;
      if (status && updatePermission) {
        status.removeEventListener("change", updatePermission);
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    wantsToListenRef.current = false;
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!window.isSecureContext) {
      setError("Microphone access requires a secure HTTPS connection.");
      return false;
    }
    if (!Recognition) {
      setError("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return false;
    }

    setError(null);
    wantsToListenRef.current = true;
    recognitionRef.current?.abort();
    streamRef.current?.getTracks().forEach((track) => track.stop());

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        // Keeping the stream alive avoids a Chrome race where recognition starts
        // and ends before it receives audio after permission is granted.
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        setPermissionState("granted");
      }
      const recognition = new Recognition();
      const startingText = valueRef.current.trim();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = navigator.language || "en-IN";
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let spokenText = "";
        for (let index = event.resultIndex ?? 0; index < event.results.length; index += 1) {
          spokenText += `${event.results[index][0]?.transcript ?? ""} `;
        }
        const transcript = [startingText, spokenText.trim()].filter(Boolean).join(" ");
        onChangeRef.current(transcript);
      };
      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === "no-speech") {
          setError("I did not hear speech yet. Keep the microphone on and start your answer.");
          return;
        }
        wantsToListenRef.current = false;
        recognitionRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (event.error !== "aborted") setError(speechErrorMessage(event.error));
      };
      recognition.onend = () => {
        setIsListening(false);
        // Browsers can close recognition on a short pause even with continuous=true.
        if (wantsToListenRef.current) {
          window.setTimeout(() => {
            if (!wantsToListenRef.current || recognitionRef.current !== recognition) return;
            try {
              recognition.start();
            } catch {
              // A pending restart is harmless; the learner can always retry.
            }
          }, 200);
          return;
        }
        recognitionRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch (caught) {
      wantsToListenRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(
        caught instanceof DOMException && caught.name === "InvalidStateError"
          ? "The microphone is already starting. Wait a moment and try again."
          : microphoneAccessError(caught),
      );
      return false;
    }
  }, []);

  return {
    isSupported,
    isListening,
    error,
    permissionState,
    startListening,
    stopListening,
  };
}
