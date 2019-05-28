const path = require("path");
const webpack = require("webpack");

module.exports = env => {
  return {
    mode: "development",
    target: "node",
    devtool: "none",
    entry: "./src/index.js",
    output: {
      filename: "release.js",
      path: path.resolve(__dirname, "js"),
      library: "Core",
      libraryTarget: "var",
      libraryExport: "default"
    },
    externals: {
      electron: `require("electron")`,
      fs: `require("fs")`,
      path: `require("path")`,
      request: `require("request")`
    },
    resolve: {
      extensions: [".js"],
      modules: [
        path.resolve("src", "modules"),
        path.resolve("src", "structs"),
        path.resolve("src", "ui")
      ]
    }
  };
};