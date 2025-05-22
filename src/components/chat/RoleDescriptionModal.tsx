// src/components/chat/RoleDescriptionModal.tsx

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button, Textarea } from "@/components/ui";

interface RoleDescriptionModalProps {
    onSubmit: (roleDescription: string) => void;
}

const RoleDescriptionModal: React.FC<RoleDescriptionModalProps> = ({
    onSubmit,
}) => {
    const [inputValue, setInputValue] = useState("");

    return (
        <Dialog open={true}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set Role Description</DialogTitle>
                    <DialogDescription>
                        Please enter the role description for the assistant:
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Textarea
                        // type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter role description"
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => {
                            if (inputValue.trim() !== "") {
                                onSubmit(inputValue.trim());
                            }
                        }}
                    >
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RoleDescriptionModal;
