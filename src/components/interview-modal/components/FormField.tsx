// // src/components/interview-modal/components/FormField.tsx
// import { Label } from '@/components/ui/label';
// import { cn } from '@/lib/utils';

// interface FormFieldProps {
//     label: string;
//     error?: string;
//     required?: boolean;
//     children: React.ReactNode;
//     className?: string;
// }

// export function FormField({ label, error, required, children, className }: FormFieldProps) {
//     return (
//         <div className={cn('space-y-2', className)}>
//             <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                 {label}
//                 {required && <span className="text-destructive ml-1">*</span>}
//             </Label>
//             {children}
//             {error && <p className="text-sm text-destructive">{error}</p>}
//         </div>
//     );
// }
