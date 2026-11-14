import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    // Pin the project root. Next otherwise walks UP for the nearest lockfile and,
    // in a shared multi-repo workspace, lands on a parent repo — Turbopack then
    // crawls and inotify-watches every sibling's node_modules.
    turbopack: { root: __dirname },
    // Every page is prerendered, so the markdown one level up is a build-time input
    // and never needs to be traced into the runtime image.
    outputFileTracingRoot: __dirname,
};

export default nextConfig;
