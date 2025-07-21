// next.config.mjs - SIMPLIFIED VERSION
/** @type {import('next').NextConfig} */

const nextConfig = {
    // ✅ FIXED: Always enable strict mode for consistency
    reactStrictMode: true,

    // ✅ FIXED: Enable type checking in development
    typescript: {
        ignoreBuildErrors: false, // Always check types
    },

    eslint: {
        ignoreDuringBuilds: false, // Always check linting
    },

    // ✅ FIXED: Enable image optimization
    images: {
        unoptimized: false,
    },

    // ✅ FIXED: Simplified webpack config
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            // Minimal dev optimizations
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },

    // ✅ Keep these for Docker
    output: 'standalone',
    poweredByHeader: false,

    // ✅ FIXED: Add experimental features that help with development
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
        },
    },

    // ✅ FIXED: Add proper redirects for development
    async redirects() {
        return [
            {
                source: '/chat',
                has: [
                    {
                        type: 'query',
                        key: 'debug',
                        value: 'true',
                    },
                ],
                destination: '/capture-context',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
