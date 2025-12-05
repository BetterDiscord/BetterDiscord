import fs from "fs";
import path from "path";


export default function (dist: string, target: string) {
    console.log("");
    console.log("Copying build to target directory");
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, {recursive: true});
        console.log(`    ✅ Created target directory: ${target}`);
    }
    if (!fs.existsSync(path.join(target, "editor"))) {
        fs.mkdirSync(path.join(target, "editor"), {recursive: true});
        console.log(`    ✅ Created target directory: ${path.join(target, "editor")}`);
    }
    const files = [
        path.join(dist, "main.js"),
        path.join(dist, "preload.js"),
        path.join(dist, "betterdiscord.js"),
        path.join(dist, "package.json"),
        path.join(dist, "editor", "preload.js"),
        path.join(dist, "editor", "script.js"),
        path.join(dist, "editor", "index.html"),
    ];

    for (const file of files) {
        const exists = fs.existsSync(file);
        if (!exists) throw new Error(`    ❌ File missing: ${file}`);
        fs.copyFileSync(file, path.join(target, path.relative(dist, file)));
        console.log(`    ✅ Copied ${file}`);
    }
};