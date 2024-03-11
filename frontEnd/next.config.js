/** @type {import('next').NextConfig} */
const nextConfig = {}

Object.prototype.hasOwnProperty, Object.prototype.toString, Object.defineProperty, Object.getOwnPropertyDescriptor
module.exports = nextConfig
module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      loader: 'file-loader',
      options: {
        publicPath: '/_next',
        name: 'static/media/[name].[hash].[ext]',
      },
    });

    return config;
  },
};