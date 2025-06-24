// Remove the commented-out environment exposure
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: process.env.NODE_ENV === 'production',
    swcMinify: true,

    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },

    webpack: (config, { dev, isServer }) => {
        if (dev) {
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
            config.optimization = {
                ...config.optimization,
                usedExports: true,
                sideEffects: false,
            };
        }

        return config;
    },

    typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === 'development',
    },

    eslint: {
        ignoreDuringBuilds: process.env.NODE_ENV === 'development',
    },

    images: {
        unoptimized: process.env.NODE_ENV === 'development',
    },

    output: 'standalone',
    poweredByHeader: false,
};

export default nextConfig;
