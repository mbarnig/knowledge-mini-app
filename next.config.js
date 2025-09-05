/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // static export mode
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: false,
  // ✅ moved here (not in experimental)
  outputFileTracingRoot: __dirname,
};
module.exports = nextConfig;

