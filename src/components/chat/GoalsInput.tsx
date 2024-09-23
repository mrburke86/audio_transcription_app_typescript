// src/components/chat/GoalsInput.tsx
"use client";
import React, { useState } from "react";

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
            <h3 className="text-lg font-semibold mb-2">
                Set Conversation Goals
            </h3>
            <div className="flex items-center mb-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a goal or milestone"
                    className="flex-1 p-2 border border-gray-300 rounded mr-2"
                />
                <button
                    onClick={handleAddGoal}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add
                </button>
            </div>
            {goals.length > 0 && (
                <ul className="list-disc list-inside">
                    {goals.map((goal, index) => (
                        <li
                            key={index}
                            className="flex justify-between items-center"
                        >
                            <span>{goal}</span>
                            <button
                                onClick={() => handleRemoveGoal(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GoalsInput;
