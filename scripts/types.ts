import {$} from "bun";
import {rollup} from "rollup";
import {dts} from "rollup-plugin-dts";

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
                paths: {
                    "@assets/*": ["./assets/*"],
                    "@common/*": ["./src/common/*"],
                    "@builtins/*": ["./src/betterdiscord/builtins/*"],
                    "@data/*": ["./src/betterdiscord/data/*"],
                    "@api/*": ["./src/betterdiscord/api/*"],
                    "@modules/*": ["./src/betterdiscord/modules/*"],
                    "@polyfill/*": ["./src/betterdiscord/polyfill/*"],
                    "@stores/*": ["./src/betterdiscord/stores/*"],
                    "@structs/*": ["./src/betterdiscord/structs/*"],
                    "@styles/*": ["./src/betterdiscord/styles/*"],
                    "@ui/*": ["./src/betterdiscord/ui/*"],
                    "@utils/*": ["./src/betterdiscord/utils/*"],
                    "@typed/*": ["./src/betterdiscord/types/*"],
                    "@webpack": ["./src/betterdiscord/webpack"]
                }
            },
            includeExternal: ["clsx"]
        })]
    });

    await bundle.write({
        file: "dist/bdapi.d.ts",
        format: "es"
    });

    await bundle.close();
    console.log("Done!");
}