// // src/hooks/useVoskSpeechRecognition.ts
// import { useEffect, useState } from "react";
// import { Model, Recognizer } from "vosk-browser";

// const getAudioStreamFromDevice = async (
//   deviceId: string
// ): Promise<MediaStream> => {
//   const constraints = {
//     audio: {
//       deviceId: deviceId ? { exact: deviceId } : undefined,
//     },
//     video: false,
//   };
//   return await navigator.mediaDevices.getUserMedia(constraints);
// };

// const useVoskSpeechRecognition = () => {
//   const [model, setModel] = useState<Model | null>(null);
//   const [recognizer, setRecognizer] = useState<Recognizer | null>(null);
//   const [transcript, setTranscript] = useState<string>("");

//   useEffect(() => {
//     const initModel = async () => {
//       const model = new Model("path_to_model"); // You need to provide a path to the Vosk model files
//       setModel(model);
//     };
//     initModel();
//   }, []);

//   const startRecognition = async (deviceId: string) => {
//     if (!model) return;

//     const stream = await getAudioStreamFromDevice(deviceId);
//     const audioContext = new AudioContext();
//     const source = audioContext.createMediaStreamSource(stream);

//     const recognizer = new Recognizer({
//       model,
//       sampleRate: audioContext.sampleRate,
//     });
//     setRecognizer(recognizer);

//     const processor = audioContext.createScriptProcessor(4096, 1, 1);
//     processor.onaudioprocess = (event) => {
//       const data = event.inputBuffer.getChannelData(0);
//       recognizer.acceptWaveform(data);
//       const result = recognizer.result();
//       if (result && result.text) {
//         setTranscript((prev) => prev + " " + result.text);
//       }
//     };

//     source.connect(processor);
//     processor.connect(audioContext.destination);
//   };

//   const stopRecognition = () => {
//     recognizer?.free();
//     setRecognizer(null);
//   };

//   return {
//     startRecognition,
//     stopRecognition,
//     transcript,
//   };
// };

// export default useVoskSpeechRecognition;
