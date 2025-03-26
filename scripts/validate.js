const fs = require("fs");
const path = require("path");

module.exports = (dist) => {
    console.log("");
    console.log("Ensuring build validity");
    const files = [
        path.join(dist, "main.js"),
        path.join(dist, "preload.js"),
        path.join(dist, "betterdiscord.js"),
    ];

    for (const file of files) {
        const exists = fs.existsSync(file);
        if (!exists) throw new Error(`    ❌ File missing: ${file}`);
        console.log(`    ✅ Found ${file}`);
    }
};
