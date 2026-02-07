import {test, expect, describe, beforeEach, afterEach} from "bun:test";
import DOMManager from "@modules/dommanager";


describe("DOMManager", () => {
    describe("escapeID", () => {
        test("should return a valid id", () => {
            expect(DOMManager.escapeID("123abc")).toBe(CSS.escape("123abc"));
            expect(DOMManager.escapeID("test@#$%")).toBe(CSS.escape("test@#$%"));
            expect(DOMManager.escapeID("valid-id")).toBe("valid-id");
            expect(DOMManager.escapeID("mixed_special@chars")).toBe(CSS.escape("mixed_special@chars"));
            expect(DOMManager.escapeID("multiCASE_madness")).toBe("multiCASE_madness");
        });
    });

    describe("createElement", () => {
        test("should create element with given type", () => {
            const div = DOMManager.createElement("div");
            expect(div).toBeInstanceOf(HTMLDivElement);
        });

        test("should set element properties from options", () => {
            const div = DOMManager.createElement("div", {id: "test-id"});
            expect(div.id).toBe("test-id");
        });

        test("should append children", () => {
            const span1 = document.createElement("span");
            const span2 = document.createElement("span");
            const div = DOMManager.createElement("div", {}, span1, span2);
            expect(div.children.length).toBe(2);
            expect(div.children[0]).toBe(span1);
            expect(div.children[1]).toBe(span2);
        });

        test("should handle nested arrays of children", () => {
            const span1 = document.createElement("span");
            const span2 = document.createElement("span");
            const div = DOMManager.createElement("div", {}, [span1, [span2]]);
            expect(div.children.length).toBe(2);
            expect(div.children[0]).toBe(span1);
            expect(div.children[1]).toBe(span2);
        });

        test("should handle text nodes", () => {
            const div = DOMManager.createElement("div", {}, "text content");
            expect(div.textContent).toBe("text content");
        });
    });

    describe("parseHTML", () => {
        test("should parse single element", () => {
            const result = DOMManager.parseHTML("<div>test</div>");
            expect(result).toBeInstanceOf(HTMLDivElement);
            expect((result as HTMLDivElement).textContent).toBe("test");
        });

        test("should return NodeList for multiple elements when fragment=false", () => {
            const result = DOMManager.parseHTML("<span>1</span><span>2</span>");
            expect(result).toBeInstanceOf(NodeList);
            expect((result as NodeList).length).toBe(2);
        });

        test("should return DocumentFragment when fragment=true", () => {
            const result = DOMManager.parseHTML("<div>test</div>", true);
            expect(result).toBeInstanceOf(DocumentFragment);
        });

        test("should handle complex HTML", () => {
            const html = `
                <div class="container">
                    <h1>Title</h1>
                    <p>Paragraph</p>
                </div>`;
            const result = DOMManager.parseHTML(html) as HTMLDivElement;
            expect(result).toBeInstanceOf(HTMLDivElement);
            expect(result.querySelector("h1")?.textContent).toBe("Title");
            expect(result.querySelector("p")?.textContent).toBe("Paragraph");
        });
    });

    describe("getElement", () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement("div");
            container.innerHTML = `
                <div id="test">
                    <span class="item">Item 1</span>
                    <span class="item">Item 2</span>
                </div>
            `;
        });

        test("should return element when given a selector string", () => {
            const element = DOMManager.getElement("#test", container);
            expect(element?.id).toBe("test");
        });

        test("should return node when given a node", () => {
            const node = container.querySelector("#test")!;
            const result = DOMManager.getElement(node!, container);
            expect(result).toBe(node);
        });

        test("should use baseElement for scoped queries", () => {
            const items = container.querySelectorAll(".item");
            expect(items.length).toBe(2);

            const empty = document.createElement("div");
            const noItems = DOMManager.getElement(".item", empty);
            expect(noItems).toBeNull();
        });
    });

    describe("Style Management", () => {
        const testId = "test-style";
        const testCSS = "body { background: red; }";

        afterEach(() => {
            // Clean up any added styles
            const style = document.querySelector(`#${testId}`);
            style?.remove();
        });

        test("should inject and remove style", () => {
            DOMManager.injectStyle(testId, testCSS);
            const style = DOMManager.getElement(`#${testId}`, DOMManager.bdStyles);
            expect(style).not.toBeNull();
            expect((style as HTMLStyleElement).textContent).toBe(testCSS);

            DOMManager.removeStyle(testId);
            const removed = DOMManager.getElement(`#${testId}`, DOMManager.bdStyles);
            expect(removed).toBeNull();
        });

        test("should update existing style", () => {
            DOMManager.injectStyle(testId, testCSS);
            const newCSS = "body { background: blue; }";
            DOMManager.injectStyle(testId, newCSS);

            const style = DOMManager.getElement(`#${testId}`, DOMManager.bdStyles) as HTMLStyleElement;
            expect(style.textContent).toBe(newCSS);
        });
    });

    describe("Theme Management", () => {
        const testId = "test-theme";
        const testCSS = ".theme { color: blue; }";

        afterEach(() => {
            // Clean up any added themes
            const theme = document.querySelector(`#${testId}`);
            theme?.remove();
        });

        test("should inject and remove theme", () => {
            DOMManager.injectTheme(testId, testCSS);
            const theme = DOMManager.getElement(`#${testId}`, DOMManager.bdThemes);
            expect(theme).not.toBeNull();
            expect((theme as HTMLStyleElement).textContent).toBe(testCSS);

            DOMManager.removeTheme(testId);
            const removed = DOMManager.getElement(`#${testId}`, DOMManager.bdThemes);
            expect(removed).toBeNull();
        });

        test("should update existing theme", () => {
            DOMManager.injectTheme(testId, testCSS);
            const newCSS = ".theme { color: red; }";
            DOMManager.injectTheme(testId, newCSS);

            const theme = DOMManager.getElement(`#${testId}`, DOMManager.bdThemes) as HTMLStyleElement;
            expect(theme.textContent).toBe(newCSS);
        });
    });
});
