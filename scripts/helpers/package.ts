import fs from "fs";
import path from "path";


export default function (dist: string) {
    console.log("");
    console.log("Ensuring valid package.json");

    const pkgFile = path.join(dist, "package.json");
    if (fs.existsSync(pkgFile)) {
        const currentPkg = JSON.parse(fs.readFileSync(pkgFile).toString());
        if (currentPkg.name && currentPkg.main && currentPkg.main === "main.js") return console.log("    ✅ Existing package.json is valid");
        console.log("    ⚠️ Existing package.json is invalid");
    }
    fs.writeFileSync(pkgFile, JSON.stringify({name: "betterdiscord", main: "main.js"}));
    console.log("    ✅ Created new package.json");
};