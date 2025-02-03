import path from "node:path";
import {fileURLToPath} from "node:url";

import styleLoader from "bun-style-loader";
import type {Target} from "bun";


const fileURL = fileURLToPath(import.meta.url);
const rootDir = path.join(path.dirname(fileURL), "..");
const isProduction = process.argv.includes("--minify");

type BuildConfig = Parameters<typeof Bun.build>[0];

interface BuildEntry {
    in: string;
    out: string;
    format: BuildConfig["format"];
    target: Target;
}

const moduleConfigs: Record<string, BuildEntry> = {
    betterdiscord: {in: "src/betterdiscord/index.js", out: "dist/betterdiscord.js", format: "cjs", target: "node"},
    main: {in: "src/electron/main/index.js", out: "dist/main.js", format: "cjs", target: "node"},
    preload: {in: "src/electron/preload/index.js", out: "dist/preload.js", format: "cjs", target: "node"},
};

let modulesRequested = process.argv.filter(a => a.startsWith("--module=")).map(a => a.replace("--module=", ""));
if (!modulesRequested.length) modulesRequested = Object.keys(moduleConfigs);

async function runBuild() {
    console.log("");
    for (const name of modulesRequested) {
        const before = performance.now();
        console.log(`Building ${name}...`);

        const config = moduleConfigs[name];
        await Bun.build({
            entrypoints: [path.join(rootDir, config.in)],
            naming: `${name}.[ext]`,
            outdir: path.join(rootDir, "dist"),
            format: config.format,
            external: ["fs", "original-fs", "path", "vm", "electron", "@electron/remote", "module", "request", "events", "child_process"],
            target: config.target,
            plugins: [styleLoader()],
            minify: isProduction,
            // sourcemap: isProduction ? "none" : "inline"
        });
        const after = performance.now();
        console.log(`Finished building ${name} in ${(after - before).toFixed(2)}ms`);
        console.log("");
    }
}

runBuild().catch(console.error);
