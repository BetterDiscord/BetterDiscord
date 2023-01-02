const {build} = require("esbuild");
const {replace} = require("esbuild-plugin-replace");
const path = require("path");

const [mode, packagesToBuild] = process.argv.slice(2);
const isDevelopment = mode !== "prod";

const packages = packagesToBuild ? packagesToBuild.split(",") : ["packager", "injector", "preload", "client"];

const buildPackage = id => {
    const base = path.resolve(process.cwd(), "packages", id);

    /**@type {import("esbuild").BuildOptions} */
    const config = {
        entryPoints: [path.resolve(base, "src", "index.ts")],
        bundle: true,
        external: require("module").builtinModules.concat("electron"),
        outfile: path.resolve(base, "dist", "index.js"),
        format: id === "client" ? "iife" : "cjs",
        watch: isDevelopment,
        minify: !isDevelopment,
        plugins: [
            replace({
                "process.env.DEVELOPMENT": JSON.stringify(isDevelopment)
            })
        ],
        keepNames: true
    };

    return build(config);
};

const label = `Built ${packages.length} packages in`;

console.clear();
console.time(label);
Promise.all(packages.map(buildPackage))
    .then(() => {
        console.timeEnd(label);
    })
    .catch(err => {
        console.error("Build failed:", err);
    });
