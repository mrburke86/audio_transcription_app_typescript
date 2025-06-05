// // src/components/call-modal/tabs/KnowledgeBaseTab.tsx
// 'use client';
// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Switch } from '@/components/ui/switch';
// import { useCallModal } from '../CallModalContext';
// import { AlertCircle, CheckCircle, Database, FileText, Clock, Shield, Brain } from 'lucide-react';
// import { KnowledgeIndexingButton } from '@/components/KnowledgeIndexingButton';
// import { logger } from '@/modules';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';
// import { FormField } from '@/components/call-modal/components/FormField';
// import { useKnowledge as useKnowledgeStore } from '@/stores/hooks/useSelectors';

// export function KnowledgeBaseTab() {
//     logger.info('🔍 KnowledgeBaseTab component is rendering');
//     const { indexedDocumentsCount, knowledgeBaseName, lastIndexedAt, error, triggerIndexing } = useKnowledgeStore();
//     const { context, updateField } = useCallModal();
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [fileTag, setFileTag] = useState('General');

//     const handleFileUpload = async () => {
//         if (!selectedFile) return;
//         const formData = new FormData();
//         formData.append('file', selectedFile);
//         formData.append('tag', fileTag);
//         try {
//             await fetch('/api/knowledge/upload', { method: 'POST', body: formData });
//             await triggerIndexing();
//             setSelectedFile(null);
//             console.info('✅ Knowledge file uploaded and indexing triggered.');
//         } catch (err) {
//             console.error('❌ File upload failed:', err);
//         }
//     };

//     const getFileTagOptions = () => {
//         const baseTags = ['General', 'Personal Notes', 'Reference Material'];

//         if (context.call_context === 'professional') {
//             return [...baseTags, 'Resume/CV', 'Company Info', 'Industry Research', 'Product Info', 'Sales Materials'];
//         } else if (context.call_context === 'personal') {
//             return [...baseTags, 'Relationship History', 'Family Info', 'Personal Goals', 'Conversation Notes'];
//         } else {
//             return [...baseTags, 'Service Protocols', 'Technical Documentation', 'Support Scripts'];
//         }
//     };

//     const getKnowledgeFilesByContext = () => {
//         const professionalFiles = [
//             'Career Summary & Achievements',
//             'Company Profile & Research',
//             'Industry Trends & Insights',
//             'Sales Methodology & Scripts',
//             'Product Knowledge Base',
//             'Competitive Intelligence',
//         ];

//         const personalFiles = [
//             'Relationship History & Context',
//             'Family Background & Dynamics',
//             'Personal Goals & Values',
//             'Previous Conversation Notes',
//             'Shared Experiences & Memories',
//         ];

//         const serviceFiles = [
//             'Service Protocols & Procedures',
//             'Technical Documentation',
//             'Support Scripts & Templates',
//             'Escalation Procedures',
//             'Compliance Guidelines',
//         ];

//         switch (context.call_context) {
//             case 'professional':
//                 return { core: professionalFiles, variable: [] };
//             case 'personal':
//                 return { core: personalFiles, variable: [] };
//             case 'service':
//                 return { core: serviceFiles, variable: [] };
//             default:
//                 return { core: professionalFiles, variable: personalFiles };
//         }
//     };

//     const getStatusInfo = () => {
//         if (error) {
//             return {
//                 icon: <AlertCircle className="h-5 w-5 text-red-500" />,
//                 status: 'Error',
//                 message: 'Knowledge base initialization failed',
//                 badgeVariant: 'destructive' as const,
//             };
//         }

//         if (indexedDocumentsCount === 0) {
//             return {
//                 icon: <Database className="h-5 w-5 text-yellow-500" />,
//                 status: 'Empty',
//                 message: 'No knowledge indexed yet',
//                 badgeVariant: 'secondary' as const,
//             };
//         }

//         return {
//             icon: <CheckCircle className="h-5 w-5 text-green-500" />,
//             status: 'Ready',
//             message: `${indexedDocumentsCount} items indexed`,
//             badgeVariant: 'default' as const,
//         };
//     };

//     const statusInfo = getStatusInfo();
//     const knowledgeFiles = getKnowledgeFilesByContext();

//     return (
//         <div className="space-y-4">
//             {/* Knowledge Integration Settings */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Brain className="h-5 w-5" />
//                         Knowledge Integration Settings
//                     </CardTitle>
//                     <p className="text-sm text-gray-600">
//                         Control how your knowledge base is used for this {context.call_type?.replace('-', ' ')}
//                     </p>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                         <div>
//                             <label className="text-sm font-medium">Enable Knowledge Search</label>
//                             <p className="text-xs text-gray-500">
//                                 Allow AI to search your uploaded documents during the call
//                             </p>
//                         </div>
//                         <Switch
//                             checked={context.knowledge_search_enabled}
//                             onCheckedChange={checked => updateField('knowledge_search_enabled', checked)}
//                         />
//                     </div>

//                     {context.knowledge_search_enabled && (
//                         <FormField label="Knowledge Search Scope">
//                             <Select
//                                 value={context.knowledge_search_scope || 'all'}
//                                 onValueChange={value => updateField('knowledge_search_scope', value as any)}
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">🌐 All Knowledge</SelectItem>
//                                     <SelectItem value="professional-only">💼 Professional Only</SelectItem>
//                                     <SelectItem value="personal-only">👤 Personal Only</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </FormField>
//                     )}

//                     {/* Privacy notice for sensitive calls */}
//                     {(context.sensitivity_level === 'highly-sensitive' || context.call_context === 'personal') && (
//                         <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                             <div className="flex items-center gap-2 mb-1">
//                                 <Shield className="h-4 w-4 text-yellow-600" />
//                                 <span className="text-sm font-medium text-yellow-800">Privacy Notice</span>
//                             </div>
//                             <p className="text-xs text-yellow-700">
//                                 Consider limiting knowledge access for sensitive conversations. Personal information
//                                 will be handled with appropriate privacy measures.
//                             </p>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>

//             {/* Knowledge Base Status */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Database className="h-5 w-5" />
//                         Knowledge Base Status
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                         <div className="flex items-center gap-3">
//                             {statusInfo.icon}
//                             <div>
//                                 <div className="flex items-center gap-2">
//                                     <span className="font-medium">Knowledge Base</span>
//                                     <Badge variant={statusInfo.badgeVariant}>{statusInfo.status}</Badge>
//                                 </div>
//                                 <p className="text-sm text-gray-600 mt-1">{statusInfo.message}</p>
//                                 {lastIndexedAt && (
//                                     <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
//                                         <Clock className="h-3 w-3" />
//                                         Last indexed: {lastIndexedAt.toLocaleString()}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {error && (
//                         <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                             <div className="flex items-center gap-2 text-red-700">
//                                 <AlertCircle className="h-4 w-4" />
//                                 <span className="font-medium">Error Details</span>
//                             </div>
//                             <p className="text-sm text-red-600 mt-1">{error}</p>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>

//             {/* File Upload */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <FileText className="h-5 w-5" />
//                         Upload Knowledge Files
//                     </CardTitle>
//                     <p className="text-sm text-gray-600">
//                         Add relevant documents for your {context.call_type?.replace('-', ' ')}
//                     </p>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="flex items-center gap-2">
//                         <Input
//                             type="file"
//                             onChange={e => setSelectedFile(e.target.files?.[0] || null)}
//                             className="flex-1"
//                             accept=".pdf,.doc,.docx,.txt,.md"
//                         />
//                         <Select value={fileTag} onValueChange={setFileTag}>
//                             <SelectTrigger className="w-48">
//                                 <SelectValue placeholder="Tag" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {getFileTagOptions().map(tag => (
//                                     <SelectItem key={tag} value={tag}>
//                                         {tag}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                         <Button onClick={handleFileUpload} disabled={!selectedFile}>
//                             Upload
//                         </Button>
//                     </div>

//                     <div className="space-y-4">
//                         <KnowledgeIndexingButton variant="primary" size="md" showProgress={true} className="w-full" />
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Context-Specific Knowledge Overview */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <FileText className="h-5 w-5" />
//                         Recommended Knowledge for {context.call_context} Calls
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="space-y-4">
//                         {knowledgeFiles.core.length > 0 && (
//                             <div>
//                                 <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
//                                     <FileText className="h-4 w-4 text-blue-500" />
//                                     Core Knowledge Files
//                                 </h4>
//                                 <div className="space-y-1">
//                                     {knowledgeFiles.core.map((file, index) => (
//                                         <div key={index} className="text-sm text-gray-600 pl-6">
//                                             • {file}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {knowledgeFiles.variable.length > 0 && (
//                             <div>
//                                 <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
//                                     <FileText className="h-4 w-4 text-orange-500" />
//                                     Additional Context Files
//                                 </h4>
//                                 <div className="space-y-1">
//                                     {knowledgeFiles.variable.map((file, index) => (
//                                         <div key={index} className="text-sm text-gray-600 pl-6">
//                                             • {file}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Usage Guidelines */}
//             <Card className="bg-blue-50 border-blue-200">
//                 <CardHeader>
//                     <CardTitle className="text-blue-900">💡 Knowledge Base Tips</CardTitle>
//                 </CardHeader>
//                 <CardContent className="text-sm text-blue-800 space-y-2">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <p>
//                                 <strong>Professional calls:</strong> Upload company research, role descriptions, and
//                                 your background materials
//                             </p>
//                             <p>
//                                 <strong>Personal calls:</strong> Consider relationship history, previous conversations,
//                                 and context notes
//                             </p>
//                         </div>
//                         <div className="space-y-2">
//                             <p>
//                                 <strong>Privacy tip:</strong> Use appropriate search scope for sensitive conversations
//                             </p>
//                             <p>
//                                 <strong>Performance:</strong> More relevant documents = better AI responses
//                             </p>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Collection Info */}
//             <div className="text-xs text-gray-500 border-t pt-3">
//                 <span className="font-mono">{knowledgeBaseName}</span>
//                 {lastIndexedAt && <span> – Last indexed: {lastIndexedAt.toLocaleString()}</span>}
//             </div>
//         </div>
//     );
// }
