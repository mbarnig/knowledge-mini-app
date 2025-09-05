/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: false,  // évite les effets déclenchés 2× en dev
  experimental: {
    // si tu as des warnings "workspace root" : force la racine ici
    outputFileTracingRoot: __dirname
  }
};
module.exports = nextConfig;

