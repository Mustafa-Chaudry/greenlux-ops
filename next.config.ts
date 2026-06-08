import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/westridge-1-location",
        destination: "/guides/westridge-rawalpindi",
        permanent: true,
      },
      {
        source: "/convenient-accommodation-near-top-hospitals-in-rawalpindi",
        destination: "/guides/nearby-hospitals",
        permanent: true,
      },
      {
        source: "/discover-the-beauty-of-race-course-park-in-rawalpindi",
        destination: "/guides/parks-nearby",
        permanent: true,
      },
      {
        source: "/discover-the-best-food-chains-in-westridge-1-rawalpindi",
        destination: "/guides/food-nearby",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
};

export default nextConfig;
