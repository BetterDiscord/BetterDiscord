const fs = require("fs");
const path = require("path");

module.exports = function(dist) {
    console.log("");
    console.log("Ensuring valid package.json");

    const pkgFile = path.join(dist, "package.json");
    if (fs.existsSync(pkgFile)) {
        const currentPkg = require(pkgFile);
        if (currentPkg.name && currentPkg.main && currentPkg.main === "injector.js") return console.log("    ✅ Existing package.json is valid");
        console.log("    ⚠️ Existing package.json is invalid");
    }
    fs.writeFileSync(pkgFile, JSON.stringify({name: "betterdiscord", main: "injector.js"}));
    console.log("    ✅ Created new package.json");
};