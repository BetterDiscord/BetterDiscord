const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => ({
  mode: "development",
  target: "node",
  devtool: argv.mode === "production" ? undefined : "eval-source-map",
  entry: "./src/index.js",
  output: {
    filename: "injector.js",
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
    mkdirp: `require("mkdirp")`,
    module: `require("module")`
  },
  resolve: {
    extensions: [".js"],
    alias: {
      common: path.resolve(__dirname, "..", "common")
    }
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      cwd: process.cwd(),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "preload.js"),
          to: path.resolve(__dirname, "..", "dist", "preload.js")
        },
      ],
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {drop_debugger: false},
          keep_classnames: true
        }
      })
    ]
  }
});