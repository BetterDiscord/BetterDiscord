const fs = require("fs");
const path = require("path");

module.exports = function(dist) {
    console.log("");
    console.log("Ensuring build validity");
    const files = [
        path.join(dist, "injector.js"),
        path.join(dist, "preload.js"),
        path.join(dist, "renderer.js")
    ];

    for (const file of files) {
        const exists = fs.existsSync(file);
        if (!exists) throw new Error(`    ❌ File missing: ${file}`);
        console.log(`    ✅ Found ${file}`);
    }
};