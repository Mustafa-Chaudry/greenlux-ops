import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://images.unsplash.com https://commons.wikimedia.org https://upload.wikimedia.org https://*.supabase.co",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "font-src 'self' data:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "object-src 'none'",
        ].join("; "),
      },
    ];
    return [
      ...["/admin/:path*", "/auth/:path*", "/dashboard/:path*", "/design-preview/:path*"].map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      })),
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/westridge-1-location",
        destination: "/guides/westridge-rawalpindi",
        permanent: true,
      },
      {
        source: "/westridge-1-location/",
        destination: "/guides/westridge-rawalpindi",
        permanent: true,
      },
      {
        source: "/convenient-accommodation-near-top-hospitals-in-rawalpindi",
        destination: "/guides/nearby-hospitals",
        permanent: true,
      },
      {
        source: "/convenient-accommodation-near-top-hospitals-in-rawalpindi/",
        destination: "/guides/nearby-hospitals",
        permanent: true,
      },
      {
        source: "/discover-the-beauty-of-race-course-park-in-rawalpindi",
        destination: "/guides/parks-nearby",
        permanent: true,
      },
      {
        source: "/discover-the-beauty-of-race-course-park-in-rawalpindi/",
        destination: "/guides/parks-nearby",
        permanent: true,
      },
      {
        source: "/discover-the-best-food-chains-in-westridge-1-rawalpindi",
        destination: "/guides/food-nearby",
        permanent: true,
      },
      {
        source: "/discover-the-best-food-chains-in-westridge-1-rawalpindi/",
        destination: "/guides/food-nearby",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/about-us/",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/blogs",
        destination: "/guides",
        permanent: true,
      },
      {
        source: "/blogs/",
        destination: "/guides",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/guides",
        permanent: true,
      },
      {
        source: "/blog/",
        destination: "/guides",
        permanent: true,
      },
      {
        source: "/faqs",
        destination: "/#faq",
        permanent: true,
      },
      {
        source: "/faqs/",
        destination: "/#faq",
        permanent: true,
      },
      {
        source: "/faq",
        destination: "/#faq",
        permanent: true,
      },
      {
        source: "/faq/",
        destination: "/#faq",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/contact-us/",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/apartment/studio-1",
        destination: "/rooms/studio-1",
        permanent: true,
      },
      {
        source: "/apartment/studio-1/",
        destination: "/rooms/studio-1",
        permanent: true,
      },
      {
        source: "/apartment/studio-2",
        destination: "/rooms/studio-2",
        permanent: true,
      },
      {
        source: "/apartment/studio-2/",
        destination: "/rooms/studio-2",
        permanent: true,
      },
      {
        source: "/apartment/apartment-3",
        destination: "/rooms/apartment-3",
        permanent: true,
      },
      {
        source: "/apartment/apartment-3/",
        destination: "/rooms/apartment-3",
        permanent: true,
      },
      {
        source: "/apartment/apartment-4",
        destination: "/rooms/apartment-4",
        permanent: true,
      },
      {
        source: "/apartment/apartment-4/",
        destination: "/rooms/apartment-4",
        permanent: true,
      },
      {
        source: "/apartment/room-5",
        destination: "/rooms/room-5",
        permanent: true,
      },
      {
        source: "/apartment/room-5/",
        destination: "/rooms/room-5",
        permanent: true,
      },
      {
        source: "/apartment/room-7",
        destination: "/rooms/room-7",
        permanent: true,
      },
      {
        source: "/apartment/room-7/",
        destination: "/rooms/room-7",
        permanent: true,
      },
      {
        source: "/apartment/room-6",
        destination: "/rooms/room-6",
        permanent: true,
      },
      {
        source: "/apartment/room-6/",
        destination: "/rooms/room-6",
        permanent: true,
      },
      {
        source: "/apartment/special-need-room",
        destination: "/rooms/room-10",
        permanent: true,
      },
      {
        source: "/apartment/special-need-room/",
        destination: "/rooms/room-10",
        permanent: true,
      },
      {
        source: "/apartment/room-11",
        destination: "/rooms/room-9",
        permanent: true,
      },
      {
        source: "/apartment/room-11/",
        destination: "/rooms/room-9",
        permanent: true,
      },
      {
        source: "/apartment/room-13",
        destination: "/rooms/budget-room-11",
        permanent: true,
      },
      {
        source: "/apartment/room-13/",
        destination: "/rooms/budget-room-11",
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
