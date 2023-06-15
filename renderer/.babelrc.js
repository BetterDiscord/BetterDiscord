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
                "@assets": path.join(__dirname, "..", "assets"),
                "@common": path.join(__dirname, "..", "common"),

                "@builtins": path.join(__dirname, "src", "builtins"),
                "@data": path.join(__dirname, "src", "data"),
                "@modules": path.join(__dirname, "src", "modules"),
                "@polyfill": path.join(__dirname, "src", "polyfill"),
                "@structs": path.join(__dirname, "src", "structs"),
                "@styles": path.join(__dirname, "src", "styles"),
                "@ui": path.join(__dirname, "src", "ui"),
            }
        }
    ]]
}