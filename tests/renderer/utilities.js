import assert from "assert";
import Utilities from "../../renderer/src/modules/utilities";

describe("Utilities", function() {
    
    describe("suppressErrors", function() {
        it("Prevent error propagation", function() {
            const thrower = () => {throw new Error("Error");};
            const wrapped = Utilities.suppressErrors(thrower);
            assert.doesNotThrow(wrapped);
        });
        it("Allows arguments through", function() {
            const thrower = (foo) => {
                assert.equal(foo, "bar");
            };
            const wrapped = Utilities.suppressErrors(thrower);
            wrapped("bar");
        });
        it("Retains the return value", function() {
            const thrower = () => {return "bar";};
            const wrapped = Utilities.suppressErrors(thrower);
            const foo = wrapped();
            assert.equal(foo, "bar");
        });
    });

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

    describe("getNestedProp", function() {
        const testObj = {test: {deep: {go: "far"}, other: [0, 1, {test2: "foo"}]}};
        it("Gets a shallow property", function() {
            const result = Utilities.getNestedProp(testObj, "test");
            assert.deepEqual(result, testObj.test);
        });
        it("Gets a deep property", function() {
            const result = Utilities.getNestedProp(testObj, "test.deep.go");
            assert.deepEqual(result, testObj.test.deep.go);
        });
        it("Gets a property through index", function() {
            const result = Utilities.getNestedProp(testObj, "test.other.2.test2");
            assert.deepEqual(result, testObj.test.other[2].test2);
        });
        it("Returns null when the a prop is not found", function() {
            const result = Utilities.getNestedProp(testObj, "test.foo");
            assert.equal(result, null);
        });
        it("Returns null when several layers are not found", function() {
            const result = Utilities.getNestedProp(testObj, "test.deep.far.doit.cmon");
            assert.equal(result, null);
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

    describe("findInReactTree", function() {
        const originalFindInTree = Utilities.findInTree;
        
        it("Passes the original object", function() {
            const myObj = {props: "foo"};
            Utilities.findInTree = function(obj) { assert.deepEqual(obj, myObj); return Reflect.apply(originalFindInTree, Utilities, arguments); };
            const result = Utilities.findInReactTree(myObj, "props");
            assert.equal(result, "foo");
        });
        it("Passes the original filter", function() {
            const myObj = {props: "foo"};
            const myFilter = "props";
            Utilities.findInTree = function(obj, filter) { assert.deepEqual(filter, myFilter); return Reflect.apply(originalFindInTree, Utilities, arguments); };
            const result = Utilities.findInReactTree(myObj, myFilter);
            assert.equal(result, "foo");

            const myFilter2 = o => o == "foo";
            Utilities.findInTree = function(obj, filter) { assert.deepEqual(filter, myFilter2); return Reflect.apply(originalFindInTree, Utilities, arguments); };
            const result2 = Utilities.findInReactTree(myObj, myFilter2);
            assert.equal(result2, "foo");
        });
        it("Includes the react walkables", function() {
            Utilities.findInTree = function(obj, filter, {walkable}) {
                const shouldWalk = ["props", "children", "return", "stateNode"];
                assert.ok(shouldWalk.every(k => walkable.includes(k)));
            };
            Utilities.findInReactTree({}, "foobar");
        });

        Utilities.findInTree = originalFindInTree;
    });
});