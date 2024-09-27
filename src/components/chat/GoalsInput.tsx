// src/components/chat/GoalsInput.tsx
"use client";
import React, { useState } from "react";
import { Button } from "../ui";

interface GoalsInputProps {
    goals: string[];
    setGoals: React.Dispatch<React.SetStateAction<string[]>>;
}

const GoalsInput: React.FC<GoalsInputProps> = ({ goals, setGoals }) => {
    const [input, setInput] = useState("");

    const handleAddGoal = () => {
        if (input.trim() !== "") {
            setGoals([...goals, input.trim()]);
            setInput("");
        }
    };

    const handleRemoveGoal = (index: number) => {
        const updatedGoals = goals.filter((_, i) => i !== index);
        setGoals(updatedGoals);
    };

    return (
        <div className="p-4">
            <h3 className="text-base font-semibold mb-2">
                Set Conversation Goals
            </h3>
            <div className="flex items-center mb-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a goal or milestone"
                    className="flex-1 mr-2"
                />
                <Button
                    onClick={handleAddGoal}
                    // className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add
                </Button>
            </div>
            {goals.length > 0 && (
                <ul className="list-disc list-inside">
                    {goals.map((goal, index) => (
                        <li
                            key={index}
                            className="flex justify-between items-center"
                        >
                            <span>{goal}</span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveGoal(index)}
                            >
                                Remove
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GoalsInput;
