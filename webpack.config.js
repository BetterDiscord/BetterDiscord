const path = require("path");
const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = {
  mode: "development",
  target: "node",
  devtool: "eval-source-map",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "js"),
    library: "Core",
    libraryTarget: "var",
    libraryExport: "default"
  },
  externals: {
    electron: `require("electron")`,
    fs: `require("fs")`,
    path: `require("path")`,
    request: `require("request")`,
    events: `require("events")`
  },
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [
      path.resolve("src", "builtins"),
      path.resolve("src", "data"),
      path.resolve("src", "modules")
    ]
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
                node: "12.8.1",
                chrome: "78"
            }
        }], "@babel/react"]
        }
      }
    ]
  },
  plugins: [
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // add errors to webpack instead of warnings
      // failOnError: true,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    })
  ]

};