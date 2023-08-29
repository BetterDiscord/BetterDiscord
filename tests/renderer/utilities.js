import assert from "assert";
import Utilities from "../../renderer/src/modules/utilities";

describe("Utilities", function() {

    describe("formatString", function() {
        it("Should handle direct replacement", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: "success"});
            assert.equal("This is a success", filledOut);
        });
        it("Should not error with excess data", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: "success", otherthing: "foo"});
            assert.equal("This is a success", filledOut);
        });
        it("Should toString objects", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: {misnomer: "good"}});
            assert.equal(`This is a [object Object]`, filledOut);
            const filledOut2 = Utilities.formatString(template, {success: {toString: () => {return "good test";}}});
            assert.equal(`This is a good test`, filledOut2);
        });
        it("Should stringify arrays", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: ["success", "or", "failure"]});
            assert.equal(`This is a ["success","or","failure"]`, filledOut);
        });
        it("Use the return value of functions", function() {
            const template = `This is a {{success}}`;
            const filledOut = Utilities.formatString(template, {success: () => "test"});
            assert.equal(`This is a test`, filledOut);
        });
    });

    describe("findInTree", function() {
        const testObj = {test: {deep: {go: "far"}, other: [0, 1, {test2: "foo"}]}};
        it("Gets a shallow property using a string", function() {
            const result = Utilities.findInTree(testObj, "test");
            assert.deepEqual(result, testObj.test);
        });
        it("Gets a shallow property using a function", function() {
            const result = Utilities.findInTree(testObj, o => Object.keys(o).includes("deep"));
            assert.deepEqual(result, testObj.test);
        });
        it("Gets a deep property using a string", function() {
            const result = Utilities.findInTree(testObj, "go");
            assert.deepEqual(result, testObj.test.deep.go);
        });
        it("Gets a deep property using a function", function() {
            const result = Utilities.findInTree(testObj, o => o == "far");
            assert.deepEqual(result, testObj.test.deep.go);
        });
        it("Returns undefined when not found using string", function() {
            const result = Utilities.findInTree(testObj, "foobar");
            assert.equal(result, undefined);
        });
        it("Returns undefined when not found using function", function() {
            const result = Utilities.findInTree(testObj, o => o && o.foobar);
            assert.equal(result, undefined);
        });

        const walkingObj = {foo: {bar: "final1", deeper: "final2", test: "final3"}, test: "final4", otherTest: {bar: "final5", deeper: "final6"}};
        it("Gets a property using a string limited to walkable keys", function() {
            const result = Utilities.findInTree(walkingObj, "bar", {walkable: ["foo", "bar"]});
            assert.equal(result, walkingObj.foo.bar);
        });
        it("Gets a property using a function limited to walkable keys", function() {
            const result = Utilities.findInTree(walkingObj, o => o.deeper, {walkable: ["foo", "bar"]});
            assert.deepEqual(result, walkingObj.foo);
        });
        it("Gets a property using a string ignoring specific keys", function() {
            const result = Utilities.findInTree(walkingObj, "bar", {ignore: ["foo", "bar"]});
            assert.equal(result, walkingObj.otherTest.bar);
        });
        it("Gets a property using a function ignoring specific keys", function() {
            const result = Utilities.findInTree(walkingObj, o => o.deeper, {ignore: ["foo", "bar"]});
            assert.deepEqual(result, walkingObj.otherTest);
        });
    });
});