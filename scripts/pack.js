const path = require("path");
const asar = require("asar");

const doSanityChecks = require("./validate");
const buildPackage = require("./package");

const dist = path.resolve(__dirname, "..", "dist");
const bundleFile = path.join(dist, "betterdiscord.asar");

const makeBundle = function() {
    console.log("");
    console.log("Generating bundle");
    asar.createPackageFromFiles(dist, bundleFile, ["dist/injector.js", "dist/package.json", "dist/preload.js", "dist/renderer.js"]).then(() => {
        console.log(`    ✅ Successfully created bundle ${bundleFile}`);
    }).catch(err => {
        console.log(`    ❌ Could not build bundle: ${err.message}`);
    });
};

doSanityChecks(dist);
buildPackage(dist);
// cleanOldAsar();
makeBundle();