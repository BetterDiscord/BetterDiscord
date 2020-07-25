import Builtin from "../../structs/builtin";
import {DOM, DiscordModules, Strings} from "modules";

export default new class DeveloperMode extends Builtin {
    get name() {return "DeveloperMode";}
    get category() {return "developer";}
    get id() {return "developerMode";}
    get selectorModeID() {return "copySelector";}
    get selectorMode() {return this.get(this.selectorModeID);}

    constructor() {
        super();
        this.copySelectorListener = this.copySelectorListener.bind(this);
    }

    enabled() {
        document.addEventListener("contextmenu", this.copySelectorListener);
    }

    disabled() {
        document.removeEventListener("contextmenu", this.copySelectorListener);
    }

    copySelectorListener(ctxEvent) {
        ctxEvent.stopPropagation();
        const selector = this.getSelector(ctxEvent.target);
        function attach() {
            let cm = DOM.query(".contextMenu-HLZMGh");
            if (!cm) {
                const container = DOM.query("#app-mount");
                const cmWrap = DOM.createElement(`<div class="layer-v9HyYc da-layer">`);
                cm = DOM.createElement(`<div class="contextMenu-HLZMGh da-contextMenu bd-context-menu"></div>`);
                cmWrap.append(cm);
                container.append(cmWrap);
                cmWrap.style.top = ctxEvent.clientY + "px";
                cmWrap.style.left = ctxEvent.clientX + "px";
                cmWrap.style.zIndex = "1002";
                const removeCM = function(removeEvent) {
                    if (removeEvent.keyCode && removeEvent.keyCode !== 27) return;
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
            cmi.append(DOM.createElement(`<div class="label-JWQiNe da-label">${Strings.Developer.copySelector}</div>`));
            cmi.addEventListener("click", () => {
                DiscordModules.ElectronModule.copy(selector);
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
        const sheets = [...css].filter(s => !s.href || !s.href.includes("BetterDiscordApp"));
        const rules = sheets.map(s => [...(s.cssRules || [])]).flat();
        const elementRules = rules.filter(r => r && r.selectorText && element.matches(r.selectorText) && r.style.length && r.selectorText.split(", ").length < 8 && !r.selectorText.split(", ").includes("*"));
        return elementRules;
    }
};