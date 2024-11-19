/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // If you're using images
  images: {
    domains: [], // Add any image domains you're using
    unoptimized: true // For static exports if needed
  }
}

module.exports = nextConfig