const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const pluginConfig = [
  new HtmlWebpackPlugin({
    template: path.join(__dirname, 'assets', 'index.html'),
    favicon: path.join(__dirname, 'assets', 'favicon.png'),
  }),
  new CompressionPlugin({
    deleteOriginalAssets: true,
  }),
  new webpack.DefinePlugin({
    VERSION: JSON.stringify(require('./package.json').version),
  }),
];

const moduleConfig = {
  // exclude node_modules
  rules: [
    {
      test: /\.(js|jsx)$/, // <-- added `|jsx` here
      exclude: /node_modules/,
      use: ['babel-loader'],
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif)$/i,
      type: 'asset/resource',
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    },
  ],
};

const resolveConfig = {
  extensions: ['.*', '.js', '.jsx'], // <-- added `.jsx` here
};

const optimizationConfig = {
  splitChunks: {
    chunks: 'all',
    minSize: 0,
    cacheGroups: {
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        chunks: 'all',
      },
    },
  },
};

const viewer = {
  entry: ['./src/Viewer.js'],
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, '../server/webpack/viewer'),
  },
  plugins: pluginConfig,
  module: moduleConfig,
  resolve: resolveConfig,
  optimization: optimizationConfig,
};

const editor = {
  entry: ['regenerator-runtime/runtime.js', './src/Editor.js'],
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, '../server/webpack/editor'),
  },
  plugins: pluginConfig,
  module: moduleConfig,
  resolve: resolveConfig,
  optimization: optimizationConfig,
};

const app = {
  entry: ['./src/App.js'],
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, '../server/webpack/editor/app'),
  },
  plugins: pluginConfig,
  module: moduleConfig,
  resolve: resolveConfig,
  optimization: optimizationConfig,
};

module.exports = [editor, viewer, app];
module.exports.parallelism = 3;
