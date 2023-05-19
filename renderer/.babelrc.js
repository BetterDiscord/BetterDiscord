const path = require("path");

module.exports = {
    presets: [
        "@babel/react",
        ["@babel/env",
        {
            targets: {
                node: "14.16.0",
                chrome: "91"
            }
        }]
    ],
    plugins: [[
        "module-resolver",
        {
            alias: {
                "builtins": "./src/builtins/builtins.js",
                "data": "./src/data/data.js",
                "@modules": path.join(__dirname, "src", "modules"),
                "@common": path.join(__dirname, "..", "common"),
            }
        }
    ]]
}