/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    const internalApiUrl = process.env.INTERNAL_API_URL || (!isProd ? 'http://localhost:4000' : null);

    if (!internalApiUrl) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${internalApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
