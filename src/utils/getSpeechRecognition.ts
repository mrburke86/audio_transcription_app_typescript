// utils/getSpeechRecognition.ts
export function getSpeechRecognition(): typeof SpeechRecognition | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}
