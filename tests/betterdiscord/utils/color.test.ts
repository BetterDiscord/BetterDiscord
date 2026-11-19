import {describe, test, expect} from "bun:test";
import {hexToHsv, hsvToHex, readHex, splitAlpha, withAlpha} from "@utils/color";

describe("alpha", () => {
    test("splits an 8-digit hex and leaves a 6-digit one opaque", () => {
        expect(splitAlpha("#5865f280")).toEqual(["#5865f2", 128 / 255]);
        expect(splitAlpha("#5865f2")).toEqual(["#5865f2", 1]);
    });

    test("adds an opacity, and keeps a fully opaque color at 6 digits", () => {
        expect(withAlpha("#5865f2", 0.5)).toBe("#5865f280");
        expect(withAlpha("#5865f2", 0)).toBe("#5865f200");
        expect(withAlpha("#5865f2", 1)).toBe("#5865f2");
    });
});

describe("readHex", () => {
    test("reads 3 and 6 digits, with or without the #", () => {
        expect(readHex("#abc", false)).toBe("#aabbcc");
        expect(readHex(" 5865F2 ", false)).toBe("#5865f2");
    });

    test("reads 8 digits only when alpha is allowed", () => {
        expect(readHex("#5865f280", true)).toBe("#5865f280");
        expect(readHex("#5865f2ff", true)).toBe("#5865f2");
        expect(readHex("#5865f280", false)).toBeNull();
    });

    test("refuses anything else", () => {
        expect(readHex("#5865f", true)).toBeNull();
        expect(readHex("blue", true)).toBeNull();
        expect(readHex("", true)).toBeNull();
    });
});

describe("HSV", () => {
    test("converts the primaries and greys", () => {
        expect(hexToHsv("#ff0000")).toEqual({h: 0, s: 1, v: 1});
        expect(hexToHsv("#00ff00")).toEqual({h: 120, s: 1, v: 1});
        expect(hexToHsv("#0000ff")).toEqual({h: 240, s: 1, v: 1});
        expect(hexToHsv("#000000")).toEqual({h: 0, s: 0, v: 0});
        expect(hexToHsv("#ffffff")).toEqual({h: 0, s: 0, v: 1});
    });

    test("round-trips a hex", () => {
        for (const hex of ["#5865f2", "#eb459e", "#57f287", "#fee75c", "#808080", "#123456"] as const) {
            expect(hsvToHex(hexToHsv(hex))).toBe(hex);
        }
    });
});
