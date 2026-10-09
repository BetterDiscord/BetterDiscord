import Builtin from "@structs/builtin";

const query = "link[rel=\"stylesheet\"]";

export default new class Performance extends Builtin {
    found = false;
    observer?: MutationObserver;

    isSheet(node: Node): node is HTMLLinkElement {
        return node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).matches(query);
    }

    handleSheet(sheet: CSSStyleSheet) {
        let rules: CSSRuleList | undefined;
        try {rules = sheet.cssRules;}
        catch {/* empty */}

        if (!rules?.length) return;

        for (let index = 0; index < rules.length; index++) {
            const rule = rules[index];

            if (rule instanceof CSSStyleRule) {
                if (!rule.selectorText.includes(":has(.gameOption_")) continue;

                sheet.deleteRule(index);

                this.found = true;
                this.observer?.disconnect();
                this.observer = undefined;

                break;
            }
        }
    }

    handleNode(node: Node) {
        if (!this.isSheet(node)) return;

        if (node.sheet) return this.handleSheet(node.sheet);

        node.addEventListener("load", () => {
            if (this.found) return;

            this.handleSheet((node as HTMLLinkElement).sheet!);
        });
    }

    async initialize() {
        document.querySelectorAll(query).forEach(this.handleNode.bind(this));

        if (this.found) return;

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (let index = 0; index < mutation.addedNodes.length; index++) this.handleNode(mutation.addedNodes[index]);
            }
        });

        this.observer.observe(document.head, {childList: true});
    }
};