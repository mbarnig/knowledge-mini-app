/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // static export mode
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: false,
  // ✅ moved here (not in experimental)
  // outputFileTracingRoot: __dirname,
  
  // ✅ masque le badge “N” en dev
  devIndicators: {
    buildActivity: false,
    // (optionnel) si tu veux juste le déplacer au lieu de le cacher :
    // buildActivityPosition: 'bottom-right',
  },
};
module.exports = nextConfig;

