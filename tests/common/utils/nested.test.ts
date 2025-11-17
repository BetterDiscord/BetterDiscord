import {test, expect, describe} from "bun:test";
import {getNestedProp} from "@common/utils";

describe("GetNestedProp Utility", () => {
    const testObj = {
        level1: {
            level2: {
                level3: "value",
                number: 42
            },
            array: [1, 2, 3]
        },
        sibling: "siblingValue"
    };

    test("should get shallow property", () => {
        const result = getNestedProp(testObj, "sibling");
        expect(result).toBe("siblingValue");
    });

    test("should get deep property", () => {
        const result = getNestedProp(testObj, "level1.level2.level3");
        expect(result).toBe("value");
    });

    test("should get numeric value", () => {
        const result = getNestedProp(testObj, "level1.level2.number");
        expect(result).toBe(42);
    });

    test("should get array value", () => {
        const result = getNestedProp(testObj, "level1.array");
        expect(result).toEqual([1, 2, 3]);
    });

    test("should return undefined for non-existent path", () => {
        const result = getNestedProp(testObj, "nonexistent.path");
        expect(result).toBeUndefined();
    });

    test("should handle empty path", () => {
        const result = getNestedProp(testObj, "");
        expect(result).toBe(testObj);
    });

    test("should handle skipLast option", () => {
        const result = getNestedProp(testObj, "level1.level2.level3", true);
        expect(result).toEqual({level3: "value", number: 42});
    });

    test("should handle skipLast with non-existent path", () => {
        const result = getNestedProp(testObj, "level1.nonexistent.value", true);
        expect(result).toBeUndefined();
    });

    test("should handle object with symbol keys", () => {
        const sym = Symbol("test");
        const objWithSymbol = {
            [sym]: {
                value: "symbol value"
            }
        };
        const result = getNestedProp(objWithSymbol, Symbol("test").toString());
        expect(result).toBeUndefined(); // Symbol keys are not accessible via string path
    });
});
