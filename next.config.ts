import type { NextConfig } from "next";

const imageKitRemotePattern = process.env.IMAGEKIT_URL_ENDPOINT
  ? new URL(`${process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/+$/, "")}/**`)
  : null;

const tunnelOrigins = [
  "*.trycloudflare.com",
  "*.ngrok-free.dev",
  "*.ngrok-free.app",
  "*.ngrok.io",
  "*.ngrok.app",
];

const nextConfig: NextConfig = {
  allowedDevOrigins: tunnelOrigins,
  experimental: {
    serverActions: {
      // 5 photos x 5MB, plus multipart overhead and the remaining form fields.
      bodySizeLimit: "30mb",
      allowedOrigins: tunnelOrigins,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
      ...(imageKitRemotePattern ? [imageKitRemotePattern] : []),
    ],
  },
};

export default nextConfig;
