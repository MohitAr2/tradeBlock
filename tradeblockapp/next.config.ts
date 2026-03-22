/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow balldontlie API calls from server-side routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;