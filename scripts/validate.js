const fs = require("fs").promises;
const path = require("path");

module.exports = async function checkBuildValidity(dist) {
    console.log("Ensuring build validity");
    const files = [
        "injector.js",
        "preload.js",
        "renderer.js"
    ];

    for (const file of files) {
        const filePath = path.join(dist, file);
        try {
            await fs.access(filePath);
            console.log(`✅ Found ${filePath}`);
        } catch (error) {
            throw new Error(`❌ File missing: ${filePath}`);
        }
    }
};
