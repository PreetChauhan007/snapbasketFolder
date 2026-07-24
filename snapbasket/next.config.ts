import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // The repository has a parent folder; keep Turbopack scoped to this app
    // so it resolves this project's local Next.js installation.
    root: __dirname,
  },
  images:{
    remotePatterns:[
      {hostname:"lh3.googleusercontent.com"},
      {hostname:"res.cloudinary.com"}
    ]
  }
};

export default nextConfig;
