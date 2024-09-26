// src/lib/useSpeechRecognition.ts
import { useCallback, useRef } from "react";
import { logger } from "@/modules/Logger";
import { usePerformance } from "@/contexts/PerformanceContext"; // Import usePerformance

interface SpeechRecognitionHook {
  start: () => Promise<void>;
  stop: () => void;
  startAudioVisualization: (canvas: HTMLCanvasElement) => void;
}

interface SpeechRecognitionProps {
  onStart: () => void;
  onEnd: () => void;
  onError: (event: SpeechRecognitionErrorEvent) => void;
  onResult: (finalTranscript: string, interimTranscript: string) => void;
}

const useSpeechRecognition = ({
  onStart,
  onEnd,
  onError,
  onResult,
}: SpeechRecognitionProps): SpeechRecognitionHook => {
  const recognition = useRef<SpeechRecognition | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const shouldRestart = useRef(false);

  const { addEntry } = usePerformance(); // Use the performance context

  const start = useCallback(async () => {
    shouldRestart.current = true; // Enable automatic restarting

    if (!recognition.current) {
      recognition.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      // onstart - start the recognition
      recognition.current.onstart = () => {
        onStart();
        performance.mark("speechRecognition_onstart");
        performance.measure(
          "speechRecognition_setup_time",
          "speechRecognition_start",
          "speechRecognition_onstart"
        );
        const measures = performance.getEntriesByName(
          "speechRecognition_setup_time"
        );
        if (measures.length > 0) {
          const measure = measures[0];
          addEntry({
            name: "speechRecognition_setup_time",
            duration: measure.duration,
            startTime: measure.startTime,
            endTime: measure.startTime + measure.duration,
          });
          // Log to console and LogBox via logger
          logger.performance(
            `Speech recognition setup time: ${measure.duration.toFixed(2)}ms`
          );
        }
      };

      // onend - restart the recognition
      recognition.current.onend = () => {
        onEnd();
        if (shouldRestart.current) {
          try {
            recognition.current?.start();
          } catch (error) {
            logger.error(
              `Failed to restart speech recognition: ${
                (error as Error).message
              }`
            );
          }
        }
      };

      // onerror - restart the recognition
      recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        onError(event);
        if (shouldRestart.current) {
          // Optionally implement a delay or retry mechanism here
          try {
            recognition.current?.start();
          } catch (error) {
            logger.error(
              `Failed to restart speech recognition after error: ${
                (error as Error).message
              }`
            );
          }
        }
      };

      // onresult - process the result
      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        onResult(finalTranscript, interimTranscript);
        // logger.performance(
        //     `Speech recognition result processing time: ${(
        //         performance.now() - event.timeStamp
        //     ).toFixed(2)}ms`,
        // );
      };
    }

    performance.mark("speechRecognition_start");
    recognition.current.start();
  }, [onStart, onEnd, onError, onResult, addEntry]);

  const stop = useCallback(() => {
    shouldRestart.current = false; // Disable automatic restarting

    if (recognition.current) {
      recognition.current.stop();
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (microphone.current) {
      microphone.current.disconnect();
      microphone.current = null;
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
    }
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
  }, []);

  const startAudioVisualization = useCallback((canvas: HTMLCanvasElement) => {
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    audioContext.current = new (window.AudioContext || window.AudioContext)();
    analyser.current = audioContext.current.createAnalyser();
    analyser.current.fftSize = 256;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        mediaStream.current = stream;
        microphone.current =
          audioContext.current!.createMediaStreamSource(stream);

        const bufferLength = analyser.current!.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          animationFrameId.current = requestAnimationFrame(draw);
          analyser.current!.getByteFrequencyData(dataArray);

          canvasCtx.fillStyle = "rgb(25, 25, 25)";
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * (canvas.height * 0.6); // Reduce bar height to 60% of canvas height

            canvasCtx.fillStyle = `rgb(50, ${dataArray[i] + 100}, 50)`;
            canvasCtx.fillRect(
              x,
              canvas.height - barHeight,
              barWidth,
              barHeight
            );

            x += barWidth + 1;
          }
        };

        draw();
      })
      .catch((err) => console.error("Error accessing microphone:", err));
  }, []);

  return { start, stop, startAudioVisualization };
};

export default useSpeechRecognition;
