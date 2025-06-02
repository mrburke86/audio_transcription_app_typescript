import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */

// Helper for colored console logs (optional, or use ANSI codes directly)
// const logWithColor = (colorCode, message) => {
//     console.log(`\x1b[${colorCode}m%s\x1b[0m`, message);
// };

console.log('\n\x1b[34m🔷 Loading Next.js Configuration (next.config.mjs)...\x1b[0m');

const nextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                dns: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
    env: {
        NEXT_PUBLIC_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        NEXT_PUBLIC_QDRANT_URL: process.env.QDRANT_URL, // If needed client-side
    },
};

const withMDX = createMDX({
    // Add markdown plugins here, as desired
});

console.log('\x1b[34m🔷 Next.js Configuration Loaded Successfully.\x1b[0m\n');

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
