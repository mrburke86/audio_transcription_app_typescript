// src\utils\performance\PerformanceDashboard.tsx
'use client';
import { useEffect, useState } from 'react';
import { performanceMonitor } from './PerformanceMonitor';

const PerformanceDashboard = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [metrics, setMetrics] = useState(performanceMonitor.exportMetrics());
    const [warnings, setWarnings] = useState<string[]>([]);
    const [apiStatus, setApiStatus] = useState<Record<string, any>>({});
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(performanceMonitor.exportMetrics());
            setWarnings(performanceMonitor.checkForPerformanceIssues());
            setApiStatus(performanceMonitor.getApiStatus());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Helper function to get health status color
    const getHealthColor = (value: number, threshold: number, inverse = false) => {
        const isHealthy = inverse ? value < threshold : value >= threshold;
        return isHealthy ? 'text-green-600' : 'text-red-600';
    };

    // Helper function to format large numbers
    const formatNumber = (num: number) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    const exportMetrics = () => {
        const data = performanceMonitor.exportMetrics();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance-metrics-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {/* Performance warnings indicator */}
                {warnings.length > 0 && (
                    <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs animate-pulse">
                        ⚠️ {warnings.length} issue{warnings.length > 1 ? 's' : ''}
                    </div>
                )}

                {/* Main dashboard button */}
                <button
                    onClick={() => setIsVisible(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                    📊 Performance
                    {metrics.apiRequests.total > 0 && (
                        <span className="bg-blue-800 px-2 py-0.5 rounded text-xs">
                            {metrics.apiRequests.successRate}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">Performance Monitor</h2>
                        {warnings.length > 0 && (
                            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                ⚠️ {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
                            </div>
                        )}
                        <div className="text-sm text-gray-600">
                            Updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportMetrics}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                            📥 Export
                        </button>
                        <button
                            onClick={() => performanceMonitor.reset()}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                        >
                            🔄 Reset
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b bg-gray-50">
                    {[
                        { id: 'overview', label: '📊 Overview', count: warnings.length },
                        { id: 'apis', label: '🌐 APIs', count: Object.keys(metrics.apiPerformance).length },
                        { id: 'components', label: '🎨 Components', count: metrics.componentRenders.total },
                        { id: 'memory', label: '💾 Memory', count: metrics.activeInstances },
                        { id: 'details', label: '🔍 Details', count: 0 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600 bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                    {formatNumber(tab.count)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Performance Warnings */}
                            {warnings.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="font-bold text-lg mb-3 text-red-800">⚠️ Performance Warnings</h3>
                                    <div className="space-y-2">
                                        {warnings.map((warning, index) => (
                                            <div key={index} className="text-red-700 text-sm bg-red-100 p-2 rounded">
                                                {warning}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Health Overview Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* API Health */}
                                <div className="bg-white border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">API Health</p>
                                            <p
                                                className={`text-2xl font-bold ${getHealthColor(
                                                    parseFloat(metrics.apiRequests.successRate),
                                                    95
                                                )}`}
                                            >
                                                {metrics.apiRequests.successRate}
                                            </p>
                                        </div>
                                        <div className="text-2xl">🌐</div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {metrics.apiRequests.total} total requests
                                    </p>
                                </div>

                                {/* Memory Health */}
                                <div className="bg-white border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Memory</p>
                                            <p
                                                className={`text-2xl font-bold ${getHealthColor(
                                                    metrics.activeInstances,
                                                    3,
                                                    true
                                                )}`}
                                            >
                                                {metrics.activeInstances}
                                            </p>
                                        </div>
                                        <div className="text-2xl">💾</div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">active instances</p>
                                </div>

                                {/* Render Efficiency */}
                                <div className="bg-white border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Renders</p>
                                            <p
                                                className={`text-2xl font-bold ${getHealthColor(
                                                    parseFloat(metrics.componentRenders.unnecessaryRate),
                                                    25,
                                                    true
                                                )}`}
                                            >
                                                {metrics.componentRenders.unnecessaryRate}
                                            </p>
                                        </div>
                                        <div className="text-2xl">🎨</div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">unnecessary rate</p>
                                </div>

                                {/* Vector Search */}
                                <div className="bg-white border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Cache Hit</p>
                                            <p
                                                className={`text-2xl font-bold ${getHealthColor(
                                                    metrics.vectorSearches.total > 0
                                                        ? (metrics.vectorSearches.fromCache /
                                                              metrics.vectorSearches.total) *
                                                              100
                                                        : 0,
                                                    50
                                                )}`}
                                            >
                                                {metrics.vectorSearches.total > 0
                                                    ? (
                                                          (metrics.vectorSearches.fromCache /
                                                              metrics.vectorSearches.total) *
                                                          100
                                                      ).toFixed(1)
                                                    : 0}
                                                %
                                            </p>
                                        </div>
                                        <div className="text-2xl">🔍</div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {metrics.vectorSearches.total} searches
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3">📈 Session Statistics</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">State Updates:</span>
                                        <div className="font-bold">
                                            {metrics.duplicateStateUpdates + metrics.stateDesyncs}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Renders:</span>
                                        <div className="font-bold">{metrics.componentRenders.total}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Avg API Latency:</span>
                                        <div className="font-bold">{metrics.apiRequests.avgLatency}ms</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Session Duration:</span>
                                        <div className="font-bold">
                                            {Math.round(
                                                (Date.now() - new Date(metrics.sessionStart).getTime()) / 1000 / 60
                                            )}
                                            m
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* APIs Tab */}
                    {activeTab === 'apis' && (
                        <div className="space-y-6">
                            {/* API Status Overview */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3">🌐 API Status Overview</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Total Requests:</span>
                                        <div className="text-2xl font-bold">{metrics.apiRequests.total}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Success Rate:</span>
                                        <div
                                            className={`text-2xl font-bold ${getHealthColor(
                                                parseFloat(metrics.apiRequests.successRate),
                                                95
                                            )}`}
                                        >
                                            {metrics.apiRequests.successRate}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Failed:</span>
                                        <div
                                            className={`text-2xl font-bold ${
                                                metrics.apiRequests.failed > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}
                                        >
                                            {metrics.apiRequests.failed}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Avg Latency:</span>
                                        <div className="text-2xl font-bold">{metrics.apiRequests.avgLatency}ms</div>
                                    </div>
                                </div>
                            </div>

                            {/* Per-Endpoint Performance */}
                            {Object.keys(metrics.apiPerformance).length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg mb-3">📊 API Performance by Endpoint</h3>
                                    <div className="space-y-3">
                                        {Object.entries(metrics.apiPerformance).map(([apiName, data]) => (
                                            <div key={apiName} className="bg-white p-4 rounded border">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold">{apiName}</h4>
                                                    <div
                                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                                            parseFloat(data.errorRate) > 5
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {data.errorRate} error rate
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Calls:</span>
                                                        <div className="font-bold">{data.calls}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Avg:</span>
                                                        <div className="font-bold">{data.avgLatency}ms</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">P50:</span>
                                                        <div className="font-bold">{data.p50}ms</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">P95:</span>
                                                        <div className="font-bold">{data.p95}ms</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Max:</span>
                                                        <div className="font-bold">{data.maxLatency}ms</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Real-time API Health */}
                            {Object.keys(apiStatus).length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg mb-3">💓 Real-time API Health</h3>
                                    <div className="space-y-2">
                                        {Object.entries(apiStatus).map(([apiName, status]) => (
                                            <div
                                                key={apiName}
                                                className="flex items-center justify-between bg-white p-3 rounded border"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-3 h-3 rounded-full ${
                                                            status.isHealthy ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                    ></div>
                                                    <span className="font-medium">{apiName}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {status.recentAvgLatency}ms avg • {status.recentErrorCount} errors
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Components Tab */}
                    {activeTab === 'components' && (
                        <div className="space-y-6">
                            {/* Render Performance */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3">🎨 Component Rendering Performance</h3>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Total Renders:</span>
                                        <div className="text-2xl font-bold">{metrics.componentRenders.total}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Necessary:</span>
                                        <div className="text-2xl font-bold text-green-600">
                                            {metrics.componentRenders.necessary}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Unnecessary:</span>
                                        <div
                                            className={`text-2xl font-bold ${
                                                metrics.componentRenders.unnecessary > 0
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                            }`}
                                        >
                                            {metrics.componentRenders.unnecessary}
                                        </div>
                                    </div>
                                </div>

                                {/* Render efficiency bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Render Efficiency</span>
                                        <span>{metrics.componentRenders.unnecessaryRate} unnecessary</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                parseFloat(metrics.componentRenders.unnecessaryRate) > 25
                                                    ? 'bg-red-500'
                                                    : 'bg-green-500'
                                            }`}
                                            style={{
                                                width: `${100 - parseFloat(metrics.componentRenders.unnecessaryRate)}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600">
                                    <p>
                                        <strong>💡 Optimization Tips:</strong>
                                    </p>
                                    <ul className="list-disc ml-4 space-y-1">
                                        <li>Use React.memo() for components that render frequently</li>
                                        <li>Optimize props passing to prevent unnecessary updates</li>
                                        <li>Consider useMemo() and useCallback() for expensive operations</li>
                                        {parseFloat(metrics.componentRenders.unnecessaryRate) > 25 && (
                                            <li className="text-red-600 font-medium">
                                                ⚠️ High unnecessary render rate detected!
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* State Management */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3">🔄 State Management</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Duplicate Updates:</span>
                                        <div
                                            className={`text-2xl font-bold ${
                                                metrics.duplicateStateUpdates > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}
                                        >
                                            {metrics.duplicateStateUpdates}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">State Desyncs:</span>
                                        <div
                                            className={`text-2xl font-bold ${
                                                metrics.stateDesyncs > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}
                                        >
                                            {metrics.stateDesyncs}
                                        </div>
                                    </div>
                                </div>

                                {(metrics.duplicateStateUpdates > 0 || metrics.stateDesyncs > 0) && (
                                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
                                        <strong>⚠️ State Issues Detected:</strong>
                                        <ul className="list-disc ml-4 mt-1">
                                            {metrics.duplicateStateUpdates > 0 && (
                                                <li>
                                                    Duplicate state updates may indicate inefficient state management
                                                </li>
                                            )}
                                            {metrics.stateDesyncs > 0 && (
                                                <li>State desynchronization detected - check for race conditions</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Memory Tab */}
                    {activeTab === 'memory' && (
                        <div className="space-y-6">
                            {/* Memory Management */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3">💾 Memory Management</h3>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Created Instances:</span>
                                        <div className="text-2xl font-bold">{metrics.speechInstancesCreated}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Destroyed Instances:</span>
                                        <div className="text-2xl font-bold">{metrics.speechInstancesDestroyed}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Active Instances:</span>
                                        <div
                                            className={`text-2xl font-bold ${
                                                metrics.activeInstances > 2 ? 'text-red-600' : 'text-green-600'
                                            }`}
                                        >
                                            {metrics.activeInstances}
                                        </div>
                                    </div>
                                </div>

                                {metrics.activeInstances > 2 && (
                                    <div className="p-3 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                                        <strong>🚨 Memory Leak Warning:</strong>
                                        <p>
                                            High number of active instances detected. Check for proper cleanup in speech
                                            recognition components.
                                        </p>
                                    </div>
                                )}

                                {/* Memory efficiency indicator */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Memory Efficiency</span>
                                        <span>
                                            {metrics.speechInstancesCreated > 0
                                                ? (
                                                      (metrics.speechInstancesDestroyed /
                                                          metrics.speechInstancesCreated) *
                                                      100
                                                  ).toFixed(1)
                                                : 100}
                                            % cleanup rate
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${
                                                metrics.activeInstances > 2 ? 'bg-red-500' : 'bg-green-500'
                                            }`}
                                            style={{
                                                width: `${
                                                    metrics.speechInstancesCreated > 0
                                                        ? (metrics.speechInstancesDestroyed /
                                                              metrics.speechInstancesCreated) *
                                                          100
                                                        : 100
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Vector Search Performance */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3">🔍 Vector Search Performance</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Total Searches:</span>
                                        <div className="text-2xl font-bold">{metrics.vectorSearches.total}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">From Cache:</span>
                                        <div className="text-2xl font-bold text-green-600">
                                            {metrics.vectorSearches.fromCache}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">From API:</span>
                                        <div className="text-2xl font-bold">{metrics.vectorSearches.fromApi}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Cache Hit Rate:</span>
                                        <div className="text-2xl font-bold text-green-600">
                                            {metrics.vectorSearches.total > 0
                                                ? (
                                                      (metrics.vectorSearches.fromCache /
                                                          metrics.vectorSearches.total) *
                                                      100
                                                  ).toFixed(1)
                                                : 0}
                                            %
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Avg Cache Time:</span>
                                        <div className="text-lg font-bold">{metrics.vectorSearches.avgCacheTime}ms</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Avg API Time:</span>
                                        <div className="text-lg font-bold">{metrics.vectorSearches.avgApiTime}ms</div>
                                    </div>
                                </div>

                                {/* Cache efficiency visualization */}
                                {metrics.vectorSearches.total > 0 && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Cache Efficiency</span>
                                            <span>
                                                {metrics.vectorSearches.avgCacheTime > 0 &&
                                                metrics.vectorSearches.avgApiTime > 0
                                                    ? `${(
                                                          (1 -
                                                              metrics.vectorSearches.avgCacheTime /
                                                                  metrics.vectorSearches.avgApiTime) *
                                                          100
                                                      ).toFixed(1)}% faster`
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{
                                                    width: `${
                                                        (metrics.vectorSearches.fromCache /
                                                            metrics.vectorSearches.total) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/* Session Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3">⏱️ Session Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Session Started:</span>
                                        <div className="text-sm font-mono">
                                            {new Date(metrics.sessionStart).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Last Updated:</span>
                                        <div className="text-sm font-mono">
                                            {new Date(metrics.lastUpdated).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Session Duration:</span>
                                        <div className="text-sm font-mono">
                                            {Math.floor(
                                                (Date.now() - new Date(metrics.sessionStart).getTime()) / 1000 / 60
                                            )}
                                            m{' '}
                                            {Math.floor(
                                                ((Date.now() - new Date(metrics.sessionStart).getTime()) / 1000) % 60
                                            )}
                                            s
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Update Frequency:</span>
                                        <div className="text-sm font-mono">1000ms</div>
                                    </div>
                                </div>
                            </div>

                            {/* Raw Metrics */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-3">📋 Raw Metrics</h3>
                                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
                                    <pre>{JSON.stringify(metrics, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
