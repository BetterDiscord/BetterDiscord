const path = require("path");
const webpack = require("webpack");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const basePkg = require("../package.json");

module.exports = {
  mode: "development",
  target: "node",
  devtool: false,
  entry: "./src/index.js",
  output: {
    filename: "renderer.js",
    path: path.resolve(__dirname, "..", "dist")
  },
  externals: {
    "electron": `require("electron")`,
    "fs": `require("fs")`,
    "original-fs": `require("original-fs")`,
    "path": `require("path")`,
    "request": `require("request")`,
    "events": `require("events")`,
    "rimraf": `require("rimraf")`,
    "yauzl": `require("yauzl")`,
    "mkdirp": `require("mkdirp")`
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      modules$: path.resolve("src", "modules"),
      data$: path.resolve("src", "modules"),
      builtins$: path.resolve("src", "modules"),
      common: path.resolve(__dirname, "..", "common")
    }
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.css$/i,
        use: [{loader: "css-loader", options: {"url": false, "import": false}}, "postcss-loader"],
      }
    ]
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      cwd: process.cwd(),
    }),
    new webpack.DefinePlugin({
      "process.env.__VERSION__": JSON.stringify(basePkg.version)
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {drop_debugger: false}
        }
      })
    ]
  }
};