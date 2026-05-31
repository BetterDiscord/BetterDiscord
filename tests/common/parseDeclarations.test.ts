/* eslint-disable no-template-curly-in-string */
import {describe, test, expect} from "bun:test";
import parseDeclarations from "@common/parseDeclarations";
import moduleCode from "./moduleCode.txt";

describe("parseDeclarations", () => {
    test("function wrapper", () => {
        const tested = `function(){let a=1;var b=2;const c=3;}`;
        expect(parseDeclarations(tested)).toEqual(["a", "b", "c"]);
    });

    test("commas", () => {
        const tested = `let a=1,b=2;const c=3,d,e=15`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b", "c", "d", "e"]);
    });

    test("functions and classes", () => {
        const tested = `function a(){let a=1;var b=2;const c=3;}async function b(){}class c{}class d extends z{};!function w(){}`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b", "c", "d"]);
    });

    test("complex values", () => {
        const tested = `let a={x:1,y:2},b=[1,2,3],c="{\\"}",d='string\\\\',e=\`str\${"string"}ing\`,f=(()=>{})().test({}),g=15`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b", "c", "d", "e", "f", "g"]);
    });

    test("array destructuring", () => {
        const tested = `let[a,b,c,d]=[],[e=15,f={},g=()=>{}]=[];`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b", "c", "d", "e", "f", "g"]);
    });

    test("object destructuring", () => {
        const tested = `const{a,q:b,c,d}={},e=15,{f={},uh:g=()=>{}}={};`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b", "c", "d", "e", "f", "g"]);
    });

    test("complex destructuring", () => {
        const tested = `let{z:{a,b},x:[c,{d,q:e}],f=15}={}`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b", "c", "d", "e", "f"]);
    });

    test("regex", () => {
        const tested = `10/5;(10)/5;[10][0]/5;let a=/\\/[^/\\\\]$/,b=/\\(\\)/;`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b"]);
    });

    test("single variables", () => {
        const tested = `var a;a=function(){},"function"==typeof b`;
        expect(parseDeclarations(tested, 0)).toEqual(["a"]);
    });

    test("nested template literals", () => {
        const tested = "let a=`\\\\${`, ${``}`})`,b=15";
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b"]);
    });

    test("ignore named functions as values", () => {
        const tested = `let a,b=15;e.exports=function z(){}`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b"]);
    });

    test("variables in properties", () => {
        const tested = `a.variable=15;const b=15;`;
        expect(parseDeclarations(tested, 0)).toEqual(["b"]);
    });

    test("regex after return", () => {
        const tested = `function a(){return/}/}function b(){}`;
        expect(parseDeclarations(tested, 0)).toEqual(["a", "b"]);
    });

    test("actual module code", async () => {
        const cases = moduleCode.replaceAll("\r\n", "\n").split("\n=-=-=-=\n");

        expect(parseDeclarations(cases[0])).toEqual([
            "i", "r", "s", "a", "o", "l", "u", "c", "d", "_", "f", "h",
            "p", "E", "m", "g", "A", "I", "T", "S", "N", "y", "C"
        ]);

        expect(parseDeclarations(cases[1])).toEqual([]);

        expect(parseDeclarations(cases[2])).toEqual([
            "i", "a", "r", "d", "l", "n", "u", "c", "o", "S", "g", "f",
            "v", "E", "h", "p", "R", "_", "G", "k"
        ]);
    });
});