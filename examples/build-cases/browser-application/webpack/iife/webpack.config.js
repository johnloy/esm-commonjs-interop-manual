const { readFileSync } = require('fs');
const globby = require('globby');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ResourceHintsWebpackPlugin = require('resource-hints-webpack-plugin');
const util = require('util');

const APP_DIR = path.resolve(__dirname, 'src');

const getHtmlPluginConfig = () => {
  const htmlFiles = globby.sync('**/*.html', { cwd: APP_DIR });

  return htmlFiles.map((filePath) => {
    const pageChunk = path.dirname(filePath).replace('.', 'home');
    return new HtmlWebpackPlugin({
      filename: filePath,
      template: filePath,
      chunks: [`${pageChunk}-page`],
      preload: ['commons.js', 'vendor.js'],
      inject: 'body',
    });
  });

  return htmlFiles;
};

module.exports = function (env, argv) {
  return {
    mode: 'development',
    context: APP_DIR,
    entry: () => {
      return {
        'home-page': './index.js',
        'about-page': './about/about.js',
      };
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      clean: true,
    },
    optimization: {
      usedExports: true,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          commons: {
            test(module) {
              return !module.resource.includes('/node_modules/')
            },
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            minSize: 1,
          },
          vendor: {
            test: /\/node_modules\//,
            name: 'vendor',
            chunks: 'all',
            minChunks: 2,
            minSize: 1,
          },
        },
      },
    },
    devtool: false,
    plugins: [...getHtmlPluginConfig()],
  };
};
