/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/careerjet',
        destination: 'http://localhost:3001/api/careerjet',
      },
    ];
  },
  images: {
    domains: ['www.careerjet.co.in'],
  },
};

export default nextConfig;