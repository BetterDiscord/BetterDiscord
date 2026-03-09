import fs from "fs";
import path from "path";
import bun from "bun";
import asar from "@electron/asar";
import {styleText as c} from "node:util";

import doSanityChecks from "./helpers/validate";
import buildPackage from "./helpers/package";
import copyFiles from "./helpers/copy";

const args = process.argv.slice(2); // Slice to ignore 'bun' and 'inject.ts'
if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(0);
}

function includesIgnoreCase(arr: string[], target: string): boolean {
    target = target.toLowerCase();
    return arr.some((el) => el.toLowerCase() === target);
}

const useBdRelease = includesIgnoreCase(args, "release");
const isSimple = includesIgnoreCase(args, "simple");

const release = includesIgnoreCase(args, "canary") ? "Discord Canary" : includesIgnoreCase(args, "ptb") ? "Discord PTB" : "Discord";
const flatpak = includesIgnoreCase(args, "flatpak");
const opt = includesIgnoreCase(args, "opt"); // pacman puts it into /opt, yay does it in the debian way
const bdPath = useBdRelease ? path.resolve(__dirname, "..", "dist", "betterdiscord.asar") : path.resolve(__dirname, "..", "dist");

function showHelp(): void {
    const discordRelease = ["canary", "ptb"].map((v) => c(["yellow", "bold"], v)).join("|");
    console.log(`
${c("bold", `Usage: bun inject.ts [${c(["cyan"], "options")}]`)}

${c("bold", "Options:")}
  ${c(["blue", "bold"], "release")}              Build and inject the production asar (dist/betterdiscord.asar)
                       If omitted, injects the development folder (dist/)
  ${discordRelease}           Inject into Discord Canary or Discord PTB
  ${c(["cyan", "bold"], "flatpak")}              Configure for Flatpak Discord installation
  ${c(["cyan", "bold"], "opt")}                  Use /opt directory for Linux installations (Arch/pacman)
  ${c(["cyan", "bold"], "simple")}               Skip app.asar patching (only write index.js)
  ${c(["cyan", "bold"], "-h, --help")}           Show this help message

${c("bold", "Examples:")}
  ${c("bold", c("magenta", "bun inject.ts") + " canary")}
  ${c("bold", c("magenta", "bun inject.ts") + " release canary")}
  ${c("bold", c("magenta", "bun inject.ts") + " release ptb flatpak")}
    `);
}

/**
 * Represents the directory paths for a specific Discord version.
 *
 * Discord can have multiple installed versions (e.g., 0.0.130, 0.0.131),
 * and this type contains the paths for a single version entry.
 */
type PathsEntry = {
    /**
     * Discord's root application installation directory.
     *
     * Examples:
     * - **Debian/Ubuntu (`.deb`)**: `/usr/share/discord`
     * - **Flatpak**: `/var/lib/flatpak/app/com.discordapp.Discord/current/active/files/discord`
     * - **Windows**: `C:\Users\<user>\AppData\Local\Discord`
     * - **macOS**: `/Applications/Discord.app/Contents`
     */
    discordBaseDir: string;

    /**
     * Discord's user configuration directory where caches and settings are stored.
     *
     * The `discord_desktop_core` module is located within this directory structure.
     *
     * Examples:
     * - **Linux**: `~/.config/discord`
     * - **Windows**: `%LOCALAPPDATA%\Discord`
     * - **macOS**: `~/Library/Application Support/discord`
     */
    discordDir: string;

    /**
     * Full path to the `discord_desktop_core` module directory.
     *
     * This is where the core Discord application logic resides. May be `undefined`
     * if Discord is in the process of updating or hasn't fully initialized this version yet.
     *
     * Empty when Discord hasn't prepared the directory for this version.
     */
    discord_desktop_core: string;

    /**
     * The semantic version string of this Discord installation (e.g., "0.0.130").
     */
    version: string;
};

/**
 * Array of `PathsEntry` objects representing all installed Discord versions
 * on the current system, typically sorted from oldest to newest.
 */
type Paths = PathsEntry[];

async function getDiscordPaths(releaseName: string): Promise<Paths> {
    const paths: PathsEntry = {
        discordDir: "",
        discordBaseDir: "",
        discord_desktop_core: "",
        version: "",
    };
    const versions: PathsEntry[] = [];

    let syncBaseDirAndDir = false;
    if (process.platform === "win32") {
        paths.discordDir = path.join(process.env.LOCALAPPDATA!, releaseName.replace(/ /g, ""));
        syncBaseDirAndDir = true;
    }
    else if (process.env.WSL_DISTRO_NAME) {
        const appdata = (await bun.$`wslpath "$(cmd.exe /c "echo %LOCALAPPDATA%" 2>/dev/null | tr -d '\r')"`.text()).trim();
        paths.discordDir = path.join(appdata, releaseName.replace(/ /g, ""));
        syncBaseDirAndDir = true;
    }
    else {
        const releaseNameLower = releaseName.toLowerCase();
        const releaseNameLowerNoSpaces = releaseNameLower.replace(" ", "");
        const releaseNameLowerSnake = releaseNameLower.replace(" ", "-");
        if (flatpak) {
            paths.discordDir = path.posix.join(process.env.HOME!, ".var", "app", "com.discordapp.Discord", "config", releaseNameLowerNoSpaces);
            paths.discordBaseDir = "/var/lib/flatpak/app/com.discordapp.Discord/current/active/files/" + releaseNameLowerSnake;
        }
        else if (process.platform === "darwin") {
            const configDir = path.posix.join(process.env.HOME!, "Library", "Application Support");
            paths.discordDir = path.posix.join(configDir, releaseNameLowerNoSpaces);
            paths.discordBaseDir = "applications/" + release + ".app/contents";
        }
        else {
            const configDir = process.env.XDG_CONFIG_HOME || path.posix.join(process.env.HOME!, ".config");
            paths.discordDir = path.join(configDir, releaseNameLowerNoSpaces);
            syncBaseDirAndDir = !opt;
            if (opt) {
                paths.discordBaseDir = path.join("/opt", releaseNameLowerNoSpaces);
            }
        }
    }

    // 2. Find the version and core module path
    const appDirs = fs.readdirSync(paths.discordDir)
        .filter(f => fs.lstatSync(path.join(paths.discordDir, f)).isDirectory() && f.includes("."))
        .sort();

    if (appDirs.length === 0) {
        throw new Error(`No versions found: ${paths.discordDir}`);
    }

    for (const ver of appDirs) {
        const pathsv: PathsEntry = {...paths, version: ver};
        pathsv.discordDir = path.join(pathsv.discordDir, ver);
        if (syncBaseDirAndDir) {
            pathsv.discordBaseDir = pathsv.discordDir;
        }
        pathsv.discord_desktop_core = getDiscord_desktop_core(pathsv.discordDir);
        versions.push(pathsv);
    }

    return versions;
}

function getDiscord_desktop_core(discordDir: string): string {
    const corename = "discord_desktop_core";
    const paths: string[] = [];
    const modulesPath = path.join(discordDir, "modules");
    paths.push(modulesPath);

    // Handle variations in folder naming (especially on Windows/WSL)
    try {
        const coreWrap = fs.readdirSync(modulesPath).find(e => e.startsWith(corename + "-"));
        if (coreWrap) paths.push(coreWrap);
    }
    catch {
        return "";
    }

    paths.push(corename);

    return path.join(...paths);
}

doSanityChecks(bdPath);
buildPackage(bdPath);

const asarBase = "app.asar";
async function patchAppAsar(resources: string): Promise<void> {
    const appAsarPath = path.join(resources, asarBase);

    const tempUnpackPath = path.join(resources, "app-unpacked-temp");
    fs.rmSync(tempUnpackPath, {force: true, recursive: true});

    const isAppAsarPatched = fs.readFileSync(appAsarPath, "utf8").includes("scheme: \"bd\"");

    // Only patch if not already patched
    if (!isAppAsarPatched) {
        { // create backup
            const appAsarBakPath = path.join(resources, `${asarBase}.bd.bak`);
            try {await fs.promises.copyFile(appAsarPath, appAsarBakPath, fs.constants.COPYFILE_EXCL);}
            catch {/* do not recopy */};
        }
        console.log(`    📦  Extracting ${asarBase}...`);
        asar.extractAll(appAsarPath, tempUnpackPath);
        let targetFile = path.join(tempUnpackPath, "app_bootstrap", "protocols.js");
        if (!fs.existsSync(targetFile)) {
            targetFile = path.join(tempUnpackPath, "bundle.js");
            if (!fs.existsSync(targetFile)) {
                throw new Error(`Cannot find resource file for ${release} at ${targetFile}`);
            }
        }
        console.log(`    🔨  Patching ${asarBase} at ${targetFile}...`);
        { // add new bd protocol
            const appAsarContent = fs.readFileSync(targetFile, "utf8");
            const patchedContent = appAsarContent.replace(
                /(protocol\.registerSchemesAsPrivileged\(\s*\[)(\s*{\s*scheme:\s*DISCORD_CLIP_PROTOCOL)/,
                `$1{scheme: "bd", privileges: {standard: true, secure: true, supportFetchAPI: true},},$2`
            );

            fs.writeFileSync(targetFile, patchedContent);
        }

        // repack app.asar
        await asar.createPackage(tempUnpackPath, appAsarPath);
        console.log(`    ✅ Patched ${targetFile} in ${asarBase}`);
    }
    else {
        console.log(`    ℹ️  Can't patch ${asarBase}, it's already patched.`);
    }
    fs.rmSync(tempUnpackPath, {force: true, recursive: true});
}

async function patchCore(discord_desktop_core: string): Promise<void> {
    const indexJs = path.join(discord_desktop_core, "index.js");
    if (fs.existsSync(indexJs)) fs.unlinkSync(indexJs);

    const injectionCode = process.env.WSL_DISTRO_NAME
        ? (copyFiles(bdPath, path.join(discord_desktop_core, "betterdiscord")), `require("./betterdiscord");\nmodule.exports = require("./core.asar");`)
        : `require("${bdPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");\nmodule.exports = require("./core.asar");`;

    fs.writeFileSync(indexJs, injectionCode);
    console.log("    ✅ Wrote index.js\n");
}

const prepared = await getDiscordPaths(release);
const rev = prepared.toReversed();
let potentialInjectionWipe = false;
for (const [i, discordPaths] of rev.entries()) {
    const isLatest = i === prepared.length - 1;
    const {discordDir, discordBaseDir, discord_desktop_core, version} = discordPaths;


    console.log(`\nInjecting into ${release} (${version})`);
    console.log(`    Base Dir: '${discordBaseDir}'`);
    console.log(`    Dir: '${discordDir}'`);
    console.log(`    discord_desktop_core: '${discord_desktop_core}'`);

    const resources = path.join(discordBaseDir, "resources");
    if (!fs.existsSync(resources)) {
        throw new Error(`Cannot find directory for ${release} at ${resources}`);
    }

    const appAsarPath = path.join(resources, asarBase);
    if (!fs.existsSync(appAsarPath)) {
        throw new Error(`Cannot find ${asarBase} for ${release} at ${appAsarPath}`);
    }
    console.log(`    appAsarPath: '${appAsarPath}'`);

    if (!discord_desktop_core) {
        if (!isLatest) {
            console.log(`    ⏭️ It's a pending update directory. Skipped.`);
            potentialInjectionWipe = true;
            continue;
        }
        throw new Error(`Cannot find discord_desktop_core for ${release} at ${discord_desktop_core}`);
    }

    // protocols.js (or bundle.js for canary)
    if (!isSimple) {
        await patchAppAsar(resources);
    }
    else {
        console.log(`    ℹ️  Skipping ${asarBase} patching.`);
    }

    // index.js
    await patchCore(discord_desktop_core);

    // exec flatpak patch override here
    if (flatpak) {
        console.log("    🔒 Setting Flatpak filesystem overrides...");
        await bun.$`flatpak override --filesystem=host com.discordapp.Discord`;
    }
    console.log(`Injection successful, please restart ${release} (${version}).`);
    if (potentialInjectionWipe) {
        console.log(`    ⚠️ Your injection may be wiped out by the pending update.`);
        console.log(`    The update: ${prepared.map(({version: v}) => v).join(" -> ")}`);
    }
    break;
}
