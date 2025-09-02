/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  experimental: {
    // Enable standalone output for better containerization
    outputFileTracingRoot: undefined,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Image optimization
  images: {
    domains: ['localhost', 'propel2excel-points-system-backend.onrender.com'], // Updated with your actual backend domain
    unoptimized: false,
  },
};

export default nextConfig;
