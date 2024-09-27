// src/components/ui/Skeleton.tsx

import React from "react";

interface SkeletonProps {
    count?: number;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ count = 1, className = "" }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`animate-pulse bg-gray-200 rounded ${className}`}
                ></div>
            ))}
        </>
    );
};

export default Skeleton;
