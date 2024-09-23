// tailwind.config.ts
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)", ...fontFamily.sans],
            },
            colors: {
                primary: "hsl(var(--primary) / <alpha-value>)",
                secondary: "hsl(var(--secondary) / <alpha-value>)",
                accent: "hsl(var(--accent) / <alpha-value>)",
                destructive: "hsl(var(--destructive) / <alpha-value>)",
                muted: "hsl(var(--muted) / <alpha-value>)",
                border: "hsl(var(--border) / <alpha-value>)",
                input: "hsl(var(--input) / <alpha-value>)",
                background: "hsl(var(--background) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                popover: "hsl(var(--popover) / <alpha-value>)",
                card: "hsl(var(--card) / <alpha-value>)",
                text: "hsl(var(--text) / <alpha-value>)",
                "text-secondary": "hsl(var(--text-secondary) / <alpha-value>)",
                "user-message":
                    "hsl(var(--user-message-background) / <alpha-value>)",
            },
            maxWidth: {
                "80%": "80%",
            },
            margin: {
                "20%": "20%",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
            typography: ({ theme }: { theme: (path: string) => string }) => ({
                DEFAULT: {
                    css: {
                        color: theme("colors.foreground"),
                        a: {
                            color: theme("colors.primary"),
                            "&:hover": {
                                color: theme("colors.primary"),
                            },
                        },
                    },
                },
                dark: {
                    css: {
                        color: theme("colors.text"),
                        a: {
                            color: theme("colors.primary"),
                            "&:hover": {
                                color: theme("colors.primary"),
                            },
                        },
                        strong: {
                            color: theme("colors.text-secondary"),
                        },
                        h1: {
                            color: theme("colors.text"),
                        },
                        h2: {
                            color: theme("colors.text-secondary"),
                        },
                    },
                },
            }),
        },
    },
    plugins: [animate, typography],
} satisfies Config;

export default config;
