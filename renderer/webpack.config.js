const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "development",
  target: "node",
  devtool: "eval-source-map",
  entry: "./src/index.js",
  output: {
    filename: "renderer.js",
    path: path.resolve(__dirname, "..", "dist")
  },
  externals: {
    electron: `require("electron")`,
    fs: `require("fs")`,
    path: `require("path")`,
    request: `require("request")`,
    events: `require("events")`,
    rimraf: `require("rimraf")`,
    yauzl: `require("yauzl")`,
    mkdirp: `require("mkdirp")`
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
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: [["@babel/env", {
              targets: {
                  node: "12.14.1",
                  chrome: "80"
              }
          }], "@babel/react"]
        }
      },
      {
        test: /\.css$/i,
        use: ["css-loader", "postcss-loader"],
      }
    ]
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      cwd: process.cwd(),
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