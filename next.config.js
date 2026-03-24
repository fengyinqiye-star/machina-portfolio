const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  hideSourceMaps: true,
  webpack: {
    autoInstrumentServerFunctions: false,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
