//
export const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Knowledge Base</h2>
            <p className="text-gray-600">Initializing ETQ product knowledge...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment on first load</p>
        </div>
    </div>
);
