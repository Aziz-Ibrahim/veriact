// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  // Enable larger file uploads for audio/video
  experimental: {
    // Increase body size limit for API routes (500MB for Pro users)
    bodySizeLimit: '500mb',
  },
  // Server configuration for handling large uploads
  serverRuntimeConfig: {
    maxUploadSize: 500 * 1024 * 1024, // 500MB
  },
}

module.exports = nextConfig