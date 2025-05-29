// // src\components\chat\VoiceControls.tsx
// 'use client';

// import type React from 'react';
// import { Button } from '@/components/ui/button';
// import { Mic, Square, Trash } from 'lucide-react';
// import { Card } from '../ui';

// interface VoiceControlsProps {
//     onStart: () => void;
//     onStop: () => void;
//     onClear: () => void;
//     isRecognitionActive: boolean;
//     canvasRef: React.RefObject<HTMLCanvasElement>;
// }

// const VoiceControls: React.FC<VoiceControlsProps> = ({ onStart, onStop, onClear, isRecognitionActive, canvasRef }) => {
//     return (
//         <Card className="h-full flex flex-col p-4">
//             {/* Header */}
//             <div className="flex items-center gap-2 mb-4">
//                 <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
//                     <Mic className="w-3 h-3 text-green-600" />
//                 </div>
//                 <h3 className="text-sm font-medium text-gray-900">Voice Controls</h3>
//             </div>

//             {/* Control Buttons */}
//             <div className="flex gap-2 mb-4">
//                 {isRecognitionActive ? (
//                     <Button
//                         variant="ghost"
//                         onClick={onStop}
//                         className="flex-1 justify-start h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
//                     >
//                         <Square className="mr-2 h-3 w-3" />
//                         Stop Recording
//                     </Button>
//                 ) : (
//                     <Button
//                         variant="ghost"
//                         onClick={onStart}
//                         className="flex-1 justify-start h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
//                     >
//                         <Mic className="mr-2 h-3 w-3" />
//                         Start Recording
//                     </Button>
//                 )}

//                 <Button
//                     variant="ghost"
//                     onClick={onClear}
//                     className="flex-1 justify-start h-8 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
//                 >
//                     <Trash className="mr-2 h-3 w-3" />
//                     Clear Session
//                 </Button>
//             </div>

//             {/* Audio Visualizer */}
//             <div className="flex-1 bg-slate-800 rounded-lg p-3 flex items-center justify-center min-h-0">
//                 <canvas
//                     ref={canvasRef}
//                     id="audioVisualizer"
//                     className="w-full h-full max-w-full max-h-full"
//                     style={{ maxHeight: '80px' }}
//                 />
//             </div>
//         </Card>
//     );
// };

// export default VoiceControls;
