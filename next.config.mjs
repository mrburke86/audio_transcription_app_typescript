// // import createMDX from '@next/mdx';

// /** @type {import('next').NextConfig} */

// // Helper for colored console logs (optional, or use ANSI codes directly)
// // const logWithColor = (colorCode, message) => {
// //     console.log(`\x1b[${colorCode}m%s\x1b[0m`, message);
// // };

// console.log('\n\x1b[34m🔷 Loading Next.js Configuration (next.config.mjs)...\x1b[0m');

// const nextConfig = {
//     // ✅ Environment-conditional strict mode (reduces dev double-initialization)
//     reactStrictMode: process.env.NODE_ENV === 'production',

//     // ✅ Performance optimizations
//     swcMinify: true,
//     pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
//     webpack: (config, { isServer }) => {
//         if (!isServer) {
//             config.resolve.fallback = {
//                 ...config.resolve.fallback,
//                 fs: false,
//                 dns: false,
//                 net: false,
//                 tls: false,
//             };
//         }
//         return config;
//     },
//     env: {
//         NEXT_PUBLIC_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
//         NEXT_PUBLIC_QDRANT_URL: process.env.QDRANT_URL, // If needed client-side
//     },

//     // Reduce re-renders in development
//     //   reactStrictMode: false, // Disable in development if causing issues
//     // Optimize compilation
//     experimental: {
//         optimizeCss: true,
//         optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
//     },

//     // Better development experience
//     devIndicators: {
//         buildActivity: true,
//         buildActivityPosition: 'bottom-right',
//     },
// };

// // const withMDX = createMDX({
// //     // Add markdown plugins here, as desired
// // });

// console.log('\x1b[34m🔷 Next.js Configuration Loaded Successfully.\x1b[0m\n');

// // Merge MDX config with Next.js config
// // export default withMDX(nextConfig);
// export default nextConfig;

// next.config.mjs - Clean Minimal Configuration
/** @type {import('next').NextConfig} */

const nextConfig = {
    // ✅ Only strict mode in production (reduces dev double-initialization)
    reactStrictMode: process.env.NODE_ENV === 'production',

    // ✅ Performance optimizations
    swcMinify: true,

    // ✅ Experimental optimizations for faster builds
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },

    // ✅ Development vs Production webpack config
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            // Development optimizations - faster builds
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };

            config.optimization = {
                ...config.optimization,
                removeAvailableModules: false,
                removeEmptyChunks: false,
                splitChunks: false,
            };
        } else if (!isServer) {
            // Production optimizations
            config.optimization = {
                ...config.optimization,
                usedExports: true,
                sideEffects: false,
            };
        }

        return config;
    },

    // ✅ Faster development (skip type checking and linting in dev)
    typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === 'development',
    },

    eslint: {
        ignoreDuringBuilds: process.env.NODE_ENV === 'development',
    },

    // ✅ Image optimization
    images: {
        unoptimized: process.env.NODE_ENV === 'development',
    },

    // ✅ Docker optimization
    output: 'standalone',

    // ✅ Remove Next.js branding
    poweredByHeader: false,
};

export default nextConfig;
