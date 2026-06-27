import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // During development: serves at /admin
  // In production: full domain staff.northbridgemotors.co.nz mapped via Vercel
  // No structural changes needed between environments.
  
  experimental: {
    // Enable server actions (required for Auth.js v5 signIn/signOut)
    serverActions: {
      allowedOrigins: ["localhost:3000", "staff.northbridgemotors.co.nz"],
    },
  },
};

export default nextConfig;
