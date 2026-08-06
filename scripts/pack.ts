import path from "path";
import fs from "fs";
import crypto from "crypto";
import asar from "@electron/asar";

import doSanityChecks from "./helpers/validate";
import buildPackage from "./helpers/package";


const dist = path.resolve(__dirname, "..", "dist");
const bundleFile = path.join(dist, "betterdiscord.asar");
const checksumFile = path.join(dist, "checksum.txt");

const files = [
    "dist/main.js",
    "dist/package.json",
    "dist/preload.js",
    "dist/earlyRenderer.js",
    "dist/betterdiscord.js",
    "dist/editor/preload.js",
    "dist/editor/script.js",
    "dist/editor/index.html"
];

const makeHash = () => {
    try {
        const arr = Array<string>(files.length);

        for (let index = 0; index < files.length; index++) {
            const fp = files[index];

            const buffer = fs.readFileSync(fp);

            const sha256 = crypto.createHash("sha256").update(buffer).digest().toString("hex");

            arr[index] = `${sha256}  ${fp.slice(5)}`;
        }

        fs.writeFileSync(checksumFile, arr.join("\n"));
        console.log(`    ✅ Successfully created checksum ${checksumFile}`);
    }
    catch (err) {
        console.log(`    ❌ Could not create checksum: ${err instanceof Error ? err.message : String(err)}`);
    }
};

const makeBundle = function () {
    console.log("");
    console.log("Generating bundle");
    asar.createPackageFromFiles(dist, bundleFile, files).then(() => {
        console.log(`    ✅ Successfully created bundle ${bundleFile}`);
        makeHash();
    }).catch(err => {
        console.log(`    ❌ Could not build bundle: ${err.message}`);
    });
};

doSanityChecks(dist);
buildPackage(dist);
// cleanOldAsar();
makeBundle();