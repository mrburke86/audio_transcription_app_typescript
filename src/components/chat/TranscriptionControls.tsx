// // src/components/chat/TranscriptionControls.tsx
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Mic, Square, Trash } from "lucide-react";

// interface TranscriptionControlsProps {
//     onStart: () => void;
//     onStop: () => void;
//     onMove: () => void;
//     onClear: () => void;
//     isRecognitionActive: boolean;
// }

// const TranscriptionControls: React.FC<TranscriptionControlsProps> = ({
//     onStart,
//     onStop,
//     onClear,
//     isRecognitionActive,
// }) => {
//     return (
//         <div className="flex justify-center">
//             <div className="flex space-x-4">
//                 <Button
//                     variant="start"
//                     onClick={onStart}
//                     disabled={isRecognitionActive}
//                 >
//                     <Mic className="mr-1 h-4 w-4" />
//                     Start
//                 </Button>
//                 <Button
//                     variant="stop"
//                     onClick={onStop}
//                     disabled={!isRecognitionActive}
//                 >
//                     <Square className="mr-1 h-4 w-4" />
//                     Stop
//                 </Button>
//                 {/* <Button variant="move" onClick={onMove}>
//                     <ArrowRight className="mr-1 h-4 w-4" />
//                     Move
//                 </Button> */}
//                 <Button variant="clear" onClick={onClear}>
//                     <Trash className="mr-1 h-4 w-4" />
//                     Clear
//                 </Button>
//             </div>
//         </div>
//     );
// };

// export default TranscriptionControls;
