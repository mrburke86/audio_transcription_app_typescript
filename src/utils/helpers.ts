// src/utils/helpers.ts
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

export function formatTimestamp(date: Date): string {
    return date.toLocaleString("en-US", { hour12: false });
}

export function getFormDataValue(formData: FormData, key: string): string {
    const value = formData.get(key);
    if (typeof value === "string") {
        return value;
    }
    throw new Error(`Key '${key}' not found in FormData`);
}
