export default class DOMManager {

    static get bdHead() {return this.getElement("bd-head");}
    static get bdBody() {return this.getElement("bd-body");}
    static get bdScripts() {return this.getElement("bd-scripts");}
    static get bdStyles() {return this.getElement("bd-styles");}
    static get bdThemes() {return this.getElement("bd-themes");}
    static get bdCustomCSS() {return this.getElement("#customcss");}
    static get bdTooltips() {return this.getElement("bd-tooltips") || this.createElement("bd-tooltips").appendTo(this.bdBody);}
    static get bdModals() {return this.getElement("bd-modals") || this.createElement("bd-modals").appendTo(this.bdBody);}
    static get bdToasts() {return this.getElement("bd-toasts") || this.createElement("bd-toasts").appendTo(this.bdBody);}

    static initialize() {
        // this.createElement("bd-head", {target: document.head});
        // this.createElement("bd-body", {target: document.body});
        // this.createElement("bd-scripts", {target: this.bdHead});
        // this.createElement("bd-styles", {target: this.bdHead});
        // this.createElement("bd-themes", {target: this.bdHead});
        // this.createElement("style", {id: "customcss", target: this.bdHead});
    }

    static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
    }

    static getElement(e, baseElement = document) {
        if (e instanceof Node) return e;
        return baseElement.querySelector(e);
    }

    static createElement(tag, options = {}) {
        const {className, id, target} = options;
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (id) element.id = id;
        if (target) this.getElement(target).append(element);
        return element;
    }

    static removeStyle(id) {
        id = this.escapeID(id);
        const exists = this.getElement(`#${id}`, this.bdStyles);
        if (exists) exists.remove();
    }

    static injectStyle(id, css) {
        id = this.escapeID(id);
        const style = this.getElement(`#${id}`, this.bdStyles) || this.createElement("style", {id});
        style.textContent = css;
        this.bdStyles.append(style);
    }

    static unlinkStyle(id) {
        return this.removeStyle(id);
    }

    static linkStyle(id, url, {documentHead = false} = {}) {
        id = this.escapeID(id);
        return new Promise(resolve => {
            const link = this.getElement(`#${id}`, this.bdStyles) || this.createElement("link", {id});
            link.rel = "stylesheet";
            link.href = url;
            link.onload = resolve;
            const target = documentHead ? document.head : this.bdStyles;
            target.append(link);
        });
    }

    static removeTheme(id) {
        id = this.escapeID(id);
        const exists = this.getElement(`#${id}`, this.bdThemes);
        if (exists) exists.remove();
    }

    static injectTheme(id, css) {
        id = this.escapeID(id);
        const style = this.getElement(`#${id}`, this.bdThemes) || this.createElement("style", {id});
        style.textContent = css;
        this.bdThemes.append(style);
    }

    static updateCustomCSS(css) {
        this.bdCustomCSS.textContent = css;
    }

    static removeScript(id) {
        id = this.escapeID(id);
        const exists = this.getElement(`#${id}`, this.bdScripts);
        if (exists) exists.remove();
    }

    static injectScript(id, url) {
        id = this.escapeID(id);
        return new Promise((resolve, reject) => {
            const script = this.getElement(`#${id}`, this.bdScripts) || this.createElement("script", {id});
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            this.bdScripts.append(script);
        });
    }
}

DOMManager.createElement("bd-head", {target: document.head});
DOMManager.createElement("bd-body", {target: document.body});
DOMManager.createElement("bd-scripts", {target: DOMManager.bdHead});
DOMManager.createElement("bd-styles", {target: DOMManager.bdHead});
DOMManager.createElement("bd-themes", {target: DOMManager.bdHead});
DOMManager.createElement("style", {id: "customcss", target: DOMManager.bdHead});