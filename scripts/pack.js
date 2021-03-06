const fs = require("fs");
const path = require("path");
const asar = require("asar");

const dist = path.join(__dirname, "..", "dist");
const bundleFile = path.join(dist, "betterdiscord.asar");

const doSanityChecks = function() {
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

const cleanOldAsar = function() {
    console.log("Ensuring clean build");
    if (!fs.existsSync(bundleFile)) return console.log("    ✅ Nothing to clean up");
    fs.unlinkSync(bundleFile);
    console.log(`    ✅ Removed old bundle ${bundleFile}`);
};

const buildPackage = function() {
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

const makeBundle = function() {
    console.log("Generating bundle");
    asar.createPackage(dist, bundleFile).then(() => {
        console.log(`    ✅ Successfully created bundle ${bundleFile}`);
    }).catch(err => {
        console.log(`    ❌ Could not build bundle: ${err.message}`);
    });
};

console.log("");
doSanityChecks();

console.log("");
cleanOldAsar();

console.log("");
buildPackage();

console.log("");
makeBundle();