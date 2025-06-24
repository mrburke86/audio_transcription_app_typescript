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
    const getAvailableCategories = useCallback(() => {
        if (!callContext) return FILE_CATEGORIES.professional;
        return (
            FILE_CATEGORIES[callContext.call_context as keyof typeof FILE_CATEGORIES] || FILE_CATEGORIES.professional
        );
    }, [callContext]);

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
        [getAvailableCategories, selectedCategory]
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
            const uploadPromises = Array.from(selectedFiles).map(
                async (file): Promise<{ success: boolean; filename: string; error?: string }> => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('category', selectedCategory);

                        const response = await fetch('/api/knowledge/upload', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!response.ok) {
                            const errorData: { error?: string } = await response.json().catch(() => ({}));
                            throw new Error(errorData.error || `Upload failed for ${file.name}`);
                        }

                        return { success: true, filename: file.name };
                    } catch (error) {
                        const message = error instanceof Error ? error.message : 'Unknown error';
                        return { success: false, filename: file.name, error: message };
                    }
                }
            );

            const results = await Promise.all(uploadPromises);
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            // Clear selections after upload
            setSelectedFiles(null);
            setSelectedCategory('');

            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            if (failed.length === 0) {
                addNotification?.({
                    type: 'success',
                    message: `Successfully uploaded ${successful.length} file(s)`,
                    duration: 5000,
                });
            } else {
                addNotification?.({
                    type: 'warning',
                    message: `Uploaded ${successful.length} files, ${failed.length} failed`,
                    duration: 8000,
                });
            }
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
        <div className="h-full overflow-y-auto">
            <div className="space-y-4 pb-4">
                {/* Knowledge Search Toggle */}
                <Card className="mx-0">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Knowledge Search</CardTitle>
                            <Switch
                                checked={callContext?.knowledge_search_enabled ?? true}
                                onCheckedChange={onKnowledgeSearchToggle}
                                aria-label="Enable knowledge search during calls"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <p className="text-xs text-muted-foreground">
                            When enabled, the AI will search your uploaded documents to provide more contextual and
                            personalized responses during your call.
                        </p>
                    </CardContent>
                </Card>

                {/* Knowledge Base Status */}
                <Card className="mx-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                            Knowledge Base Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Documents Indexed:</span>
                            <span className="text-xs font-semibold">{indexedDocumentsCount}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Collection:</span>
                            <span
                                className="text-xs text-muted-foreground truncate max-w-[200px]"
                                title={knowledgeBaseName}
                            >
                                {knowledgeBaseName}
                            </span>
                        </div>

                        {lastIndexedAt && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">Last Updated:</span>
                                <span className="text-xs text-muted-foreground">
                                    {lastIndexedAt.toLocaleDateString()} {lastIndexedAt.toLocaleTimeString()}
                                </span>
                            </div>
                        )}

                        {error && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-xs text-red-700">{error}</p>
                            </div>
                        )}

                        {indexingProgress.isIndexing && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-xs text-blue-700">{indexingProgress.progress}</p>
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
                <Card className="mx-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Upload className="h-4 w-4" />
                            Upload Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        <div>
                            <Label htmlFor="file-upload" className="text-xs font-medium">
                                Select Files
                            </Label>
                            <Input
                                id="file-upload"
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.txt,.md"
                                onChange={handleFileChange}
                                className="mt-1 text-xs"
                                // size="sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Supported: PDF, DOC, DOCX, TXT, MD (max 10MB each)
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="category-select" className="text-xs font-medium">
                                Category
                            </Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="mt-1 h-8 text-xs">
                                    <SelectValue placeholder="Select a category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {getAvailableCategories().map(category => (
                                        <SelectItem key={category.value} value={category.value} className="text-xs">
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Selected Files:</Label>
                                <div className="max-h-20 overflow-y-auto space-y-1">
                                    {Array.from(selectedFiles).map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <FileText className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate flex-1">{file.name}</span>
                                            <span className="text-muted-foreground flex-shrink-0">
                                                ({(file.size / 1024 / 1024).toFixed(1)}MB)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFiles || selectedFiles.length === 0 || !selectedCategory || isUploading}
                            className="w-full h-8 text-xs"
                            size="sm"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Files'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Manual Indexing */}
                <Card className="mx-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Manual Indexing</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <p className="text-xs text-muted-foreground mb-3">
                            Manually trigger the indexing process for all uploaded files. This usually happens
                            automatically after uploads.
                        </p>
                        <div className="space-y-2">
                            <KnowledgeIndexingButton
                                variant="secondary"
                                className="w-full h-8 text-xs"
                                showProgress={false}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="mx-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{tips.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <ul className="space-y-1">
                            {tips.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-xs">
                                    <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                                    <span className="leading-relaxed">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
