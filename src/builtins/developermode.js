import Builtin from "../structs/builtin";
import {DiscordModules, Strings} from "modules";

export default new class DeveloperMode extends Builtin {
    get name() {return "DeveloperMode";}
    get category() {return "developer";}
    get id() {return "developerMode";}
    get selectorModeID() {return "copySelector";}
    get selectorMode() {return this.get(this.selectorModeID);}

    constructor() {
        super();
        this.enableSelectors = this.enableSelectors.bind(this);
        this.disableSelectors = this.disableSelectors.bind(this);
    }

    enabled() {
        $(document).on("keydown.bdDevmode", (e) => {
            if (e.which === 119 || e.which == 118) {//F8
               this.log("Debugger Activated");
               debugger; // eslint-disable-line no-debugger
            }
        });
        if (this.selectorMode) this.enableSelectors();
        this.selectorCancel = this.registerSetting(this.selectorModeID, this.enableSelectors, this.disableSelectors);
    }

    disabled() {
        $(document).off("keydown.bdDevmode");
        if (this.selectorMode) this.disableSelectors();
        if (this.selectorCancel) this.selectorCancel();
    }

    enableSelectors() {
        $(document).on("contextmenu.bdDevmode", (e) => {
            this.lastSelector = this.getSelector(e.toElement);

            const attach = () => {
               let cm = $(".contextMenu-HLZMGh");
               if (cm.length <= 0) {
                   cm = $("<div class=\"contextMenu-HLZMGh bd-context-menu\"></div>");
                   cm.addClass($(".app, .app-2rEoOp").hasClass("theme-dark") ? "theme-dark" : "theme-light");
                   cm.appendTo(".app, .app-2rEoOp");
                   cm.css("top", e.clientY);
                   cm.css("left", e.clientX);
                   $(document).on("click.bdDevModeCtx", () => {
                       cm.remove();
                       $(document).off(".bdDevModeCtx");
                   });
                   $(document).on("contextmenu.bdDevModeCtx", () => {
                       cm.remove();
                       $(document).off(".bdDevModeCtx");
                   });
                   $(document).on("keyup.bdDevModeCtx", (event) => {
                       if (event.keyCode === 27) {
                           cm.remove();
                           $(document).off(".bdDevModeCtx");
                       }
                   });
               }

               const cmo = $("<div/>", {
                   "class": "itemGroup-1tL0uz"
               });
               const cmi = $("<div/>", {
                   "class": "item-1Yvehc",
                   "click": () => {
                       DiscordModules.ElectronModule.copy(this.lastSelector);
                       cm.hide();
                   }
               }).append($("<span/>", {text: Strings.Collections.settings.developer.copySelector.name}));
               cmo.append(cmi);
               cm.append(cmo);
               if (cm.hasClass("undefined")) cm.css("top",  "-=" + cmo.outerHeight());
            };

            setImmediate(attach);
            e.stopPropagation();
        });
    }

    disableSelectors() {
        $(document).off("contextmenu.bdDevmode");
        $(document).off("contextmenu.bdDevModeCtx");
    }

    getRules(element, css = element.ownerDocument.styleSheets) {
        // return [].concat(...[...css].map(s => [...s.cssRules || []])).filter(r => r && r.selectorText && element.matches(r.selectorText) && r.style.length && r.selectorText.split(", ").length < 8);
        const sheets = [...css].filter(s => !s.href || !s.href.includes("BetterDiscordApp"));
        const rules = sheets.map(s => [...(s.cssRules || [])]).flat();
        const elementRules = rules.filter(r => r && r.selectorText && element.matches(r.selectorText) && r.style.length && r.selectorText.split(", ").length < 8 && !r.selectorText.split(", ").includes("*"));
        return elementRules;
    }

    getSelector(element) {
        if (element.id) return `#${element.id}`;
        const rules = this.getRules(element);
        const latestRule = rules[rules.length - 1];
        if (latestRule) return latestRule.selectorText;
        else if (element.classList.length) return `.${Array.from(element.classList).join(".")}`;
        return `.${Array.from(element.parentElement.classList).join(".")}`;
    }
};