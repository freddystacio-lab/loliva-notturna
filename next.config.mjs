import path from "node:path";

/** @type {import('next').NextConfig} */
const securityHeaders = [
  {key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload"},
  {key: "X-Frame-Options", value: "DENY"},
  {key: "X-Content-Type-Options", value: "nosniff"},
  {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
  {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()"},
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; " +
      "img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; font-src 'self' data:; " +
      "form-action 'self'",
  },
];

const config = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{source: "/:path*", headers: securityHeaders}];
  },
  turbopack: {
    resolveAlias: {
      "next-intl/config": "./src/i18n/request.ts",
    },
  },
  webpack(webpackConfig) {
    webpackConfig.resolve.alias["next-intl/config"] = path.resolve(
      process.cwd(),
      "src/i18n/request.ts",
    );
    return webpackConfig;
  },
};

export default config;
