// // src\components\call-modal\components\FormField.tsx
// import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// import { Label } from '@/components/ui/label';
// import { cn } from '@/lib/utils';
// import { CallContext } from '@/types';

// interface FormFieldProps {
//     label: string;
//     value: string;
//     onChange: (field: keyof CallContext, value: unknown) => void
//     required?: boolean;
//     error?: string;

// }

// export function FormField({ label, value, onChange, required, type = 'text', options = null }: FormFieldProps) {
//     return (
//         <div className={cn('space-y-2')}>
//             <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                 {label}
//                 {required && <span className="text-destructive ml-1">*</span>}
//             </Label>
//             {options ? (
//                 <Select
//                     value={value}
//                     onValueChange={e => onChange(e.target.value)}
//                 >
//                     <SelectTrigger>
//                         <SelectValue placeholder="Select..." />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {options.map(opt => (
//                             <SelectItem key={opt.value} value={opt.value}>
//                                 {opt.label}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>
//             ) : (
//                 <Input
//                     type={type}
//                     value={value}
//                     onChange={e => onChange(e.target.value)}
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//             )}

//             {children}
//             {error && <p className="text-sm text-destructive">{error}</p>}
//         </div>
//     );
// }

// // // src/components/interview-modal/components/FormField.tsx
// // import { Label } from '@/components/ui/label';
// // import { cn } from '@/lib/utils';

// // interface FormFieldProps {
// //     label: string;
// //     error?: string;
// //     required?: boolean;
// //     children: React.ReactNode;
// //     className?: string;
// // }

// // export function FormField({ label, error, required, children, className }: FormFieldProps) {
// //     return (
// //         <div className={cn('space-y-2', className)}>
// //             <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
// //                 {label}
// //                 {required && <span className="text-destructive ml-1">*</span>}
// //             </Label>
// //             {children}
// //             {error && <p className="text-sm text-destructive">{error}</p>}
// //         </div>
// //     );
// // }
