//
export default function Loading() {
    return (
        <div className="container mx-auto p-4 space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-48 bg-muted-foreground rounded"></div>
                <div className="h-10 w-32 bg-muted-foreground rounded"></div>
            </div>

            {/* Search Input Skeleton */}
            <div className="h-10 w-full bg-muted-foreground rounded mb-4"></div>

            {/* Tabs Skeleton */}
            <div className="flex space-x-4 mb-4">
                <div className="h-8 w-24 bg-muted-foreground rounded"></div>
                <div className="h-8 w-24 bg-muted-foreground rounded"></div>
                <div className="h-8 w-24 bg-muted-foreground rounded"></div>
            </div>

            {/* Card Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col bg-muted-foreground rounded-lg p-4 space-y-4"
                    >
                        {/* Avatar and Title */}
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-muted-foreground rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-muted-foreground rounded"></div>
                                <div className="h-4 w-24 bg-muted-foreground rounded mt-2"></div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="h-16 w-full bg-muted-foreground rounded"></div>

                        {/* Buttons */}
                        <div className="flex justify-between space-x-2">
                            <div className="h-10 w-full bg-muted-foreground rounded"></div>
                            <div className="h-10 w-full bg-muted-foreground rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
