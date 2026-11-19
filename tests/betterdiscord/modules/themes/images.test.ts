import {describe, test, expect, beforeEach} from "bun:test";
import path from "path";
import {ThemeImages, describeUrlValue, detectImageType, imageRef, isImageRef, maxImageBytes, probeWithImages, readImageName} from "@modules/themes/images";
import {parseThemeSettings} from "@modules/themes/settings";
import type {ThemeSetting} from "@modules/themes/types";

const folder = path.join("data", "canary", "theme-images");

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (value: string) => new TextEncoder().encode(value);

const png = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13);
const jpg = bytes(0xff, 0xd8, 0xff, 0xe0, 0, 16);
const gif = text("GIF89a\x01\x00\x01\x00");
const webp = text("RIFF\x24\x00\x00\x00WEBPVP8 ");
const avif = bytes(0, 0, 0, 0x1c, ...text("ftypavif"), 0, 0, 0, 0, ...text("avifmif1miaf"));
const svg = text("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\"/>");

let files: Map<string, Uint8Array>;
let created: Blob[];
let revoked: string[];
let nextName: number;

function makeImages() {
    return new ThemeImages({
        folder,
        readFile: file => {
            const content = files.get(file);
            if (!content) throw new Error("ENOENT");
            return content;
        },
        writeFile: (file, content) => files.set(file, content),
        deleteFile: file => {
            if (!files.delete(file)) throw new Error("ENOENT");
        },
        fileSize: file => {
            const content = files.get(file);
            if (!content) throw new Error("ENOENT");
            return content.length;
        },
        listFiles: dir => [...files.keys()].filter(file => path.dirname(file) === dir).map(file => path.basename(file)),
        makeFolder: () => {},
        createObjectURL: blob => {
            created.push(blob);
            return `blob:test/${created.length}`;
        },
        revokeObjectURL: url => revoked.push(url),
        randomName: () => (nextName++).toString(16).padStart(12, "0")
    });
}

const inFolder = (name: string) => path.join(folder, name);

beforeEach(() => {
    files = new Map();
    created = [];
    revoked = [];
    nextName = 0xa1;
});

describe("detectImageType", () => {
    test("reads each binary format from its first bytes", () => {
        expect(detectImageType(png)).toBe("png");
        expect(detectImageType(jpg)).toBe("jpg");
        expect(detectImageType(gif)).toBe("gif");
        expect(detectImageType(text("GIF87a\x01\x00"))).toBe("gif");
        expect(detectImageType(webp)).toBe("webp");
        expect(detectImageType(avif)).toBe("avif");
    });

    test("finds AVIF among the compatible brands", () => {
        const file = bytes(0, 0, 0, 0x18, ...text("ftypmif1"), 0, 0, 0, 0, ...text("miafavif"));
        expect(detectImageType(file)).toBe("avif");
    });

    test("refuses other ftyp files, such as an MP4", () => {
        const mp4 = bytes(0, 0, 0, 0x18, ...text("ftypisom"), 0, 0, 2, 0, ...text("isomiso2"));
        expect(detectImageType(mp4)).toBeNull();
    });

    test("accepts an SVG after a byte order mark, an XML declaration, comments and a doctype", () => {
        const source = [
            "\uFEFF<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n",
            "<!-- Made with a > in the comment -->\n",
            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\" [ <!ENTITY a \">\"> ]>\n",
            "<svg viewBox=\"0 0 1 1\"></svg>"
        ].join("");
        expect(detectImageType(svg)).toBe("svg");
        expect(detectImageType(text(source))).toBe("svg");
    });

    test("refuses text that isn't an SVG", () => {
        expect(detectImageType(text("hello, this is a text file renamed to .png"))).toBeNull();
        expect(detectImageType(text("<html><svg></svg></html>"))).toBeNull();
        expect(detectImageType(text("<svgfoo>"))).toBeNull();
        expect(detectImageType(text("<!-- never closed <svg>"))).toBeNull();
    });

    test("refuses an empty or short file", () => {
        expect(detectImageType(bytes())).toBeNull();
        expect(detectImageType(bytes(0x89, 0x50))).toBeNull();
    });
});

describe("image references", () => {
    test("reads the copy's name from a url() in any form", () => {
        expect(readImageName("url(\"bd-image:0000000000a1.png\")")).toBe("0000000000a1.png");
        expect(readImageName("url(bd-image:0000000000a1.png)")).toBe("0000000000a1.png");
        expect(readImageName(" url( 'bd-image:0000000000a1.svg' ) ")).toBe("0000000000a1.svg");
    });

    test("ignores links and names BD doesn't make", () => {
        expect(readImageName("url(\"https://example.com/a.png\")")).toBeNull();
        expect(readImageName("none")).toBeNull();
        expect(readImageName("url(\"bd-image:../../settings.json\")")).toBeNull();
        expect(readImageName("url(\"bd-image:0000000000a1.exe\")")).toBeNull();
    });

    test("tells a hand-edited bd-image link apart from other links", () => {
        expect(isImageRef("url(\"bd-image:nope\")")).toBe(true);
        expect(isImageRef("url(\"https://example.com/a.png\")")).toBe(false);
    });

    test("builds the link that readImageName reads", () => {
        expect(readImageName(`url("${imageRef("0000000000a1.gif")}")`)).toBe("0000000000a1.gif");
    });
});

describe("ThemeImages", () => {
    test("copies a picked image under a generated name with the detected extension", () => {
        files.set("C:/Users/me/Pictures/wallpaper.jpeg", png);
        const images = makeImages();

        expect(images.copy("C:/Users/me/Pictures/wallpaper.jpeg")).toEqual({name: "0000000000a1.png"});
        expect(files.get(inFolder("0000000000a1.png"))).toBe(png);
        expect(created[0].type).toBe("image/png");
    });

    test("refuses a file that isn't an image and copies nothing", () => {
        files.set("notes.png", text("just some text"));
        expect(makeImages().copy("notes.png")).toEqual({error: "notImage"});
        expect(files.size).toBe(1);
    });

    test("refuses a file over the cap without reading it", () => {
        let reads = 0;
        const images = new ThemeImages({
            folder,
            readFile: () => {
                reads++;
                return png;
            },
            writeFile: () => {},
            deleteFile: () => {},
            fileSize: () => maxImageBytes + 1,
            listFiles: () => [],
            makeFolder: () => {},
            createObjectURL: () => "blob:test",
            revokeObjectURL: () => {},
            randomName: () => "0000000000a1"
        });

        expect(images.copy("huge.gif")).toEqual({error: "tooLarge"});
        expect(reads).toBe(0);
    });

    test("accepts a file at exactly the cap", () => {
        const big = new Uint8Array(maxImageBytes);
        big.set(png);
        files.set("big.png", big);
        expect(makeImages().copy("big.png")).toEqual({name: "0000000000a1.png"});
    });

    test("reports a file that can't be read", () => {
        expect(makeImages().copy("missing.png")).toEqual({error: "unreadable"});
    });

    test("reuses the blob URL made by the copy", () => {
        files.set("a.png", png);
        const images = makeImages();
        images.copy("a.png");

        expect(images.urlFor("0000000000a1.png")).toBe("blob:test/1");
        expect(created).toHaveLength(1);
    });

    test("reads a copy once and keeps its URL", () => {
        files.set(inFolder("0000000000a1.gif"), gif);
        const images = makeImages();

        expect(images.urlFor("0000000000a1.gif")).toBe("blob:test/1");
        expect(images.urlFor("0000000000a1.gif")).toBe("blob:test/1");
        expect(created).toHaveLength(1);
        expect(created[0].type).toBe("image/gif");
    });

    test("gives no URL for a missing copy or a name BD doesn't make", () => {
        files.set(path.join("data", "canary", "settings.json"), text("{}"));
        const images = makeImages();

        expect(images.urlFor("0000000000a1.png")).toBeNull();
        expect(images.urlFor("../settings.json")).toBeNull();
        expect(created).toHaveLength(0);
    });

    test("swaps image references for blob URLs and leaves other values as they are", () => {
        files.set(inFolder("0000000000a1.png"), png);
        const values = {"--bg": "url(\"bd-image:0000000000a1.png\")", "--accent": "red", "--logo": "url(\"https://example.com/a.png\")"};

        expect(makeImages().resolve(values)).toEqual({"--bg": "url(\"blob:test/1\")", "--accent": "red", "--logo": "url(\"https://example.com/a.png\")"});
    });

    test("leaves out a value whose copy is missing, so the page uses the default", () => {
        const values = {"--bg": "url(\"bd-image:0000000000a1.png\")", "--accent": "red"};
        expect(makeImages().resolve(values)).toEqual({"--accent": "red"});
    });

    test("returns values without images unchanged", () => {
        const values = {"--accent": "red"};
        expect(makeImages().resolve(values)).toBe(values);
    });

    test("revokes a stopped theme's URLs and reads the copy again on the next start", () => {
        files.set(inFolder("0000000000a1.png"), png);
        const images = makeImages();
        const values = {"--bg": "url(\"bd-image:0000000000a1.png\")", "--accent": "red"};

        images.resolve(values);
        images.release(values);
        expect(revoked).toEqual(["blob:test/1"]);
        expect(files.has(inFolder("0000000000a1.png"))).toBe(true);

        expect(images.resolve(values)["--bg"]).toBe("url(\"blob:test/2\")");
    });

    test("sweeps copies that no saved value names, and keeps the rest", () => {
        for (const name of ["0000000000a1.png", "0000000000a2.gif", "0000000000a3.svg"]) files.set(inFolder(name), png);
        files.set(inFolder("readme.txt"), text("not ours"));
        const images = makeImages();
        images.urlFor("0000000000a2.gif");

        images.sweep({
            Midnight: {"--bg": "url(\"bd-image:0000000000a1.png\")", "--accent": "red"},
            Daylight: {"--pattern": "url(bd-image:0000000000a3.svg)"}
        });

        expect([...files.keys()].map(file => path.basename(file)).sort()).toEqual(["0000000000a1.png", "0000000000a3.svg", "readme.txt"]);
        expect(revoked).toEqual(["blob:test/1"]);
    });

    test("sweeping with no saved values deletes every copy", () => {
        files.set(inFolder("0000000000a1.png"), png);
        makeImages().sweep({});
        expect(files.size).toBe(0);
    });

    test("sweeping without a folder does nothing", () => {
        const images = new ThemeImages({
            folder,
            readFile: () => png,
            writeFile: () => {},
            deleteFile: () => {},
            fileSize: () => 0,
            listFiles: () => {
                throw new Error("ENOENT");
            },
            makeFolder: () => {},
            createObjectURL: () => "blob:test",
            revokeObjectURL: () => {},
            randomName: () => "0000000000a1"
        });
        expect(() => images.sweep({})).not.toThrow();
    });

    test("discards a copy that never got saved", () => {
        files.set("a.png", png);
        const images = makeImages();
        images.copy("a.png");

        images.discard("0000000000a1.png");
        expect(files.has(inFolder("0000000000a1.png"))).toBe(false);
        expect(revoked).toEqual(["blob:test/1"]);
    });

    test("pick applies a link to the copy", () => {
        files.set("a.png", png);
        const applied: string[] = [];
        expect(makeImages().pick("a.png", value => {
            applied.push(value);
            return value;
        })).toBeNull();
        expect(applied).toEqual([`url("${imageRef("0000000000a1.png")}")`]);
        expect(files.has(inFolder("0000000000a1.png"))).toBe(true);
    });

    test("pick discards the copy when the value is refused, and reports a refused file", () => {
        files.set("a.png", png);
        files.set("notes.png", text("just some text"));
        const images = makeImages();

        expect(images.pick("a.png", () => null)).toBeNull();
        expect(files.has(inFolder("0000000000a1.png"))).toBe(false);

        let isApplied = false;
        expect(images.pick("notes.png", value => {
            isApplied = true;
            return value;
        })).toBe("notImage");
        expect(isApplied).toBe(false);
    });
});

describe("probeWithImages", () => {
    const settings = parseThemeSettings([
        "@property --bg { syntax: \"<url>\"; inherits: true; initial-value: url(\"data:,\"); name: \"Background\"; }",
        "@property --logo { syntax: \"<url>\"; inherits: true; initial-value: url(\"data:,\"); name: \"Logo\"; }",
        "@property --accent { syntax: \"<color>\"; inherits: true; initial-value: red; name: \"Accent\"; }"
    ].join("\n")).settings;
    const [bg, logo, accent] = settings;

    function run(entries: Array<[ThemeSetting, string]>) {
        const probed: string[] = [];
        const missing: string[] = [];
        const verdicts = probeWithImages(makeImages(), entries, rest => {
            probed.push(...rest.map(([, value]) => value));
            return rest.map(() => "changed");
        }, setting => missing.push(setting.property));
        return {verdicts, probed, missing};
    }

    test("probes an image whose copy is there like any other value", () => {
        files.set(inFolder("0000000000a1.png"), png);
        const {verdicts, probed, missing} = run([[bg, "url(\"bd-image:0000000000a1.png\")"], [accent, "blue"]]);

        expect(verdicts).toEqual(["changed", "changed"]);
        expect(probed).toEqual(["url(\"bd-image:0000000000a1.png\")", "blue"]);
        expect(missing).toEqual([]);
    });

    test("calls a missing copy invalid without probing it, and keeps the order", () => {
        files.set(inFolder("0000000000a2.png"), png);
        const {verdicts, probed, missing} = run([
            [bg, "url(\"bd-image:0000000000a1.png\")"],
            [accent, "blue"],
            [logo, "url(\"bd-image:0000000000a2.png\")"]
        ]);

        expect(verdicts).toEqual(["invalid", "changed", "changed"]);
        expect(probed).toEqual(["blue", "url(\"bd-image:0000000000a2.png\")"]);
        expect(missing).toEqual(["--bg"]);
    });

    test("calls a bd-image link with a name BD doesn't make invalid", () => {
        const {verdicts, missing} = run([[bg, "url(\"bd-image:../notes.txt\")"]]);
        expect(verdicts).toEqual(["invalid"]);
        expect(missing).toEqual(["--bg"]);
    });
});

describe("describeUrlValue", () => {
    const image = "url(\"bd-image:0000000000a1.png\")";

    test("shows a picked image", () => {
        expect(describeUrlValue(image, image)).toEqual({kind: "image", name: "0000000000a1.png"});
    });

    test("shows the link field for a link or the default", () => {
        expect(describeUrlValue("url(\"https://example.com/a.png\")", "url(\"https://example.com/a.png\")")).toEqual({kind: "link", isImageMissing: false});
        expect(describeUrlValue("url(\"data:,\")", undefined)).toEqual({kind: "link", isImageMissing: false});
    });

    test("says when a saved image couldn't be used, so the page shows the default", () => {
        expect(describeUrlValue("url(\"data:,\")", image)).toEqual({kind: "link", isImageMissing: true});
        expect(describeUrlValue("url(\"data:,\")", "url(\"bd-image:hand-edited\")")).toEqual({kind: "link", isImageMissing: true});
    });
});
