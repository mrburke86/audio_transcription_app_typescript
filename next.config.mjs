// next.config.mjs - Clean Minimal Configuration
/** @type {import('next').NextConfig} */

const nextConfig = {
    // ✅ Only strict mode in production (reduces dev double-initialization)
    reactStrictMode: process.env.NODE_ENV === 'production',

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
