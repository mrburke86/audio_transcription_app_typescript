"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui";
import { logger } from "@/modules/Logger";

interface GoalsInputProps {
    goals: string[];
    setGoals: React.Dispatch<React.SetStateAction<string[]>>;
}

const GoalsInput: React.FC<GoalsInputProps> = ({ goals, setGoals }) => {
    const [input, setInput] = useState("");

    useEffect(() => {
        try {
            logger.info("🎯 GoalsInput component mounted");
            logger.debug(`📊 Initial goals count: ${goals.length}`);
        } catch (error) {
            logger.error(
                `❌ Error during GoalsInput mount: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }

        return () => {
            logger.info("🧹 GoalsInput component unmounting");
        };
    }, [goals.length]);

    const handleAddGoal = () => {
        try {
            const trimmedInput = input.trim();

            if (trimmedInput === "") {
                logger.warning("⚠️ Attempted to add empty goal");
                return;
            }

            if (goals.includes(trimmedInput)) {
                logger.warning("⚠️ Attempted to add duplicate goal");
                return;
            }

            if (trimmedInput.length > 200) {
                logger.warning(
                    "⚠️ Goal text exceeds maximum length (200 characters)",
                );
                return;
            }

            logger.info(`➕ Adding new goal: "${trimmedInput}"`);
            setGoals([...goals, trimmedInput]);
            setInput("");
            logger.debug(`📈 Goals count after addition: ${goals.length + 1}`);
        } catch (error) {
            logger.error(
                `❌ Error adding goal: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    const handleRemoveGoal = (index: number) => {
        try {
            if (index < 0 || index >= goals.length) {
                logger.error(`❌ Invalid goal index for removal: ${index}`);
                return;
            }

            const goalToRemove = goals[index];
            logger.info(`➖ Removing goal: "${goalToRemove}"`);

            const updatedGoals = goals.filter((_, i) => i !== index);
            setGoals(updatedGoals);

            logger.debug(
                `📉 Goals count after removal: ${updatedGoals.length}`,
            );
        } catch (error) {
            logger.error(
                `❌ Error removing goal: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setInput(e.target.value);
        } catch (error) {
            logger.error(
                `❌ Error handling input change: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        try {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddGoal();
                logger.debug("⌨️ Goal added via Enter key");
            }
        } catch (error) {
            logger.error(
                `❌ Error handling key press: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    };

    try {
        return (
            <div className="p-4">
                <h3 className="text-base font-semibold mb-2">
                    Set Conversation Goals
                </h3>
                <div className="flex items-center mb-2">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter a goal or milestone"
                        className="flex-1 mr-2"
                        maxLength={200}
                    />
                    <Button onClick={handleAddGoal}>Add</Button>
                </div>
                {goals.length > 0 && (
                    <ul className="list-disc list-inside">
                        {goals.map((goal, index) => {
                            try {
                                return (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center"
                                    >
                                        <span>{goal}</span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveGoal(index)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                );
                            } catch (error) {
                                logger.error(
                                    `❌ Error rendering goal ${index}: ${
                                        error instanceof Error
                                            ? error.message
                                            : "Unknown error"
                                    }`,
                                );
                                return (
                                    <li key={index} className="text-red-500">
                                        Error displaying goal
                                    </li>
                                );
                            }
                        })}
                    </ul>
                )}
            </div>
        );
    } catch (error) {
        logger.error(
            `❌ Critical error rendering GoalsInput: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        );
        return (
            <div className="p-4 bg-red-50 rounded">
                <div className="text-red-600 text-center">
                    <p className="font-semibold">Goals input error</p>
                    <p className="text-sm">Unable to display goals interface</p>
                </div>
            </div>
        );
    }
};

export default GoalsInput;
