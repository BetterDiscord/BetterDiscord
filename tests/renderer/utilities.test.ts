import {test, expect, describe} from "bun:test";
import Utilities from "../../src/betterdiscord/modules/utilities";

describe("Utilities", function() {

    describe("formatString", function() {
        test("Should handle direct replacement", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: "success"});
            expect(filledOut).toEqual("This is a success");
        });
        test("Should not error with excess data", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: "success", otherthing: "foo"});
            expect(filledOut).toEqual("This is a success");
        });
        test("Should toString objects", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: {misnomer: "good"}});
            expect(filledOut).toEqual(`This is a [object Object]`);
            const filledOut2 = Utilities.formatString(template, {success: {toString: () => {return "good test";}}});
            expect(filledOut2).toEqual(`This is a good test`);
        });
        test("Should stringify arrays", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: ["success", "or", "failure"]});
            expect(filledOut).toEqual(`This is a ["success","or","failure"]`);
        });
        test("Use the return value of functions", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: () => "test"});
            expect(filledOut).toEqual(`This is a test`);
        });
    });

    describe("findInTree", function() {
        const testObj = {test: {deep: {go: "far"}, other: [0, 1, {test2: "foo"}]}};
        test("Gets a shallow property using a string", function() {
            const result = Utilities.findInTree(testObj, "test");
            expect(result).toEqual(testObj.test);
        });
        test("Gets a shallow property using a function", function() {
            const result = Utilities.findInTree(testObj, (o: object) => Object.keys(o).includes("deep"));
            expect(result).toEqual(testObj.test);
        });
        test("Gets a deep property using a string", function() {
            const result = Utilities.findInTree(testObj, "go");
            expect(result).toEqual(testObj.test.deep.go);
        });
        test("Gets a deep property using a function", function() {
            const result = Utilities.findInTree(testObj, (o: string) => o == "far");
            expect(result).toEqual(testObj.test.deep.go);
        });
        test("Returns undefined when not found using string", function() {
            const result = Utilities.findInTree(testObj, "foobar");
            expect(result).toEqual(undefined);
        });
        test("Returns undefined when not found using function", function() {
            const result = Utilities.findInTree(testObj, (o: {foobar: undefined}) => o && o.foobar);
            expect(result).toEqual(undefined);
        });

        const walkingObj = {foo: {bar: "final1", deeper: "final2", test: "final3"}, test: "final4", otherTest: {bar: "final5", deeper: "final6"}};
        test("Gets a property using a string limited to walkable keys", function() {
            const result = Utilities.findInTree(walkingObj, "bar", {walkable: ["foo", "bar"]});
            expect(result).toEqual(walkingObj.foo.bar);
        });
        test("Gets a property using a function limited to walkable keys", function() {
            const result = Utilities.findInTree(walkingObj, (o: {deeper: string}) => o.deeper, {walkable: ["foo", "bar"]});
            expect(result).toEqual(walkingObj.foo);
        });
        test("Gets a property using a string ignoring specific keys", function() {
            const result = Utilities.findInTree(walkingObj, "bar", {ignore: ["foo", "bar"]});
            expect(result).toEqual(walkingObj.otherTest.bar);
        });
        test("Gets a property using a function ignoring specific keys", function() {
            const result = Utilities.findInTree(walkingObj, (o: {deeper: string}) => o.deeper, {ignore: ["foo", "bar"]});
            expect(result).toEqual(walkingObj.otherTest);
        });
    });
});