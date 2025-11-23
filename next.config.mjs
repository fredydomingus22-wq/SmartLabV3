/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Disable ESLint during builds to avoid deprecated configuration errors
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
