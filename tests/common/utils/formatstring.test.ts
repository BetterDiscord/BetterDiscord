import {test, expect, describe} from "bun:test";
import {formatString} from "@common/utils";

describe("FormatString Utility", () => {
    test("should handle basic string replacement", () => {
        const template = "Hello, {{name}}!";
        const result = formatString(template, {name: "John"});
        expect(result).toBe("Hello, John!");
    });

    test("should handle multiple replacements", () => {
        const template = "{{greeting}}, {{name}}!";
        const result = formatString(template, {
            greeting: "Hello",
            name: "John"
        });
        expect(result).toBe("Hello, John!");
    });

    test("should handle function values", () => {
        const template = "The time is {{time}}";
        const result = formatString(template, {
            time: () => "12:00"
        });
        expect(result).toBe("The time is 12:00");
    });

    test("should handle object values", () => {
        const template = "Object: {{obj}}";
        const obj = {toString: () => "customString"};
        const result = formatString(template, {obj});
        expect(result).toBe("Object: customString");
    });

    test("should handle array values", () => {
        const template = "Array: {{arr}}";
        const result = formatString(template, {
            arr: [1, 2, 3]
        });
        expect(result).toBe("Array: [1,2,3]");
    });

    test("should handle undefined values", () => {
        const template = "Value: {{val}}";
        const result = formatString(template, {
            val: undefined
        });
        expect(result).toBe("Value: {{val}}");
    });

    test("should handle multiple occurrences of same placeholder", () => {
        const template = "{{name}} is {{name}}";
        const result = formatString(template, {
            name: "John"
        });
        expect(result).toBe("John is John");
    });

    test("should handle nested objects", () => {
        const template = "Nested: {{obj}}";
        const result = formatString(template, {
            obj: {nested: {value: "test"}}
        });
        expect(result).toBe("Nested: [object Object]");
    });

    test("should handle null values", () => {
        const template = "Value: {{val}}";
        const result = formatString(template, {
            val: null
        });
        expect(result).toBe("Value: null");
    });

    test("Should not error with excess data", function () {
        const template = `This is a {{success}}`;
        const filledOut = formatString(template, {success: "success", otherthing: "foo"});
        expect(filledOut).toEqual("This is a success");
    });
});
