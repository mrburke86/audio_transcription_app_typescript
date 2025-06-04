// // src/components/interview-modal/tabs/KnowledgeBaseTab.tsx
// 'use client';
// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { useKnowledge } from '@/contexts/KnowledgeProvider';
// import { AlertCircle, CheckCircle, Database, FileText, Clock } from 'lucide-react';
// import { KnowledgeIndexingButton } from '@/components/KnowledgeIndexingButton';
// import { logger } from '@/modules';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';

// export function KnowledgeBaseTab() {
//     logger.info('🔍 KnowledgeBaseTab component is rendering'); // ADD THIS LINE
//     const { indexedDocumentsCount, knowledgeBaseName, lastIndexedAt, error, triggerIndexing } = useKnowledge();
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [fileTag, setFileTag] = useState('Resume');

//     const handleFileUpload = async () => {
//         if (!selectedFile) return;
//         // Prepare file upload
//         const formData = new FormData();
//         formData.append('file', selectedFile);
//         formData.append('tag', fileTag);
//         try {
//             // Send file to backend for storage/indexing
//             await fetch('/api/knowledge/upload', { method: 'POST', body: formData });
//             await triggerIndexing(); // re-index knowledge base after adding file
//             setSelectedFile(null);
//             console.info('✅ Knowledge file uploaded and indexing triggered.');
//         } catch (err) {
//             console.error('❌ File upload failed:', err);
//         }
//     };

//     // Knowledge file categories for user visibility
//     const coreKnowledgeFiles = [
//         'My Career Summary & Achievements',
//         'MEDDPICC Success Stories',
//         'Sales Methodology',
//         'Quality Management Principles',
//         'C-Level Engagement Strategies',
//     ];

//     const variableKnowledgeFiles = [
//         'Company-Specific Role Scenarios',
//         'Target Company Profile',
//         'Job Description Analysis',
//         'Industry Trends & Insights',
//     ];

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

//     return (
//         <div className="space-y-4">
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Database className="h-5 w-5" />
//                         Knowledge Base Management
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                     {/* Status Overview */}
//                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                         <div className="flex items-center gap-3">
//                             {statusInfo.icon}
//                             <div>
//                                 <div className="flex items-center gap-2">
//                                     <span className="font-medium">Knowledge Base Status</span>
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

//                     {/* Error Display */}
//                     {error && (
//                         <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                             <div className="flex items-center gap-2 text-red-700">
//                                 <AlertCircle className="h-4 w-4" />
//                                 <span className="font-medium">Error Details</span>
//                             </div>
//                             <p className="text-sm text-red-600 mt-1">{error}</p>
//                         </div>
//                     )}

//                     {/* File Upload Section (new) */}
//                     <div>
//                         <h4 className="font-medium">Upload Knowledge File</h4>
//                         <p className="text-sm text-gray-600 mb-2">
//                             Select a file to add to your knowledge base and tag its category.
//                         </p>
//                         <div className="flex items-center gap-2">
//                             <Input
//                                 type="file"
//                                 onChange={e => setSelectedFile(e.target.files?.[0] || null)}
//                                 className="flex-1"
//                             />
//                             <Select value={fileTag} onValueChange={setFileTag}>
//                                 <SelectTrigger className="w-40">
//                                     <SelectValue placeholder="Tag" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="Resume">Resume</SelectItem>
//                                     <SelectItem value="Company Brief">Company Brief</SelectItem>
//                                     <SelectItem value="Strategy Memo">Strategy Memo</SelectItem>
//                                     <SelectItem value="Other">Other</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                             <Button onClick={handleFileUpload} disabled={!selectedFile}>
//                                 Add
//                             </Button>
//                         </div>
//                         <p className="text-xs text-gray-500 mt-1">
//                             *Tag the file to categorize its content (e.g. resume, company info, strategy).*
//                         </p>
//                     </div>

//                     {/* Indexing Action */}
//                     <div className="space-y-4">
//                         <div>
//                             <h4 className="font-medium mb-2">Index Knowledge Base</h4>
//                             <p className="text-sm text-gray-600 mb-4">
//                                 Process your knowledge files to enable AI-powered responses based on your career
//                                 history, company information, and interview preparation materials.
//                             </p>
//                             <KnowledgeIndexingButton
//                                 variant="primary"
//                                 size="md"
//                                 showProgress={true}
//                                 className="w-full"
//                             />
//                         </div>
//                     </div>

//                     {/* Knowledge Files Overview */}
//                     <div className="grid md:grid-cols-2 gap-4">
//                         <div className="space-y-3">
//                             <div className="flex items-center gap-2">
//                                 <FileText className="h-4 w-4 text-blue-500" />
//                                 <h4 className="font-medium">Core Knowledge Files</h4>
//                             </div>
//                             <div className="space-y-1">
//                                 {coreKnowledgeFiles.map((file, index) => (
//                                     <div key={index} className="text-sm text-gray-600 pl-6">
//                                         • {file}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="space-y-3">
//                             <div className="flex items-center gap-2">
//                                 <FileText className="h-4 w-4 text-orange-500" />
//                                 <h4 className="font-medium">Variable Knowledge Files</h4>
//                             </div>
//                             <div className="space-y-1">
//                                 {variableKnowledgeFiles.map((file, index) => (
//                                     <div key={index} className="text-sm text-gray-600 pl-6">
//                                         • {file}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Information Box */}
//                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                         <h4 className="font-medium text-blue-900 mb-2">💡 How It Works</h4>
//                         <ul className="text-sm text-blue-800 space-y-1">
//                             <li>
//                                 • <strong>Core files</strong> contain your permanent career history and methodologies
//                             </li>
//                             <li>
//                                 • <strong>Variable files</strong> are updated for each specific interview opportunity
//                             </li>
//                             <li>• The AI uses this knowledge to provide contextual, personalized responses</li>
//                             <li>• Re-index whenever you update your knowledge files</li>
//                         </ul>
//                     </div>

//                     {/* Collection Info */}
//                     <div className="text-xs text-gray-500 border-t pt-3">
//                         <span className="font-mono">{knowledgeBaseName}</span>
//                         {lastIndexedAt && <span> – Last indexed: {lastIndexedAt.toLocaleString()}</span>}
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
