/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // next/image refuses to render an image from any domain not listed
    // here — that's what silently broke the first Amazon Associates product
    // card (its image is on *.media-amazon.com, which wasn't allowed) and
    // would just as silently break the very next user-submitted debate too,
    // since /submit accepts an image URL from anywhere. Rather than
    // maintain a growing allowlist of every CDN a submitter or a product
    // link might use, this allows any https host — safe here because both
    // paths that accept an arbitrary URL (submissions, product cards) are
    // admin-authored or admin-approved before anything goes live; nothing
    // public writes directly to what gets rendered.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  eslint: {
    // Keep builds unblocked for a fast-moving MVP; run `npm run lint` manually.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
