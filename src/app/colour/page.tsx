// src/app/colour/page.tsx

export default function Colour() {
    return (
        <div>
            <h1>Colour Palette</h1>
            <div className="w-full p-4">
                <h2 className="text-2xl font-bold mb-4">Color Palette</h2>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            Light Theme
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {colors.map((color) => (
                                <ColorSwatch
                                    key={`light-${color.name}`}
                                    name={color.name}
                                    color={color.light}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            Dark Theme
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {colors.map((color) => (
                                <ColorSwatch
                                    key={`dark-${color.name}`}
                                    name={color.name}
                                    color={color.dark}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const colors = [
    { name: "background", light: "0 0% 100%", dark: "222.2 84% 4.9%" },
    { name: "foreground", light: "222.2 84% 4.9%", dark: "210 40% 98%" },
    { name: "card", light: "0 0% 100%", dark: "222.2 84% 4.9%" },
    { name: "card-foreground", light: "222.2 84% 4.9%", dark: "210 40% 98%" },
    { name: "popover", light: "0 0% 100%", dark: "222.2 84% 4.9%" },
    {
        name: "popover-foreground",
        light: "222.2 84% 4.9%",
        dark: "210 40% 98%",
    },
    { name: "primary", light: "222.2 47.4% 11.2%", dark: "210 40% 98%" },
    {
        name: "primary-foreground",
        light: "210 40% 98%",
        dark: "222.2 47.4% 11.2%",
    },
    { name: "secondary", light: "210 40% 96.1%", dark: "217.2 32.6% 17.5%" },
    {
        name: "secondary-foreground",
        light: "222.2 47.4% 11.2%",
        dark: "210 40% 98%",
    },
    { name: "muted", light: "210 40% 96.1%", dark: "217.2 32.6% 17.5%" },
    {
        name: "muted-foreground",
        light: "215.4 16.3% 46.9%",
        dark: "215 20.2% 65.1%",
    },
    { name: "accent", light: "210 40% 96.1%", dark: "217.2 32.6% 17.5%" },
    {
        name: "accent-foreground",
        light: "222.2 47.4% 11.2%",
        dark: "210 40% 98%",
    },
    { name: "destructive", light: "0 84.2% 60.2%", dark: "0 62.8% 30.6%" },
    {
        name: "destructive-foreground",
        light: "210 40% 98%",
        dark: "210 40% 98%",
    },
    { name: "border", light: "214.3 31.8% 91.4%", dark: "217.2 32.6% 17.5%" },
    { name: "input", light: "214.3 31.8% 91.4%", dark: "217.2 32.6% 17.5%" },
    { name: "ring", light: "222.2 84% 4.9%", dark: "212.7 26.8% 83.9%" },
    { name: "chart-1", light: "12 76% 61%", dark: "220 70% 50%" },
    { name: "chart-2", light: "173 58% 39%", dark: "160 60% 45%" },
    { name: "chart-3", light: "197 37% 24%", dark: "30 80% 55%" },
    { name: "chart-4", light: "43 74% 66%", dark: "280 65% 60%" },
    { name: "chart-5", light: "27 87% 67%", dark: "340 75% 55%" },
];

const ColorSwatch = ({ name, color }: { name: string; color: string }) => (
    <div className="flex flex-col items-center">
        <div
            className="w-full aspect-square mb-2 rounded border-2 border-green-600"
            style={{ backgroundColor: `hsl(${color})` }}
        ></div>
        <span className="text-xs text-center">{name}</span>
    </div>
);

//     <div className="flex flex-col items-center border-2 border-foreground rounded-lg p-2">
