// // src/app/assistants/[id]/AssistantPropertyEditor.tsx
// "use client";

// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";
// import { Switch } from "@/components/ui/switch";
// import { updateAssistant } from "@/app/actions";
// import { useToast } from "@/components/ui/use-toast";
// import { Assistant, Tool } from "@/types/assistant";

// interface AssistantPropertyEditorProps {
//     assistant: Assistant;
// }

// export function AssistantPropertyEditor({
//     assistant,
// }: AssistantPropertyEditorProps) {
//     const [name, setName] = useState(assistant.name);
//     const [model, setModel] = useState(assistant.model);
//     const [temperature, setTemperature] = useState(assistant.temperature || 1);
//     const [useCodeInterpreter, setUseCodeInterpreter] = useState(
//         assistant.tools.some((tool: Tool) => tool.type === "code_interpreter"),
//     );
//     const [useFileSearch, setUseFileSearch] = useState(
//         assistant.tools.some((tool: Tool) => tool.type === "file_search"),
//     );
//     const [isSaving, setIsSaving] = useState(false);
//     const { toast } = useToast();

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSaving(true);

//         const tools: Tool[] = [];
//         if (useCodeInterpreter) tools.push({ type: "code_interpreter" });
//         if (useFileSearch) tools.push({ type: "file_search" });

//         const formData = new FormData();
//         formData.append("assistantId", assistant.id);
//         formData.append("name", name);
//         formData.append("model", model);
//         formData.append("temperature", temperature.toString());
//         formData.append("tools", JSON.stringify(tools));

//         try {
//             await updateAssistant(formData);
//             toast({
//                 title: "Assistant updated",
//                 description:
//                     "The assistant properties have been successfully updated.",
//             });
//         } catch (error) {
//             console.error("Failed to update assistant properties:", error);
//             toast({
//                 title: "Error",
//                 description:
//                     "Failed to update assistant properties. Please try again.",
//                 variant: "destructive",
//             });
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     return (
//         <Card className="border-2 border-red-500">
//             <CardHeader>
//                 <CardTitle>
//                     {" "}
//                     <div className="text-red-500">
//                         &quot;AssistantPropertyEditor&quot; Component
//                     </div>
//                     <div>
//                         {" "}
//                         <div className="text-red-500">
//                             AssistantDetails Component
//                         </div>
//                     </div>
//                 </CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div>
//                         <Label htmlFor="name">Name</Label>
//                         <Input
//                             id="name"
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                             required
//                             maxLength={256}
//                         />
//                     </div>
//                     <div>
//                         <Label htmlFor="model">Model</Label>
//                         <Select value={model} onValueChange={setModel}>
//                             <SelectTrigger>
//                                 <SelectValue placeholder="Select a model" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="gpt-4">GPT-4</SelectItem>
//                                 <SelectItem value="gpt-4-turbo">
//                                     GPT-4 Turbo
//                                 </SelectItem>
//                                 <SelectItem value="gpt-3.5-turbo">
//                                     GPT-3.5 Turbo
//                                 </SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                     <div>
//                         <Label htmlFor="temperature">
//                             Temperature: {temperature}
//                         </Label>
//                         <Slider
//                             id="temperature"
//                             min={0}
//                             max={2}
//                             step={0.1}
//                             value={[temperature]}
//                             onValueChange={(value) => setTemperature(value[0])}
//                         />
//                     </div>
//                     <div className="flex items-center space-x-2">
//                         <Switch
//                             id="code-interpreter"
//                             checked={useCodeInterpreter}
//                             onCheckedChange={setUseCodeInterpreter}
//                         />
//                         <Label htmlFor="code-interpreter">
//                             Use Code Interpreter
//                         </Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                         <Switch
//                             id="file-search"
//                             checked={useFileSearch}
//                             onCheckedChange={setUseFileSearch}
//                         />
//                         <Label htmlFor="file-search">Use File Search</Label>
//                     </div>
//                     <Button type="submit" disabled={isSaving}>
//                         {isSaving ? "Saving..." : "Save Properties"}
//                     </Button>
//                 </form>
//             </CardContent>
//         </Card>
//     );
// }
