const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const controllerConfig = {
  entry: ["regenerator-runtime/runtime.js", "./src/app-index.js"],
  output: {
    filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "src/webpack/controller"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
      favicon: path.join(__dirname, "src/assets", "favicon.png"),
    }),
    new CleanWebpackPlugin(),
    new CompressionPlugin({
      deleteOriginalAssets: true,
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // <-- added `|jsx` here
        exclude: /node_modules/,
        use: ["babel-loader", "source-map-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".*", ".js", ".jsx"], // <-- added `.jsx` here
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 0,
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react",
          chunks: "all",
        },
      },
    },
  },
};

module.exports = [controllerConfig];
