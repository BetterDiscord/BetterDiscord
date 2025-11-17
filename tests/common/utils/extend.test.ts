import {test, expect, describe} from "bun:test";
import {extend} from "@common/utils";

describe("Extend Utility", () => {
    test("should extend target with single object", () => {
        const target = {a: 1};
        const source = {b: 2};
        const result = extend(target, source);
        expect(result).toEqual({a: 1, b: 2});
    });

    test("should extend target with multiple objects", () => {
        const target = {a: 1};
        const source1 = {b: 2};
        const source2 = {c: 3};
        const result = extend(target, source1, source2);
        expect(result).toEqual({a: 1, b: 2, c: 3});
    });

    test("should handle deep objects", () => {
        const target = {
            deep: {
                a: 1
            }
        };
        const source = {
            deep: {
                b: 2
            }
        };
        const result = extend(target, source);
        expect(result).toEqual({
            deep: {
                a: 1,
                b: 2
            }
        });
    });

    test("should handle arrays", () => {
        const target = {arr: [1, 2]};
        const source = {arr: [3, 4]};
        const result = extend(target, source);
        // @ts-expect-error extend has weak typing
        expect(result.arr).toEqual([3, 4]); // Arrays are replaced, not merged
    });

    test("should handle null values", () => {
        const target = {a: 1, b: 2};
        const source = {b: null};
        const result = extend(target, source);
        expect(result).toEqual({a: 1, b: null});
    });

    test("should handle undefined values", () => {
        const target = {a: 1, b: 2};
        const source = {b: undefined};
        const result = extend(target, source);
        expect(result).toEqual({a: 1, b: undefined});
    });

    test("should handle primitives in source", () => {
        const target = {a: 1};
        const source = {b: "string", c: 42, d: true};
        const result = extend(target, source);
        expect(result).toEqual({a: 1, b: "string", c: 42, d: true});
    });

    test("should override existing properties", () => {
        const target = {a: 1, b: 2};
        const source = {b: 3};
        const result = extend(target, source);
        expect(result).toEqual({a: 1, b: 3});
    });

    test("should handle nested arrays", () => {
        const target = {
            nested: {
                arr: [1, 2]
            }
        };
        const source = {
            nested: {
                arr: [3, 4]
            }
        };
        const result = extend(target, source);
        // @ts-expect-error extend has weak typing
        expect(result.nested.arr).toEqual([3, 4]);
    });

    test("should handle complex nested structures", () => {
        const target = {
            level1: {
                level2: {
                    array: [1, 2],
                    value: "original"
                }
            }
        };
        const source = {
            level1: {
                level2: {
                    array: [3, 4],
                    newValue: "new"
                }
            }
        };
        const result = extend(target, source);
        expect(result).toEqual({
            level1: {
                level2: {
                    array: [3, 4],
                    value: "original",
                    newValue: "new"
                }
            }
        });
    });
});
