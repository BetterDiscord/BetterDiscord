import {test, expect, describe} from "bun:test";
import {clone, getKeys} from "@common/utils";

describe("Clone Utility", () => {
    describe("getKeys", () => {
        test("should get all keys from a simple object", () => {
            const obj = {a: 1, b: 2, c: 3};
            const keys = getKeys(obj);
            expect(keys).toEqual(["a", "b", "c"]);
        });

        test("should get string and number keys", () => {
            const obj = {string: "value", 1: "number"};
            const keys = getKeys(obj);

            // @ts-expect-error TypeScript allows both string and number keys, but they are coerced to strings
            expect(keys).toEqual(["1", "string"]);
        });
    });

    describe("clone", () => {
        test("should clone a simple object", () => {
            const obj = {a: 1, b: 2, c: 3};
            const cloned = clone(obj);
            expect(cloned).toEqual(obj);
            expect(cloned).not.toBe(obj);
        });

        test("should clone nested objects", () => {
            const obj = {
                a: {
                    b: {
                        c: 1
                    }
                }
            };
            const cloned = clone(obj);
            expect(cloned).toEqual(obj);
            expect(cloned.a).not.toBe(obj.a);
            expect(cloned.a?.b).not.toBe(obj.a.b);
        });

        test("should handle arrays", () => {
            const obj = {arr: [1, 2, 3]};
            const cloned = clone(obj);
            expect(cloned).toEqual(obj);
            expect(cloned.arr).toEqual(obj.arr);
        });

        test("should handle functions", () => {
            const fn = function () {return 5;};
            const obj = {fn};
            const cloned = clone(obj);
            expect(cloned.fn?.()).toBe(5);
        });

        test("should clone with specified keys", () => {
            const obj = {a: 1, b: 2, c: 3};
            const cloned = clone(obj, {}, ["a", "b"]);
            expect(cloned).toEqual({a: 1, b: 2});
        });

        test("should handle null values", () => {
            const obj = {a: null, b: undefined};
            const cloned = clone(obj);
            expect(cloned).toEqual(obj);
        });
    });
});
