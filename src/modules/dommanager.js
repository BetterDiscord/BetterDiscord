export default class DOMManager {

    static get bdHead() { return this.getElement("bd-head"); }
    static get bdBody() { return this.getElement("bd-body"); }
    static get bdStyles() { return this.getElement("bd-styles"); }
    static get bdThemes() { return this.getElement("bd-themes"); }
    static get bdCustomCSS() { return this.getElement("#customcss"); }
    static get bdTooltips() { return this.getElement("bd-tooltips") || this.createElement("bd-tooltips").appendTo(this.bdBody); }
    static get bdModals() { return this.getElement("bd-modals") || this.createElement("bd-modals").appendTo(this.bdBody); }
    static get bdToasts() { return this.getElement("bd-toasts") || this.createElement("bd-toasts").appendTo(this.bdBody); }

    static initialize() {
        this.createElement("bd-head", {target: document.head});
        this.createElement("bd-body", {target: document.body});
        this.createElement("bd-styles", {target: this.bdHead});
        this.createElement("bd-themes", {target: this.bdHead});
        this.createElement("style", {id: "customcss", target: this.bdHead});
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
        const exists = this.getElement(id, this.bdStyles);
        if (exists) exists.remove();
    }

    static injectStyle(id, css) {
        const style = this.getElement(id, this.bdStyles) || this.createElement("style", {id});
        style.textContent = css;
        this.bdStyles.append(style);
    }

    static removeTheme(id) {
        const exists = this.getElement(id, this.bdThemes);
        if (exists) exists.remove();
    }

    static injectTheme(id, css) {
        const style = this.getElement(id, this.bdThemes) || this.createElement("style", {id});
        style.textContent = css;
        this.bdThemes.append(style);
    }

    static updateCustomCSS(css) {
        this.bdCustomCSS.textContent = css;
    }
}