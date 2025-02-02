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
                "@assets": path.join(__dirname, "assets"),
                "@common": path.join(__dirname, "src", "common"),

                "@builtins": path.join(__dirname, "src", "betterdiscord", "builtins"),
                "@data": path.join(__dirname, "src", "betterdiscord", "data"),
                "@modules": path.join(__dirname, "src", "betterdiscord", "modules"),
                "@polyfill": path.join(__dirname, "src", "betterdiscord", "polyfill"),
                "@structs": path.join(__dirname, "src", "betterdiscord", "structs"),
                "@styles": path.join(__dirname, "src", "betterdiscord", "styles"),
                "@ui": path.join(__dirname, "src", "betterdiscord", "ui"),
            }
        }
    ]]
}