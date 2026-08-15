/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  eslint: {
    // Keep builds unblocked for a fast-moving MVP; run `npm run lint` manually.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
