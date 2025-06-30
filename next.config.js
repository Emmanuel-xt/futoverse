const path = require("path");
const process = require("process");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Only enable PWA in production
});

const pathBuilder = (subpath) => path.join(process.cwd(), subpath);

/** @type {import('next').NextConfig} */
const baseConfig = {
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: pathBuilder("node_modules/cesium/Build/Cesium/Workers"),
            to: "../public/cesium/Workers",
            info: { minimized: true },
          },
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: pathBuilder("node_modules/cesium/Build/Cesium/ThirdParty"),
            to: "../public/cesium/ThirdParty",
            info: { minimized: true },
          },
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: pathBuilder("node_modules/cesium/Build/Cesium/Assets"),
            to: "../public/cesium/Assets",
            info: { minimized: true },
          },
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: pathBuilder("node_modules/cesium/Build/Cesium/Widgets"),
            to: "../public/cesium/Widgets",
            info: { minimized: true },
          },
        ],
      }),
      new webpack.DefinePlugin({ CESIUM_BASE_URL: JSON.stringify("/cesium") })
    );

    // Add the rule for handling GLB/GLTF models
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            outputPath: "models",
            name: "[name].[ext]",
          },
        },
      ],
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  images: {
    domains: [
      "res.cloudinary.com",
      "randomuser.me",
      "lh3.googleusercontent.com",
    ],
  },
};

// Wrap your config with PWA support
module.exports = withPWA(baseConfig);
