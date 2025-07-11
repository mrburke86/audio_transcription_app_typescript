// // src/app/chat/_components/ErrorState.tsx
// import { AlertTriangle, RefreshCw } from 'lucide-react'; // Added RefreshCw for retry button

// interface ErrorStateProps {
//     title?: string; // Title is now optional, with a default
//     message: string; // Changed from knowledgeError to a more generic message
//     onRetry?: () => void;
//     showTroubleshooting?: boolean; // Optional flag to show generic troubleshooting
// }

// export const ErrorState = ({ title = 'An Error Occurred', message, onRetry, showTroubleshooting = false }: ErrorStateProps) => (
//     <div className="flex flex-col items-center justify-center h-full p-8 bg-background text-foreground">
//         <div className="text-center max-w-md w-full p-6 border border-destructive/50 rounded-lg shadow-lg bg-card">
//             <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
//             <h2 className="text-2xl font-semibold text-destructive mb-3">{title}</h2>
//             <p className="text-destructive-foreground/80 mb-6">{message}</p>
//             {showTroubleshooting && (
//                 <div className="bg-muted/50 border border-border rounded-lg p-4 text-left text-sm mb-6">
//                     <h3 className="font-semibold text-card-foreground mb-2">Possible Steps:</h3>
//                     <ul className="space-y-1 text-muted-foreground">
//                         <li>• Check your internet connection.</li>
//                         <li>• Ensure all required services (like the AI provider or database) are running.</li>
//                         <li>• If the problem persists, please try again later or contact support.</li>
//                     </ul>
//                 </div>
//             )}
//             {onRetry && (
//                 <button
//                     onClick={onRetry}
//                     className="mt-4 inline-flex items-center px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background transition-colors duration-150"
//                 >
//                     <RefreshCw className="mr-2 h-4 w-4" />
//                     Try Again
//                 </button>
//             )}
//         </div>
//     </div>
// );
