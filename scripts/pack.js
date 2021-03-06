const fs = require("fs");
const path = require("path");
const asar = require("asar");

const doSanityChecks = require("./validate");
const buildPackage = require("./package");

const dist = path.join(__dirname, "..", "dist");
const bundleFile = path.join(dist, "betterdiscord.asar");

const cleanOldAsar = function() {
    console.log("");
    console.log("Ensuring clean build");
    if (!fs.existsSync(bundleFile)) return console.log("    ✅ Nothing to clean up");
    fs.unlinkSync(bundleFile);
    console.log(`    ✅ Removed old bundle ${bundleFile}`);
};

const makeBundle = function() {
    console.log("");
    console.log("Generating bundle");
    asar.createPackage(dist, bundleFile).then(() => {
        console.log(`    ✅ Successfully created bundle ${bundleFile}`);
    }).catch(err => {
        console.log(`    ❌ Could not build bundle: ${err.message}`);
    });
};

doSanityChecks(dist);
buildPackage(dist);
cleanOldAsar();
makeBundle();