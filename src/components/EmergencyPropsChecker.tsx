// src/components/EmergencyPropsChecker.tsx - ADD THIS FOR DEBUGGING
'use client';

import React from 'react';

interface EmergencyPropsCheckerProps {
    componentName: string;
    props: any;
    children?: React.ReactNode;
}

export const EmergencyPropsChecker: React.FC<EmergencyPropsCheckerProps> = ({ componentName, props, children }) => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
        return <>{children}</>;
    }

    // Check for undefined/null critical props
    const criticalProps = ['initialInterviewContext', 'targetRole', 'targetCompany'];
    const issues: string[] = [];

    criticalProps.forEach(propName => {
        if (propName === 'initialInterviewContext') {
            if (!props[propName]) {
                issues.push(`${propName} is ${typeof props[propName]}`);
            } else if (!props[propName].targetRole) {
                issues.push(`${propName}.targetRole is ${typeof props[propName].targetRole}`);
            } else if (!props[propName].targetCompany) {
                issues.push(`${propName}.targetCompany is ${typeof props[propName].targetCompany}`);
            }
        } else if (props[propName] === undefined || props[propName] === null) {
            issues.push(`${propName} is ${typeof props[propName]}`);
        }
    });

    // Log props status
    React.useEffect(() => {
        console.group(`🔍 PROPS CHECK: ${componentName}`);
        console.log('📦 All props:', props);

        if (issues.length > 0) {
            console.error('🚨 PROP ISSUES:', issues);
            console.log('🎯 Recommended fix: Check ChatProtectionWrapper');
        } else {
            console.log('✅ Props look good');
        }

        console.groupEnd();
    }, [componentName, props, issues]);

    // Show error overlay if critical issues
    if (issues.length > 0) {
        return (
            <div className="min-h-screen bg-yellow-100 p-8">
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border-2 border-yellow-500">
                    <h1 className="text-2xl font-bold text-yellow-600 mb-4">🔍 Props Debug: {componentName}</h1>
                    <div className="mb-4">
                        <h2 className="font-bold text-red-600">Issues Found:</h2>
                        <ul className="list-disc list-inside text-red-600">
                            {issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                            ))}
                        </ul>
                    </div>

                    <details className="mb-4">
                        <summary className="cursor-pointer font-bold">All Props Debug</summary>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-2">
                            {JSON.stringify(props, null, 2)}
                        </pre>
                    </details>

                    <button
                        onClick={() => (window.location.href = '/')}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Go Home
                    </button>
                </div>

                {children && (
                    <div className="mt-4 opacity-50">
                        <h3 className="font-bold">Component Output (dimmed):</h3>
                        {children}
                    </div>
                )}
            </div>
        );
    }

    return <>{children}</>;
};
