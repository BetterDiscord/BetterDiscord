import path from "path";
import {readCssUrl, writeCssUrl} from "./panel";
import type {ProbeVerdict, SavedValues} from "./values";
import type {ThemeSetting} from "./types";


/** The largest image a user can pick, in bytes. BD reads the whole file each time a theme with it starts. */
export const maxImageBytes = 20 * 1024 * 1024;

/** The link scheme a saved value uses for a copied image, as in `url("bd-image:3f2a9c1b04de.png")`. */
const imageScheme = "bd-image:";

export type ImageType = "png" | "jpg" | "gif" | "webp" | "avif" | "svg";

const mimeTypes: Record<ImageType, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml"
};

/**
 * The names BD gives its copies. Only these are read or deleted, so a hand-edited value such as
 * `bd-image:../../settings.json` can't reach outside the images folder.
 */
const namePattern = /^[0-9a-f]{12}\.(?:png|jpg|gif|webp|avif|svg)$/;

/** Why a file wasn't copied. */
export type CopyError = "notImage" | "tooLarge" | "unreadable";

export type CopyResult = {name: string;} | {error: CopyError;};

export interface ThemeImagesOptions {
    /** The folder that holds the copies. BD creates it on the first copy. */
    folder: string;

    /** Reads a whole file. Throws when it's missing or can't be read. */
    readFile(path: string): Uint8Array;
    writeFile(path: string, bytes: Uint8Array): void;
    deleteFile(path: string): void;

    /** The size of a file in bytes. Throws when it's missing. */
    fileSize(path: string): number;

    /** The file names in a folder, or an empty list when the folder doesn't exist. */
    listFiles(folder: string): string[];
    makeFolder(folder: string): void;

    createObjectURL(blob: Blob): string;
    revokeObjectURL(url: string): void;

    /** 12 random lowercase hex digits. */
    randomName(): string;
}

/**
 * Copies the images users pick for `<url>` settings into BD's data folder, and turns the copies into `blob:` URLs
 * for the page. A saved value names its copy with a `bd-image:` link, so the values store treats it like any
 * other link, and only the page write swaps it for the `blob:` URL.
 *
 * BD reads a copy the first time the page needs it and keeps its `blob:` URL until the theme stops or the copy
 * is deleted. After each save, `sweep` deletes every copy that no saved value names, which covers a reset, a new
 * pick and a deleted theme.
 */
export class ThemeImages {
    private options: ThemeImagesOptions;
    private urls = new Map<string, string>();

    constructor(options: ThemeImagesOptions) {
        this.options = options;
    }

    /** Checks a file the user picked and copies it under a new name. Nothing is copied when it's refused. */
    copy(source: string): CopyResult {
        let bytes: Uint8Array;
        try {
            if (this.options.fileSize(source) > maxImageBytes) return {error: "tooLarge"};
            bytes = this.options.readFile(source);
        }
        catch {
            return {error: "unreadable"};
        }

        // The file can grow between the two calls
        if (bytes.length > maxImageBytes) return {error: "tooLarge"};

        const type = detectImageType(bytes);
        if (!type) return {error: "notImage"};

        const name = `${this.options.randomName()}.${type}`;
        try {
            this.options.makeFolder(this.options.folder);
            this.options.writeFile(this.pathOf(name), bytes);
        }
        catch {
            return {error: "unreadable"};
        }

        this.urls.set(name, this.makeUrl(bytes, type));
        return {name};
    }

    /**
     * Copies a file the user picked and applies a link to the copy. The copy is discarded when `apply` refuses the
     * link, so nothing is left behind.
     *
     * @returns Why the file was refused, or null when it was copied.
     */
    pick(source: string, apply: (value: string) => string | null): CopyError | null {
        const result = this.copy(source);
        if ("error" in result) return result.error;
        if (apply(writeCssUrl(imageRef(result.name))) === null) this.discard(result.name);
        return null;
    }

    /** Deletes a copy that never got saved, such as one the theme refused. */
    discard(name: string) {
        if (!namePattern.test(name)) return;
        this.revoke(name);
        this.deleteCopy(name);
    }

    /** The `blob:` URL for a copy, read from disk the first time. Null when the copy is missing or unreadable. */
    urlFor(name: string): string | null {
        if (!namePattern.test(name)) return null;

        const known = this.urls.get(name);
        if (known) return known;

        let bytes: Uint8Array;
        try {
            bytes = this.options.readFile(this.pathOf(name));
        }
        catch {
            return null;
        }

        const url = this.makeUrl(bytes, extensionOf(name));
        this.urls.set(name, url);
        return url;
    }

    /**
     * Swaps each copied image in a theme's values for its `blob:` URL, for the page. A value whose copy is
     * missing is left out, so the page uses the setting's default.
     */
    resolve(values: Readonly<Record<string, string>>): Readonly<Record<string, string>> {
        const names = Object.values(values).map(readImageName);
        if (names.every(name => name === null)) return values;

        const resolved: Record<string, string> = {};
        Object.entries(values).forEach(([property, value], i) => {
            const name = names[i];
            if (name === null) {
                resolved[property] = value;
                return;
            }
            const url = this.urlFor(name);
            if (url) resolved[property] = `url("${url}")`;
        });
        return resolved;
    }

    /** Revokes the `blob:` URLs of a stopped theme's images. The copies stay. */
    release(values: Readonly<Record<string, string>>) {
        for (const value of Object.values(values)) {
            const name = readImageName(value);
            if (name) this.revoke(name);
        }
    }

    /** Deletes every copy that no saved value names. Files with names BD doesn't make are left alone. */
    sweep(saved: SavedValues) {
        const kept = new Set<string>();
        for (const values of Object.values(saved)) {
            for (const value of Object.values(values)) {
                const name = readImageName(value);
                if (name) kept.add(name);
            }
        }

        let files: string[];
        try {
            files = this.options.listFiles(this.options.folder);
        }
        catch {
            return;
        }

        for (const file of files) {
            if (!namePattern.test(file) || kept.has(file)) continue;
            this.revoke(file);
            this.deleteCopy(file);
        }
    }

    private makeUrl(bytes: Uint8Array, type: ImageType) {
        return this.options.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], {type: mimeTypes[type]}));
    }

    private revoke(name: string) {
        const url = this.urls.get(name);
        if (!url) return;
        this.urls.delete(name);
        this.options.revokeObjectURL(url);
    }

    private deleteCopy(name: string) {
        try {
            this.options.deleteFile(this.pathOf(name));
        }
        catch {
            // Already gone
        }
    }

    private pathOf(name: string) {
        return path.join(this.options.folder, name);
    }
}

/** The link a saved value uses for a copied image. */
export function imageRef(name: string) {
    return imageScheme + name;
}

/** The copy a value names, when it's one `url()` with a `bd-image:` link that BD could have made. */
export function readImageName(value: string): string | null {
    const link = readCssUrl(value);
    if (!link.startsWith(imageScheme)) return null;
    const name = link.slice(imageScheme.length);
    return namePattern.test(name) ? name : null;
}

/** Whether a value names a copied image, even one BD can't read, such as a hand-edited `bd-image:` link. */
export function isImageRef(value: string) {
    return readCssUrl(value).startsWith(imageScheme);
}

/**
 * What a `<url>` setting's control shows: the picked image, or the link field. The field says when the saved value
 * names a copy the page couldn't use, because the copy is missing.
 */
export type UrlSettingView =
    | {kind: "image"; name: string;}
    | {kind: "link"; isImageMissing: boolean;};

/** Works out a `<url>` control's view from the value the page uses and the saved value. */
export function describeUrlValue(applied: string, saved: string | undefined): UrlSettingView {
    const name = readImageName(applied);
    if (name) return {kind: "image", name};
    return {kind: "link", isImageMissing: saved !== undefined && saved !== applied && isImageRef(saved)};
}

/**
 * Probes values the way `probe` does, except that an image whose copy is missing or unreadable counts as
 * invalid, so the page keeps the setting's default. `onMissing` hears about each such value.
 */
export function probeWithImages(
    images: ThemeImages,
    entries: Array<[ThemeSetting, string]>,
    probe: (entries: Array<[ThemeSetting, string]>) => ProbeVerdict[],
    onMissing: (setting: ThemeSetting) => void
): ProbeVerdict[] {
    const isMissing = entries.map(([, value]) => {
        if (!isImageRef(value)) return false;
        const name = readImageName(value);
        return name === null || images.urlFor(name) === null;
    });

    const probed = probe(entries.filter((_, i) => !isMissing[i]));
    return entries.map(([setting], i) => {
        if (!isMissing[i]) return probed.shift()!;
        onMissing(setting);
        return "invalid";
    });
}

function extensionOf(name: string) {
    return name.slice(name.lastIndexOf(".") + 1) as ImageType;
}

/**
 * Tells an image's format from its first bytes instead of its extension. SVG is text, so it counts when its first
 * element is `<svg>`, after any XML declaration, comments and doctype.
 */
export function detectImageType(bytes: Uint8Array): ImageType | null {
    const startsWith = (offset: number, ...expected: number[]) => expected.every((byte, i) => bytes[offset + i] === byte);
    const ascii = (offset: number, length: number) => String.fromCharCode(...bytes.subarray(offset, offset + length));

    if (startsWith(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
    if (startsWith(0, 0xff, 0xd8, 0xff)) return "jpg";
    if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "gif";
    if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "webp";
    if (isAvif(bytes, ascii)) return "avif";
    if (isSvg(bytes)) return "svg";
    return null;
}

/** An AVIF starts with an `ftyp` box whose main or compatible brands include `avif` or `avis`. */
function isAvif(bytes: Uint8Array, ascii: (offset: number, length: number) => string) {
    if (bytes.length < 16 || ascii(4, 4) !== "ftyp") return false;

    const boxSize = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    const end = Math.min(boxSize, bytes.length);
    const brands = [ascii(8, 4)];
    for (let offset = 16; offset + 4 <= end; offset += 4) brands.push(ascii(offset, 4));
    return brands.includes("avif") || brands.includes("avis");
}

/** How much of a file the SVG check reads, which leaves room for a long comment or doctype before `<svg>`. */
const svgPrefixBytes = 64 * 1024;

function isSvg(bytes: Uint8Array) {
    // The decoder drops a leading byte order mark
    let text = new TextDecoder().decode(bytes.subarray(0, svgPrefixBytes));

    for (;;) {
        text = text.trimStart();
        const skip = [["<?", "?>"], ["<!--", "-->"]].find(([open]) => text.startsWith(open));
        if (skip) {
            const end = text.indexOf(skip[1]);
            if (end === -1) return false;
            text = text.slice(end + skip[1].length);
            continue;
        }
        if (/^<!doctype/i.test(text)) {
            // A doctype can hold an internal subset in brackets, which may contain `>`
            const match = /^<!doctype[^[>]*(?:\[[^]*?\])?\s*>/i.exec(text);
            if (!match) return false;
            text = text.slice(match[0].length);
            continue;
        }
        return /^<svg[\s>/]/.test(text);
    }
}
