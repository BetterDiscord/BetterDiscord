const path = require("path");

module.exports = {
  mode: "development",
  target: "node",
  devtool: "none",
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
    extensions: [".js"],
    modules: [
      path.resolve("src", "data"),
      path.resolve("src", "modules"),
      path.resolve("src", "ui")
    ]
  }
};