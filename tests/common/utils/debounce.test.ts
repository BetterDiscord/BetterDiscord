import {test, expect, describe} from "bun:test";
import {debounce} from "@common/utils";

describe("Debounce Utility", () => {
    test("should execute the function after the delay", async () => {
        let counter = 0;
        const increment = debounce(() => {
            counter++;
        }, 100);

        increment();
        expect(counter).toBe(0); // Should not have executed yet

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(counter).toBe(1); // Should have executed once
    });

    test("should only execute once for multiple calls within delay", async () => {
        let counter = 0;
        const increment = debounce(() => {
            counter++;
        }, 100);

        increment();
        increment();
        increment();
        expect(counter).toBe(0); // Should not have executed yet

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(counter).toBe(1); // Should have executed only once
    });

    test("should pass arguments correctly", async () => {
        let result = 0;
        const add = debounce((a: number, b: number) => {
            result = a + b;
        }, 100);

        add(2, 3);
        expect(result).toBe(0); // Should not have executed yet

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(result).toBe(5); // Should have executed with correct args
    });

    test("should use latest arguments for multiple calls", async () => {
        let result = 0;
        const add = debounce((a: number, b: number) => {
            result = a + b;
        }, 100);

        add(1, 1);
        add(2, 2);
        add(3, 3);
        expect(result).toBe(0); // Should not have executed yet

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(result).toBe(6); // Should use latest arguments (3 + 3)
    });
});
