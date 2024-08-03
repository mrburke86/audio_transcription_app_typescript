// src/app/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = () => {
    const [systemPrompt, setSystemPrompt] = useState("");
    const [userPrompt, setUserPrompt] = useState("");
    const [files, setFiles] = useState<string[]>([]);
    const [newFile, setNewFile] = useState("");

    useEffect(() => {
        // Fetch current settings from the API
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        // TODO: Implement API call to fetch current settings
        // For now, we'll use placeholder data
        setSystemPrompt("You are a helpful assistant.");
        setUserPrompt("Please answer the following question:");
        setFiles(["file1.txt", "file2.pdf"]);
    };

    const handleSavePrompts = async () => {
        // TODO: Implement API call to save prompts
        console.log("Saving prompts:", { systemPrompt, userPrompt });
    };

    const handleAddFile = async () => {
        if (newFile) {
            // TODO: Implement API call to add file
            setFiles([...files, newFile]);
            setNewFile("");
        }
    };

    const handleRemoveFile = async (file: string) => {
        // TODO: Implement API call to remove file
        setFiles(files.filter((f) => f !== file));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <label
                            htmlFor="systemPrompt"
                            className="block text-sm font-medium text-gray-700"
                        >
                            System Prompt
                        </label>
                        <Textarea
                            id="systemPrompt"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="userPrompt"
                            className="block text-sm font-medium text-gray-700"
                        >
                            User Prompt
                        </label>
                        <Textarea
                            id="userPrompt"
                            value={userPrompt}
                            onChange={(e) => setUserPrompt(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <Button onClick={handleSavePrompts}>Save Prompts</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>File Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <label
                            htmlFor="newFile"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Add New File
                        </label>
                        <div className="flex mt-1">
                            <Input
                                id="newFile"
                                value={newFile}
                                onChange={(e) => setNewFile(e.target.value)}
                                className="flex-grow mr-2"
                            />
                            <Button onClick={handleAddFile}>Add</Button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium mb-2">
                            Current Files
                        </h3>
                        <ul>
                            {files.map((file) => (
                                <li
                                    key={file}
                                    className="flex justify-between items-center mb-2"
                                >
                                    {file}
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleRemoveFile(file)}
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
