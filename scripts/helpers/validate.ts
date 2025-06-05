import fs from "fs";
import path from "path";


export default function (dist: string) {
    console.log("");
    console.log("Ensuring build validity");
    const files = [
        path.join(dist, "main.js"),
        path.join(dist, "preload.js"),
        path.join(dist, "betterdiscord.js"),
        path.join(dist, "editor", "preload.js"),
        path.join(dist, "editor", "script.js"),
        path.join(dist, "editor", "index.html"),
    ];

    for (const file of files) {
        const exists = fs.existsSync(file);
        if (!exists) throw new Error(`    ❌ File missing: ${file}`);
        console.log(`    ✅ Found ${file}`);
    }
};