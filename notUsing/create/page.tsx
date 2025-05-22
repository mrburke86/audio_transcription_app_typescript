// // // src/app/assistants/create/page.tsx

// "use client";

// import { useForm, UseFormReturn } from "react-hook-form";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import {
//     Form,
//     FormControl,
//     // FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { ASSISTANT_CATEGORIES, MODEL_OPTIONS } from "@/lib/config";
// import * as z from "zod";
// import {
//     Card,
//     CardHeader,
//     CardTitle,
//     CardContent,
//     Textarea,
//     CardFooter,
//     Button,
//     Switch,
//     Label,
//     useToast,
// } from "@/components/ui";
// import { logger } from "@/modules/Logger";
// // import {
// // createAssistant,
// // updateAssistantWithVectorStore,
// // } from "@/utils/assistantUtils";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import { createAssistant, updateAssistantWithVectorStore } from "@/lib/openai";

// const formSchema = z.object({
//     name: z.string().min(10, "Name must be at least 10 characters").max(256),
//     description: z
//         .string()
//         .min(50, "Description must be at least 50 characters")
//         .max(512),
//     instructions: z
//         .string()
//         .min(50, "Instructions must be at least 50 characters")
//         .max(256000),
//     category: z.string().max(512),
//     model: z.string().min(1, "Model is required"),
//     temperature: z.number().min(0).max(2),
//     useCodeInterpreter: z.boolean(),
//     useFileSearch: z.boolean(),
//     tools: z.array(z.object({ type: z.string() })),
// });

// export type FormData = z.infer<typeof formSchema>;

// export default function CreateAssistantPage() {
//     const router = useRouter();
//     const { toast } = useToast(); // Initialize toast

//     const [isLoading, setIsLoading] = useState(false);
//     const [files, setFiles] = useState<File[]>([]);

//     const form = useForm<FormData>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             name: "",
//             description: "",
//             instructions: "",
//             category: "",
//             model: "",
//             temperature: 1,
//             useCodeInterpreter: false,
//             useFileSearch: false,
//             tools: [],
//         },
//     });

//     const { watch } = form;
//     const useFileSearch = watch("useFileSearch");

//     const onSubmit = async (data: FormData) => {
//         setIsLoading(true);

//         try {
//             // Determine tools based on user input
//             const tools = [];
//             if (data.useCodeInterpreter)
//                 tools.push({ type: "code_interpreter" });
//             if (data.useFileSearch) tools.push({ type: "file_search" });

//             const assistant = await createAssistant({
//                 name: data.name,
//                 description: data.description,
//                 model: data.model,
//                 temperature: data.temperature,
//                 instructions: data.instructions,
//                 category: data.category,
//                 tools,
//             });

//             if (files.length > 0 && assistant.id) {
//                 await updateAssistantWithVectorStore(assistant.id, files);
//             }

//             logger.info(`Assistant created successfully: ${assistant.id}`);
//             toast({
//                 title: "Assistant Created",
//                 description: `Assistant "${assistant.name}" has been created successfully.`,
//                 variant: "success",
//             });
//             router.push(`/assistants/${assistant.id}`);
//         } catch (error) {
//             logger.error(`Error creating assistant: ${error}`);
//             toast({
//                 title: "Error",
//                 description: "Failed to create assistant. Please try again.",
//                 variant: "destructive",
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     console.log("MODEL_OPTIONS:", MODEL_OPTIONS);

//     return (
//         <div className="container mx-auto p-4">
//             <Card>
//                 <CardHeader>
//                     <CardTitle>Create New Assistant</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <Form {...form}>
//                         <form
//                             onSubmit={form.handleSubmit(onSubmit)}
//                             className="space-y-8"
//                         >
//                             {/* Name */}
//                             {NameField(form)}

//                             {/* Description */}
//                             {DescriptionField(form)}

//                             {/* Instructions */}
//                             {InstructionsField(form)}

//                             {/* Category */}
//                             <FormField
//                                 control={form.control}
//                                 name="category"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>
//                                             Category{" "}
//                                             <span className="text-red-500">
//                                                 *
//                                             </span>
//                                         </FormLabel>
//                                         <Select
//                                             value={field.value}
//                                             onValueChange={field.onChange}
//                                         >
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select a category" />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 {ASSISTANT_CATEGORIES.map(
//                                                     (category) => (
//                                                         <SelectItem
//                                                             key={category.value}
//                                                             value={
//                                                                 category.value
//                                                             }
//                                                         >
//                                                             {category.label}
//                                                         </SelectItem>
//                                                     ),
//                                                 )}
//                                             </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             {/* Model */}
//                             <FormField
//                                 control={form.control}
//                                 name="model"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>
//                                             Model{" "}
//                                             <span className="text-red-500">
//                                                 *
//                                             </span>
//                                         </FormLabel>
//                                         <Select
//                                             value={field.value}
//                                             onValueChange={(value) =>
//                                                 field.onChange(value)
//                                             }
//                                         >
//                                             <SelectTrigger>
//                                                 <SelectValue placeholder="Select a model" />
//                                             </SelectTrigger>
//                                             <SelectContent className="z-50">
//                                                 {MODEL_OPTIONS.map((model) => (
//                                                     <SelectItem
//                                                         key={model.value}
//                                                         value={model.value}
//                                                     >
//                                                         {model.label}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             {/* Temperature */}
//                             {TemperatureField(form)}

//                             {/* Use Code Interpreter */}
//                             {UseCodeInterpreterSwitch(form)}

//                             {/* Use File Search */}
//                             {UseFileSearchSwitch(form)}

//                             {useFileSearch && (
//                                 <div>
//                                     <Label htmlFor="file-upload">
//                                         Upload Files
//                                     </Label>
//                                     <Input
//                                         id="file-upload"
//                                         type="file"
//                                         multiple
//                                         onChange={(e) =>
//                                             setFiles(
//                                                 Array.from(
//                                                     e.target.files || [],
//                                                 ),
//                                             )
//                                         }
//                                     />
//                                 </div>
//                             )}

//                             <CardFooter className="flex justify-end">
//                                 {CreateAssistantButton(isLoading)}
//                             </CardFooter>
//                         </form>
//                     </Form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }

// function CreateAssistantButton(isLoading: boolean) {
//     return (
//         <Button
//             type="submit"
//             disabled={isLoading}
//             className="flex items-center"
//         >
//             {isLoading && (
//                 <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                 >
//                     <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                     ></circle>
//                     <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8v8H4z"
//                     ></path>
//                 </svg>
//             )}
//             {isLoading ? "Creating..." : "Create Assistant"}
//         </Button>
//     );
// }

// // Temperature Field
// function TemperatureField(form: UseFormReturn<FormData>) {
//     return (
//         <FormField
//             control={form.control}
//             name="temperature"
//             render={({ field }) => (
//                 <FormItem>
//                     <FormLabel>
//                         Temperature <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                         <Input
//                             {...field}
//                             id="temperature"
//                             type="number"
//                             min={0}
//                             max={2}
//                             step={0.1}
//                             onChange={(e) =>
//                                 field.onChange(parseFloat(e.target.value))
//                             }
//                         />
//                     </FormControl>
//                     <FormMessage />
//                 </FormItem>
//             )}
//         />
//     );
// }

// // Use Code Interpreter Switch
// function UseCodeInterpreterSwitch(form: UseFormReturn<FormData>) {
//     return (
//         <FormField
//             control={form.control}
//             name="useCodeInterpreter"
//             render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                     <div className="space-y-0.5">
//                         <FormLabel className="text-base">
//                             Use Code Interpreter
//                         </FormLabel>
//                     </div>
//                     <FormControl>
//                         <Switch
//                             id="code-interpreter"
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                         />
//                     </FormControl>
//                 </FormItem>
//             )}
//         />
//     );
// }

// // Use File Search Switch
// function UseFileSearchSwitch(form: UseFormReturn<FormData>) {
//     return (
//         <FormField
//             control={form.control}
//             name="useFileSearch"
//             render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                     <div className="space-y-0.5">
//                         <FormLabel className="text-base">
//                             Use File Search
//                         </FormLabel>
//                     </div>
//                     <FormControl>
//                         <Switch
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                         />
//                     </FormControl>
//                 </FormItem>
//             )}
//         />
//     );
// }

// // Instructions Field
// function InstructionsField(form: UseFormReturn<FormData>) {
//     return (
//         <FormField
//             control={form.control}
//             name="instructions"
//             render={({ field }) => (
//                 <FormItem>
//                     <FormLabel>
//                         Instructions <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                         <Textarea
//                             {...field}
//                             id="instructions"
//                             maxLength={256000}
//                         />
//                     </FormControl>
//                     <FormMessage />
//                 </FormItem>
//             )}
//         />
//     );
// }

// // Description Field
// function DescriptionField(form: UseFormReturn<FormData>) {
//     return (
//         <FormField
//             control={form.control}
//             name="description"
//             render={({ field }) => (
//                 <FormItem>
//                     <FormLabel>
//                         Description <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                         <Input {...field} maxLength={256} />
//                     </FormControl>
//                     <FormMessage />
//                 </FormItem>
//             )}
//         />
//     );
// }

// // Name Field
// function NameField(form: UseFormReturn<FormData>) {
//     return (
//         <FormField
//             control={form.control}
//             name="name"
//             render={({ field }) => (
//                 <FormItem>
//                     <FormLabel>
//                         Name <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <FormControl>
//                         <Input {...field} maxLength={256} />
//                     </FormControl>
//                     <FormMessage />
//                 </FormItem>
//             )}
//         />
//     );
// }
