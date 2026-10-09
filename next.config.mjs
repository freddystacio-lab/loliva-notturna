import path from "node:path";

/** @type {import('next').NextConfig} */
const config = {
  images: {
    formats: ["image/avif", "image/webp"],
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
