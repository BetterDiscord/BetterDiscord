const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "development",
  target: "node",
  devtool: "eval-source-map",
  entry: "./src/index.js",
  output: {
    filename: "remote.js",
    path: path.resolve(__dirname, "dist")
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
      builtins$: path.resolve("src", "modules")
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
                  node: "10.11.0",
                  chrome: "69"
              }
          }], "@babel/react"]
        }
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