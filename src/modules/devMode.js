import {settingsCookie} from "../0globals";
import BDV2 from "./v2";
import DOM from "./domtools";

export default new class DevMode {
    constructor() {
        this.debugListener = this.debugListener.bind(this);
        this.copySelectorListener = this.copySelectorListener.bind(this);
    }

    start() {
        this.startDebugListener();
        if (settingsCookie["fork-dm-1"]) this.startCopySelector();
    }
    
    stop() {
        this.stopDebugListener();
        this.stopCopySelector();
    }

    startDebugListener() {
        this.stopDebugListener();
        document.addEventListener("keydown", this.debugListener);
    }

    stopDebugListener() {
        document.removeEventListener("keydown", this.debugListener);
    }

    startCopySelector() {
        this.stopCopySelector();
        document.addEventListener("contextmenu", this.copySelectorListener);
    }

    stopCopySelector() {
        document.removeEventListener("contextmenu", this.copySelectorListener);
    }

    debugListener(e) {
        if (e.which === 119 || e.which == 118) {//F8
            console.log("%c[%cDevMode%c] %cBreak/Resume", "color: red;", "color: #303030; font-weight:700;", "color:red;", "");
            debugger; // eslint-disable-line no-debugger
            e.preventDefault();
            e.stopImmediatePropagation();
         }
    }

    copySelectorListener(e) {
        e.stopPropagation();
        const selector = this.getSelector(e.target);
        function attach() {
            let cm = DOM.query(".contextMenu-HLZMGh");
            if (!cm) {
                const container = DOM.query("#app-mount");
                const cmWrap = DOM.createElement(`<div class="layer-v9HyYc da-layer">`);
                cm = DOM.createElement(`<div class="contextMenu-HLZMGh da-contextMenu bd-context-menu"></div>`);
                cmWrap.append(cm);
                container.append(cmWrap);
                cmWrap.style.top = e.clientY + "px";
                cmWrap.style.left = e.clientX + "px";
                cmWrap.style.zIndex = "1002";
                const removeCM = function(e) {
                    if (e.keyCode && e.keyCode !== 27) return;
                    cmWrap.remove();
                    document.removeEventListener("click", removeCM);
                    document.removeEventListener("contextmenu", removeCM);
                    document.removeEventListener("keyup", removeCM);
                };
                document.addEventListener("click", removeCM);
                document.addEventListener("contextmenu", removeCM);
                document.addEventListener("keyup", removeCM);
            }

            const cmg = DOM.createElement(`<div class="itemGroup-1tL0uz da-itemGroup">`);
            const cmi = DOM.createElement(`<div class="item-1Yvehc itemBase-tz5SeC da-item da-itemBase clickable-11uBi- da-clickable">`);
            cmi.append(DOM.createElement(`<div class="label-JWQiNe da-label">Copy Selector</div>`));
            cmi.addEventListener("click", () => {
                BDV2.NativeModule.copy(selector);
                cm.style.display = "none";
            });
            cmg.append(cmi);
            cm.append(cmg);
        }

        setImmediate(attach);
    }

    getSelector(element) {
        if (element.id) return `#${element.id}`;
        const rules = this.getRules(element);
        const latestRule = rules[rules.length - 1];
        if (latestRule) return latestRule.selectorText;
        else if (element.classList.length) return `.${Array.from(element.classList).join(".")}`;
        return `.${Array.from(element.parentElement.classList).join(".")}`;
    }

    getRules(element, css = element.ownerDocument.styleSheets) {
        //if (window.getMatchedCSSRules) return window.getMatchedCSSRules(element);
        const sheets = [...css].filter(s => !s.href || !s.href.includes("BetterDiscordApp"));
        const rules = sheets.map(s => [...(s.cssRules || [])]).flat();
        const elementRules = rules.filter(r => r && r.selectorText && element.matches(r.selectorText) && r.style.length && r.selectorText.split(", ").length < 8 && !r.selectorText.split(", ").includes("*"));
        return elementRules;
    }
};