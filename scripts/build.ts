import path from "node:path";
import {fileURLToPath} from "node:url";
import pkg from "../package.json";

import styleLoader from "bun-style-loader";
import * as esbuild from "esbuild";


const fileURL = fileURLToPath(import.meta.url);
const rootDir = path.join(path.dirname(fileURL), "..");
const isProduction = process.argv.includes("--minify");

interface EntryPoint {
    in: string;
    out: string;
}

const moduleConfigs: Record<string, EntryPoint> = {
    betterdiscord: {"in": "src/betterdiscord/index.js", "out": "betterdiscord"},
    main: {"in": "src/electron/main/index.js", "out": "main"},
    preload: {"in": "src/electron/preload/index.js", "out": "preload"},
};

let modulesRequested = process.argv.filter(a => a.startsWith("--module=")).map(a => a.replace("--module=", ""));
if (!modulesRequested.length) modulesRequested = Object.keys(moduleConfigs);

const entryPoints = modulesRequested.map(m => moduleConfigs[m]);

async function runBuild() {
    const before = performance.now();
    const names = modulesRequested.join(", ");

    console.log("");
    console.log(`Building ${names}...`);

    const ctx = await esbuild.context({
        entryPoints: entryPoints,
        bundle: true,
        outdir: path.join(rootDir, "dist"),
        format: "cjs",
        jsx: "transform",
        external: ["fs", "original-fs", "path", "vm", "electron", "@electron/remote", "module", "request", "events", "child_process", "net", "http", "https", "crypto", "os"],
        target: ["chrome128", "node20"],
        loader: {
            ".js": "jsx",
            ".css": "css"
        },
        plugins: [styleLoader() as unknown as esbuild.Plugin],
        logLevel: "info",
        treeShaking: true,
        charset: "utf8",
        minify: isProduction,
        define: {
            "process.env.__VERSION__": JSON.stringify(pkg.version)
        }
    });


    if (process.argv.includes("--watch")) {
        await ctx.watch();
    }
    else {
        await ctx.rebuild();
        await ctx.dispose(); 
    }
    
    const after = performance.now();
    console.log(`Finished building ${names} in ${(after - before).toFixed(2)}ms`);
    console.log("");
}

runBuild().catch(console.error);
