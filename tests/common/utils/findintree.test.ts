import {test, expect, describe} from "bun:test";
import {findInTree} from "@common/utils";

describe("FindInTree Utility", () => {
    const testObj = {
        level1: {
            level2: {
                target: "found",
                other: "value"
            },
            array: [
                {target: "inArray"},
                {other: "value"}
            ]
        },
        sibling: {
            target: "siblingValue"
        }
    };

    test("should find value using string search", () => {
        const result = findInTree(testObj, "target");
        expect(result).toBe("found");
    });

    test("should find value using function search", () => {
        const result = findInTree(testObj, value => value === "found");
        expect(result).toBe("found");
    });

    test("should find value in array", () => {
        const result = findInTree(testObj.level1.array as Record<number, any>, "target");
        expect(result).toBe("inArray");
    });

    test("should work with walkable option", () => {
        // Only search in level1.level2
        const result = findInTree(testObj, "target", {walkable: ["level1", "level2"]});
        expect(result).toBe("found");
    });

    test("should respect ignore option", () => {
        // Ignore level1, should find in sibling
        const result = findInTree(testObj, "target", {ignore: ["level1"]});
        expect(result).toBe("siblingValue");
    });

    test("should handle null input", () => {
        const result = findInTree(null, "target");
        expect(result).toBeUndefined();
    });

    test("should handle primitive input", () => {
        const result = findInTree("string" as any, "target");
        expect(result).toBeUndefined();
    });

    test("should return undefined when not found", () => {
        const result = findInTree(testObj, "nonexistent");
        expect(result).toBeUndefined();
    });

    test("should find object using filter function", () => {
        const result = findInTree(testObj, obj => obj && typeof obj === "object" && obj.target === "found");
        expect(result).toEqual({target: "found", other: "value"});
    });
});
