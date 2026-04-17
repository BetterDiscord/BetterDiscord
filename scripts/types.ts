import tsconfig from "../tsconfig.json";
import {$} from "bun";
import {rollup} from "rollup";
import {dts} from "rollup-plugin-dts";
import {readFile, writeFile} from "node:fs/promises";

buildTypes();

async function buildTypes() {
    console.log("Generating declaration files...");
    await $`tsc -p ./declaration.tsconfig.json`;

    console.log("Bundling into bdapi.d.ts...");
    const bundle = await rollup({
        input: "./dist/declarations/src/betterdiscord/api/index.d.ts",
        plugins: [dts({
            compilerOptions: {
                baseUrl: "./dist/declarations",
                paths: tsconfig.compilerOptions.paths
            },
            includeExternal: ["clsx"]
        })]
    });

    await bundle.write({
        file: "./dist/bdapi.d.ts",
        format: "es"
    });

    await bundle.close();

    console.log("Finalizing bdapi.d.ts...");
    let content = await readFile("./dist/bdapi.d.ts", "utf-8");

    // Remove declarations and put everything in a namespace
    content = content.replaceAll("\r\n", "\n")
        .replace("\ndeclare const React$1: typeof react;", "")
        .replaceAll("React$1", "react")
        .replaceAll("\ndeclare ", "\n")
        .replace(/\nexport .+\n/, "");

    const insertAt = content.indexOf("\n", content.lastIndexOf("import")) + 2;
    const namespaces = "declare global {\nnamespace BetterDiscord {\n";
    const declaration = "\n\nconst BdApi: BetterDiscord.BdApi;\ninterface Window {\n    BdApi: BetterDiscord.BdApi;\n}";
    const header = "export {};\n\n";

    content = header + content.slice(0, insertAt) + namespaces + content.slice(insertAt + 1) + "\n}" + declaration + "\n}";

    await writeFile("./dist/bdapi.d.ts", content, "utf-8");
    console.log("Done!");
}