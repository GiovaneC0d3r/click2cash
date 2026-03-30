import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/products/**',
      },
      // Adicione também para 127.0.0.1 caso o navegador resolva assim
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/products/**',
      },
    ],
    unoptimized: true,
  },
  /* config options here */
};

export default nextConfig;
