// // src/app/help/feedback/page.tsx
// "use client";

// import React from "react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//     Card,
//     CardHeader,
//     CardTitle,
//     CardDescription,
//     CardContent,
//     CardFooter,
// } from "@/components/ui/card";
// import { Star, Send } from "lucide-react";

// const feedbackSchema = z.object({
//     rating: z.number().min(1).max(5),
//     feedbackType: z.enum(["Suggestion", "Compliment", "Problem", "Other"]),
//     comment: z.string().min(1, "Please provide your feedback"),
//     name: z.string().optional(),
//     email: z.string().email().optional(),
//     agreeToContact: z.boolean(),
// });

// type FeedbackFormData = z.infer<typeof feedbackSchema>;

// export default function FeedbackPage() {
//     const { control, handleSubmit } = useForm<FeedbackFormData>({
//         resolver: zodResolver(feedbackSchema),
//         defaultValues: {
//             rating: 0,
//             feedbackType: "Suggestion",
//             comment: "",
//             name: "",
//             email: "",
//             agreeToContact: false,
//         },
//     });

//     const onSubmit = (data: FeedbackFormData) => {
//         console.log(data);
//         // Here you would typically send the feedback data to your backend
//         // Reset form or show success message
//     };

//     // const rating = watch("rating");

//     return (
//         <div className="container mx-auto py-8">
//             <Card className="max-w-2xl mx-auto">
//                 <CardHeader>
//                     <CardTitle className="text-2xl">
//                         We Value Your Feedback
//                     </CardTitle>
//                     <CardDescription>
//                         Help us improve our service by sharing your thoughts and
//                         experiences.
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <form
//                         onSubmit={handleSubmit(onSubmit)}
//                         className="space-y-6"
//                     >
//                         <div>
//                             <Label className="text-base">
//                                 How would you rate your overall experience?
//                             </Label>
//                             <div className="flex space-x-2 mt-2">
//                                 <Controller
//                                     name="rating"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <>
//                                             {[1, 2, 3, 4, 5].map((star) => (
//                                                 <Button
//                                                     key={star}
//                                                     type="button"
//                                                     variant={
//                                                         field.value === star
//                                                             ? "default"
//                                                             : "outline"
//                                                     }
//                                                     size="sm"
//                                                     onClick={() =>
//                                                         field.onChange(star)
//                                                     }
//                                                 >
//                                                     <Star
//                                                         className={`h-4 w-4 ${
//                                                             field.value &&
//                                                             star <= field.value
//                                                                 ? "fill-current"
//                                                                 : ""
//                                                         }`}
//                                                     />
//                                                 </Button>
//                                             ))}
//                                         </>
//                                     )}
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <Label className="text-base">
//                                 What type of feedback do you have?
//                             </Label>
//                             <Controller
//                                 name="feedbackType"
//                                 control={control}
//                                 render={({ field }) => (
//                                     <RadioGroup
//                                         className="mt-2"
//                                         onValueChange={field.onChange}
//                                         value={field.value}
//                                     >
//                                         {[
//                                             "Suggestion",
//                                             "Compliment",
//                                             "Problem",
//                                             "Other",
//                                         ].map((type) => (
//                                             <div
//                                                 key={type}
//                                                 className="flex items-center space-x-2"
//                                             >
//                                                 <RadioGroupItem
//                                                     value={type}
//                                                     id={type}
//                                                 />
//                                                 <Label htmlFor={type}>
//                                                     {type}
//                                                 </Label>
//                                             </div>
//                                         ))}
//                                     </RadioGroup>
//                                 )}
//                             />
//                         </div>

//                         <div>
//                             <Label htmlFor="comment" className="text-base">
//                                 Please provide your feedback
//                             </Label>
//                             <Controller
//                                 name="comment"
//                                 control={control}
//                                 render={({ field }) => (
//                                     <Textarea
//                                         id="comment"
//                                         placeholder="Share your thoughts here..."
//                                         className="mt-2"
//                                         {...field}
//                                     />
//                                 )}
//                             />
//                         </div>

//                         <div className="space-y-4">
//                             <div>
//                                 <Label htmlFor="name">Name (optional)</Label>
//                                 <Controller
//                                     name="name"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <Input
//                                             id="name"
//                                             placeholder="Your name"
//                                             {...field}
//                                         />
//                                     )}
//                                 />
//                             </div>
//                             <div>
//                                 <Label htmlFor="email">Email (optional)</Label>
//                                 <Controller
//                                     name="email"
//                                     control={control}
//                                     render={({ field }) => (
//                                         <Input
//                                             id="email"
//                                             type="email"
//                                             placeholder="Your email"
//                                             {...field}
//                                         />
//                                     )}
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex items-center space-x-2">
//                             <Controller
//                                 name="agreeToContact"
//                                 control={control}
//                                 render={({ field }) => (
//                                     <Checkbox
//                                         id="agreeToContact"
//                                         checked={field.value}
//                                         onCheckedChange={field.onChange}
//                                     />
//                                 )}
//                             />
//                             <Label htmlFor="agreeToContact">
//                                 I agree to be contacted about my feedback
//                             </Label>
//                         </div>
//                     </form>
//                 </CardContent>
//                 <CardFooter>
//                     <Button
//                         type="submit"
//                         className="w-full"
//                         onClick={handleSubmit(onSubmit)}
//                     >
//                         <Send className="mr-2 h-4 w-4" /> Submit Feedback
//                     </Button>
//                 </CardFooter>
//             </Card>
//         </div>
//     );
// }
