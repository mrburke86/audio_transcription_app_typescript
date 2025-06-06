// src/components/KnowledgeManagementTab.tsx
'use client';

import React, { useState, useCallback } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from '@/components/ui';
import { useKnowledge, useUI } from '@/stores/hooks/useSelectors';
import { CallContext } from '@/types/callContext';
import { Upload, FileText, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';
import { KnowledgeIndexingButton } from './KnowledgeIndexingButton';

interface KnowledgeManagementTabProps {
    callContext: CallContext | null;
    onKnowledgeSearchToggle: (enabled: boolean) => void;
}

const FILE_CATEGORIES = {
    professional: [
        { value: 'resume', label: '📄 Resume/CV' },
        { value: 'portfolio', label: '💼 Portfolio' },
        { value: 'company-research', label: '🏢 Company Research' },
        { value: 'industry-analysis', label: '📊 Industry Analysis' },
        { value: 'case-studies', label: '📚 Case Studies' },
        { value: 'methodologies', label: '⚙️ Methodologies' },
        { value: 'certifications', label: '🏆 Certifications' },
    ],
    personal: [
        { value: 'notes', label: '📝 Personal Notes' },
        { value: 'journal', label: '📓 Journal Entries' },
        { value: 'goals', label: '🎯 Goals & Aspirations' },
        { value: 'family-info', label: '👨‍👩‍👧‍👦 Family Information' },
        { value: 'interests', label: '🎨 Interests & Hobbies' },
    ],
    service: [
        { value: 'documentation', label: '📋 Documentation' },
        { value: 'troubleshooting', label: '🔧 Troubleshooting Guides' },
        { value: 'procedures', label: '📐 Procedures' },
        { value: 'reference', label: '📖 Reference Materials' },
    ],
    emergency: [
        { value: 'emergency-contacts', label: '🚨 Emergency Contacts' },
        { value: 'medical-info', label: '🏥 Medical Information' },
        { value: 'emergency-plans', label: '📋 Emergency Plans' },
    ],
};

const KNOWLEDGE_TIPS = {
    'job-interview': {
        title: '💼 Interview Success Tips',
        tips: [
            'Upload your resume and job description for contextual responses',
            'Include company research to demonstrate preparation',
            'Add STAR method examples from your experience',
            'Include industry-specific certifications and achievements',
        ],
    },
    'sales-call': {
        title: '💰 Sales Excellence Tips',
        tips: [
            'Upload customer research and company profiles',
            'Include your proven sales methodologies (MEDDPICC, SPIN, etc.)',
            'Add case studies of successful deals',
            'Include competitive analysis and objection handling guides',
        ],
    },
    'customer-support': {
        title: '🎧 Support Excellence Tips',
        tips: [
            'Upload product documentation and troubleshooting guides',
            'Include common issue resolution procedures',
            'Add escalation protocols and contact information',
            'Include customer communication templates',
        ],
    },
    default: {
        title: '📚 Knowledge Base Tips',
        tips: [
            'Upload relevant documents to improve AI responses',
            'Organize files with appropriate categories',
            'Keep information current and accurate',
            'Use clear, descriptive filenames',
        ],
    },
};

export const KnowledgeManagementTab: React.FC<KnowledgeManagementTabProps> = ({
    callContext,
    onKnowledgeSearchToggle,
}) => {
    const { indexedDocumentsCount, isLoading, error, lastIndexedAt, knowledgeBaseName, indexingProgress } =
        useKnowledge();

    const { addNotification } = useUI();

    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    // Get status for the knowledge base
    const getKnowledgeStatus = () => {
        if (error) return { status: 'error', icon: AlertCircle, color: 'text-red-500' };
        if (isLoading || indexingProgress.isIndexing)
            return { status: 'loading', icon: Clock, color: 'text-yellow-500' };
        if (indexedDocumentsCount === 0) return { status: 'empty', icon: Database, color: 'text-gray-500' };
        return { status: 'ready', icon: CheckCircle, color: 'text-green-500' };
    };

    const status = getKnowledgeStatus();
    const StatusIcon = status.icon;

    // Get available categories based on call context
    const getAvailableCategories = () => {
        if (!callContext) return FILE_CATEGORIES.professional;
        return FILE_CATEGORIES[callContext.call_context] || FILE_CATEGORIES.professional;
    };

    // Handle file selection
    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            setSelectedFiles(files);

            if (files && files.length > 0) {
                // Auto-select first appropriate category if none selected
                if (!selectedCategory) {
                    const categories = getAvailableCategories();
                    setSelectedCategory(categories[0]?.value || '');
                }
            }
        },
        [selectedCategory]
    );

    // Handle file upload
    const handleUpload = useCallback(async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            addNotification?.({
                type: 'warning',
                message: 'Please select files to upload',
                duration: 3000,
            });
            return;
        }

        if (!selectedCategory) {
            addNotification?.({
                type: 'warning',
                message: 'Please select a category for your files',
                duration: 3000,
            });
            return;
        }

        setIsUploading(true);

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category', selectedCategory);

                const response = await fetch('/api/knowledge/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Upload failed for ${file.name}`);
                }
            }

            // Clear selections after successful upload
            setSelectedFiles(null);
            setSelectedCategory('');

            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            addNotification?.({
                type: 'success',
                message: `Successfully uploaded ${selectedFiles.length} file(s)`,
                duration: 5000,
            });

            // Auto-trigger indexing after upload
            // This would be handled by the KnowledgeIndexingButton component
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed';
            addNotification?.({
                type: 'error',
                message: `Upload error: ${message}`,
                duration: 8000,
            });
        } finally {
            setIsUploading(false);
        }
    }, [selectedFiles, selectedCategory, addNotification]);

    // Get tips based on call type
    const getTipsForCallType = () => {
        if (!callContext) return KNOWLEDGE_TIPS.default;
        return KNOWLEDGE_TIPS[callContext.call_type as keyof typeof KNOWLEDGE_TIPS] || KNOWLEDGE_TIPS.default;
    };

    const tips = getTipsForCallType();

    return (
        <div className="space-y-6">
            {/* Knowledge Search Toggle */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Knowledge Search</CardTitle>
                        <Switch
                            checked={callContext?.knowledge_search_enabled ?? true}
                            onCheckedChange={onKnowledgeSearchToggle}
                            aria-label="Enable knowledge search during calls"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        When enabled, the AI will search your uploaded documents to provide more contextual and
                        personalized responses during your call.
                    </p>
                </CardContent>
            </Card>

            {/* Knowledge Base Status */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        Knowledge Base Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Documents Indexed:</span>
                        <span className="text-sm">{indexedDocumentsCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Collection:</span>
                        <span className="text-sm">{knowledgeBaseName}</span>
                    </div>

                    {lastIndexedAt && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Last Updated:</span>
                            <span className="text-sm">{lastIndexedAt.toLocaleString()}</span>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {indexingProgress.isIndexing && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-700">{indexingProgress.progress}</p>
                            {indexingProgress.filesProcessed > 0 && (
                                <p className="text-xs text-blue-600 mt-1">
                                    Processed: {indexingProgress.filesProcessed}/{indexingProgress.totalFiles} files
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Documents
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="file-upload" className="text-sm font-medium">
                            Select Files
                        </Label>
                        <Input
                            id="file-upload"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.md"
                            onChange={handleFileChange}
                            className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Supported formats: PDF, DOC, DOCX, TXT, MD (max 10MB each)
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="category-select" className="text-sm font-medium">
                            Category
                        </Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a category..." />
                            </SelectTrigger>
                            <SelectContent>
                                {getAvailableCategories().map(category => (
                                    <SelectItem key={category.value} value={category.value}>
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedFiles && selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Selected Files:</Label>
                            <div className="space-y-1">
                                {Array.from(selectedFiles).map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4" />
                                        <span>{file.name}</span>
                                        <span className="text-muted-foreground">
                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFiles || selectedFiles.length === 0 || !selectedCategory || isUploading}
                        className="w-full"
                    >
                        {isUploading ? 'Uploading...' : 'Upload Files'}
                    </Button>
                </CardContent>
            </Card>

            {/* Manual Indexing */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Manual Indexing</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Manually trigger the indexing process for all uploaded files. This usually happens automatically
                        after uploads.
                    </p>
                    <KnowledgeIndexingButton variant="secondary" className="w-full" showProgress={true} />
                </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>{tips.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {tips.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};
