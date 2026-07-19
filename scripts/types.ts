import tsconfig from "../tsconfig.json";
import {$} from "bun";
import {rollup} from "rollup";
import {dts} from "rollup-plugin-dts";
import {readFile, writeFile, mkdir, copyFile, rm} from "node:fs/promises";
import {ModuleResolutionKind} from "typescript";

// Intermediate per-file declarations emitted by tsc (see declaration.tsconfig.json).
const declarationsDir = "./dist/declarations";
// Final publishable package directory (@betterdiscord/types).
const outDir = "./dist/types";
// Committed sources copied verbatim into the published package.
const packageDir = "./types";

await buildTypes();

async function buildTypes() {
    console.log("Generating declaration files...");
    await $`tsc -p ./declaration.tsconfig.json`;

    console.log("Bundling into index.d.ts...");
    const bundle = await rollup({
        input: `${declarationsDir}/src/betterdiscord/api/index.d.ts`,
        plugins: [dts({
            compilerOptions: {
                baseUrl: declarationsDir,
                moduleResolution: ModuleResolutionKind.Bundler,
                paths: tsconfig.compilerOptions.paths
            },
            includeExternal: ["clsx"]
        })]
    });

    await rm(outDir, {recursive: true, force: true});
    await mkdir(outDir, {recursive: true});
    await bundle.write({
        file: `${outDir}/index.d.ts`,
        format: "es"
    });

    await bundle.close();

    console.log("Finalizing index.d.ts...");
    let content = await readFile(`${outDir}/index.d.ts`, "utf-8");

    // Remove declarations and put everything in a namespace
    content = content.replaceAll("\r\n", "\n")
        .replace("\ndeclare const React$1: typeof react;", "")
        .replaceAll("React$1", "react")
        .replaceAll("\ndeclare ", "\n")
        .replace(/\nexport .+\n/, "");

    const insertAt = content.indexOf("\n", content.lastIndexOf("import")) + 1;
    const namespaces = "declare global {\nnamespace BetterDiscord {\n";
    const declaration = "\n\nconst BdApi: typeof BetterDiscord.BdApi;\ninterface Window {\n    BdApi: typeof BetterDiscord.BdApi;\n}";
    const header = "export {};\n\n";

    content = header + content.slice(0, insertAt) + namespaces + content.slice(insertAt + 1) + "\n}" + declaration + "\n}";

    await writeFile(`${outDir}/index.d.ts`, content, "utf-8");

    console.log("Assembling package...");
    await copyFile(`${packageDir}/package.json`, `${outDir}/package.json`);
    await copyFile(`${packageDir}/README.md`, `${outDir}/README.md`);
    await copyFile("./LICENSE", `${outDir}/LICENSE`);

    // The intermediate per-file declarations are no longer needed.
    await rm(declarationsDir, {recursive: true, force: true});

    console.log(`Done! Package ready in ${outDir}`);
}
