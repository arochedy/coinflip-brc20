/** @type {import('next').NextConfig} */
const nextConfig = {}

Object.prototype.hasOwnProperty,Object.prototype.toString,Object.defineProperty,Object.getOwnPropertyDescriptor
module.exports = nextConfig
module.exports = {
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