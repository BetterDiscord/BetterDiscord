import {test, expect, describe} from "bun:test";
import {memoize} from "@common/utils";

describe("Memoize Utility", () => {
    test("should memoize object properties", () => {
        let computeCount = 0;
        const obj = {
            get value() {
                computeCount++;
                return 42;
            }
        };

        const memoized = memoize(obj);

        // First access should compute
        expect(memoized.value).toBe(42);
        expect(computeCount).toBe(1);

        // Second access should use memoized value
        expect(memoized.value).toBe(42);
        expect(computeCount).toBe(1);
    });

    test("should handle multiple properties", () => {
        let count1 = 0, count2 = 0;
        const obj = {
            get prop1() {
                count1++;
                return "value1";
            },
            get prop2() {
                count2++;
                return "value2";
            }
        };

        const memoized = memoize(obj);

        expect(memoized.prop1).toBe("value1");
        expect(memoized.prop1).toBe("value1");
        expect(count1).toBe(1);

        expect(memoized.prop2).toBe("value2");
        expect(memoized.prop2).toBe("value2");
        expect(count2).toBe(1);
    });

    test("should handle hasOwnProperty correctly", () => {
        const obj = {
            prop: "value"
        };

        const memoized = memoize(obj);

        expect(memoized.hasOwnProperty("prop")).toBe(true);
        expect(memoized.hasOwnProperty("nonexistent")).toBe(false);
    });

    test("should not allow setting existing properties", () => {
        const obj = {
            prop: "value"
        };

        const memoized = memoize(obj);

        expect(() => memoized.prop = "new value").toThrowError("Proxy object's 'set' trap returned falsy value for property 'prop'");
        expect(memoized.prop).toBe("value");
    });

    test("should allow setting new properties", () => {
        const obj = {
            prop: "value"
        };

        const memoized = memoize(obj);

        // @ts-expect-error only for testing purposes
        memoized.newProp = "new value";
        // @ts-expect-error only for testing purposes
        expect(memoized.newProp).toBe("new value");
    });

    test("should handle symbol properties", () => {
        const sym = Symbol("test");
        const obj = {
            [sym]: "value"
        };

        const memoized = memoize(obj);

        expect(memoized[sym]).toBeNull();
    });

    test("should memoize getter results independently", () => {
        let count = 0;
        const obj = {
            get value() {
                count++;
                return {nested: "value"};
            }
        };

        const memoized = memoize(obj);

        const firstResult = memoized.value;
        const secondResult = memoized.value;

        expect(firstResult).toBe(secondResult);
        expect(count).toBe(1);
    });
});
