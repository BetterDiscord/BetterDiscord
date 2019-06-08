const path = require("path");

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
      path.resolve("src", "modules"),
      path.resolve("src", "ui")
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
                node: "10.11.0",
                chrome: "69"
            }
        }], "@babel/react"]
        }
      }
    ]
  }
};