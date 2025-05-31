// // src/contexts/PerformanceContext.tsx

// "use client";

// import React, { createContext, useContext, useState, ReactNode } from "react";
// // import { logger } from "@/modules/Logger"; // Ensure logger has a 'performance' method

// // Define the structure of a performance entry
// export interface ExtendedPerformanceEntry {
//     name: string;
//     duration: number;
//     startTime: number;
//     endTime: number;
//     queryId?: string; // Make queryId optional to maintain backward compatibility
// }

// // Define the context properties
// interface PerformanceContextProps {
//     entries: ExtendedPerformanceEntry[];
//     addEntry: (entry: ExtendedPerformanceEntry) => void;
// }

// // Create the context
// const PerformanceContext = createContext<PerformanceContextProps | undefined>(
//     undefined,
// );

// // Define the props for PerformanceProvider
// // interface PerformanceProviderProps {
// //     children: ReactNode;
// // }

// // Implement the PerformanceProvider
// export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({
//     children,
// }) => {
//     const [entries, setEntries] = useState<ExtendedPerformanceEntry[]>([]);

//     // Function to add a performance entry
//     const addEntry = (entry: ExtendedPerformanceEntry) => {
//         setEntries((prevEntries) => [...prevEntries, entry]);
//     };

//     return (
//         <PerformanceContext.Provider value={{ entries, addEntry }}>
//             {children}
//         </PerformanceContext.Provider>
//     );
// };

// // Custom hook to use the PerformanceContext
// export const usePerformance = (): PerformanceContextProps => {
//     const context = useContext(PerformanceContext);
//     if (!context) {
//         throw new Error(
//             "usePerformance must be used within a PerformanceProvider",
//         );
//     }
//     return context;
// };
