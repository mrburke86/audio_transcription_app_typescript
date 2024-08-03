// src/components/Button.tsx
import React from "react";

interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    onClick,
    disabled,
    className,
    children,
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ${
                disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:-translate-y-0.5 active:translate-y-0.5"
            } ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
