const DOMManager = new class DOMManager {
    private bdHead = document.createElement("bd-head");
    private bdStyles = document.createElement("bd-styles");
    private elements = new Map<string, HTMLElement>();

    public documentReady = (async () => {
        if (document.readyState !== "complete") {
            await new Promise(resolve => {
                document.addEventListener("DOMContentLoaded", resolve, {once: true});
            });
        }
    })();

    public createElement(type: string, props: any): HTMLElement {
        const node = document.createElement(type);
        Object.assign(node, props);
        return node;
    }

    public initialize() {
        this.bdHead.appendChild(this.bdStyles);
        
        const callback = () => document.head.appendChild(this.bdHead);
        
        this.documentReady.then(callback);
    }

    public appendStyle(id: string, css: string) {
        const element = this.createElement("style", {
            textContent: css,
            id
        });

        this.elements.set(id, element);
        this.bdStyles.append(element);
    }

    public removeStyle(id: string) {
        const element = this.elements.get(id);

        if (!element) return null;

        element.remove();
        this.elements.delete(id);
    }
};

export default DOMManager;
