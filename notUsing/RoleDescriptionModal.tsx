// // src/components/chat/RoleDescriptionModal.tsx

// import React, { useEffect, useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
// import { Button, Textarea } from '@/components/ui';
// import { logger } from '@/modules/Logger';

// interface RoleDescriptionModalProps {
//     onSubmit: (roleDescription: string) => void;
// }

// const RoleDescriptionModal: React.FC<RoleDescriptionModalProps> = ({ onSubmit }) => {
//     const [inputValue, setInputValue] = useState('');
//     const [error, setError] = useState('');

//     useEffect(() => {
//         try {
//             logger.info('🎭 RoleDescriptionModal opened');
//         } catch (error) {
//             logger.error(`❌ Error during RoleDescriptionModal mount: ${error instanceof Error ? error.message : 'Unknown error'}`);
//         }

//         return () => {
//             logger.info('🧹 RoleDescriptionModal closed');
//         };
//     }, []);

//     const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//         try {
//             setInputValue(e.target.value);
//             if (error) setError(''); // Clear error when user starts typing
//         } catch (error) {
//             logger.error(`❌ Error handling input change: ${error instanceof Error ? error.message : 'Unknown error'}`);
//         }
//     };

//     const validateInput = (value: string): boolean => {
//         try {
//             const trimmed = value.trim();

//             if (trimmed === '') {
//                 setError('Role description cannot be empty');
//                 logger.warning('⚠️ User attempted to submit empty role description');
//                 return false;
//             }

//             if (trimmed.length < 10) {
//                 setError('Role description must be at least 10 characters long');
//                 logger.warning("⚠️ User attempted to submit role description that's too short");
//                 return false;
//             }

//             if (trimmed.length > 1000) {
//                 setError('Role description must be less than 1000 characters');
//                 logger.warning("⚠️ User attempted to submit role description that's too long");
//                 return false;
//             }

//             return true;
//         } catch (error) {
//             logger.error(`❌ Error validating input: ${error instanceof Error ? error.message : 'Unknown error'}`);
//             setError('Validation error occurred');
//             return false;
//         }
//     };

//     const handleSubmit = () => {
//         try {
//             const trimmedInput = inputValue.trim();

//             if (!validateInput(trimmedInput)) {
//                 return;
//             }

//             logger.info(`✅ Role description submitted: "${trimmedInput.substring(0, 50)}${trimmedInput.length > 50 ? '...' : ''}"`);
//             logger.debug(`📝 Full role description: "${trimmedInput}"`);

//             onSubmit(trimmedInput);
//         } catch (error) {
//             logger.error(`❌ Error submitting role description: ${error instanceof Error ? error.message : 'Unknown error'}`);
//             setError('Failed to submit role description');
//         }
//     };

//     const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//         try {
//             if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
//                 e.preventDefault();
//                 handleSubmit();
//                 logger.debug('⌨️ Role description submitted via Ctrl+Enter');
//             }
//         } catch (error) {
//             logger.error(`❌ Error handling key press: ${error instanceof Error ? error.message : 'Unknown error'}`);
//         }
//     };

//     try {
//         return (
//             <Dialog open={true}>
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>Set Role Description</DialogTitle>
//                         <DialogDescription>
//                             Please enter the role description for the assistant. This helps define how the AI should behave and respond.
//                         </DialogDescription>
//                     </DialogHeader>
//                     <div className="space-y-4">
//                         <Textarea
//                             value={inputValue}
//                             onChange={handleInputChange}
//                             onKeyDown={handleKeyPress}
//                             placeholder="Enter role description (e.g., 'You are a helpful programming assistant who provides clear, concise answers...')"
//                             rows={4}
//                             className={error ? 'border-red-500' : ''}
//                         />
//                         {error && <p className="text-red-500 text-sm">{error}</p>}
//                         <p className="text-gray-500 text-xs">{inputValue.length}/1000 characters | Tip: Press Ctrl+Enter to submit</p>
//                     </div>
//                     <DialogFooter>
//                         <Button onClick={handleSubmit} disabled={inputValue.trim().length === 0}>
//                             Submit
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         );
//     } catch (error) {
//         logger.error(`❌ Critical error rendering RoleDescriptionModal: ${error instanceof Error ? error.message : 'Unknown error'}`);
//         return (
//             <Dialog open={true}>
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>Error</DialogTitle>
//                         <DialogDescription>Unable to display role description modal</DialogDescription>
//                     </DialogHeader>
//                     <DialogFooter>
//                         <Button onClick={() => onSubmit('You are a helpful assistant.')}>Use Default</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         );
//     }
// };

// export default RoleDescriptionModal;
