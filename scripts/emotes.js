const path = require("path");
const asar = require("asar");

const emotes = path.resolve(__dirname, "..", "assets", "emotes");
const dist = path.resolve(__dirname, "..", "dist");
const bundleFile = path.join(dist, "emotes.asar");

const makeBundle = function() {
    console.log("");
    console.log("Generating bundle");
    asar.createPackage(emotes, bundleFile).then(() => {
        console.log(`    ✅ Successfully created bundle ${bundleFile}`);
    }).catch(err => {
        console.log(`    ❌ Could not build bundle: ${err.message}`);
    });
};

makeBundle();