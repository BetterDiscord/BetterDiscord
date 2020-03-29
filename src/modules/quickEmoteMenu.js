import {settingsCookie, bdEmotes} from "../0globals";
import DataStore from "./dataStore";
import BDV2 from "./v2";
import Utils from "./utils";
import DOM from "./domtools";

function QuickEmoteMenu() {
    this.switchHandler = this.switchHandler.bind(this);
    this.favContext = this.favContext.bind(this);
}

const insertEmote = function(e) {
    const emote = e.target.getAttribute("title");
    const newTextarea = document.querySelector(`.${BDV2.slateEditorClasses.slateTextArea.split(" ")[0]}`);
    if (newTextarea) {
        const instance = BDV2.getInternalInstance(newTextarea);
        const insert = Utils.getNestedProp(instance, "memoizedProps.children.props.editor.insertText");
        if (insert) insert(` ${emote} `);
    }
    else {
        const ta = Utils.getTextArea();
        Utils.insertText(ta, ta.value.slice(-1) == " " ? ta.value + emote : ta.value + " " + emote);
    }
};

const makeEmote = function(name, url, {click = insertEmote, contextmenu} = {}) {
    const emote = DOM.createElement(`<div class="emote-container"><img class="emote-icon" alt="${name}" src="${url}" title="${name}"></div>`);
    if (click) emote.addEventListener("click", click);
    if (contextmenu) emote.addEventListener("contextmenu", contextmenu);
    return emote;
};

QuickEmoteMenu.prototype.init = function() {
    this.initialized = true;
    this.favoriteEmotes = {};
    const fe = DataStore.getBDData("bdfavemotes");
    if (fe !== "" && fe !== null) this.favoriteEmotes = JSON.parse(atob(fe));

    this.qmeHeader = DOM.createElement(`<div id="bda-qem">`);
    this.twitchButton = DOM.createElement(`<button class="active" id="bda-qem-twitch">Twitch</button>`);
    this.favoriteButton = DOM.createElement(`<button id="bda-qem-favourite">Favorite</button>`);
    this.emojiButton = DOM.createElement(`<button id="bda-qem-emojis">Emojis</buttond>`);
    this.twitchButton.addEventListener("click", this.switchHandler);
    this.favoriteButton.addEventListener("click", this.switchHandler);
    this.emojiButton.addEventListener("click", this.switchHandler);
    this.qmeHeader.append(this.twitchButton, this.favoriteButton, this.emojiButton);


    this.teContainer = DOM.createElement(`<div id="bda-qem-twitch-container"><div class="scroller-wrap scrollerWrap-2lJEkd fade"><div class="scroller scroller-2FKFPG"><div class="emote-menu-inner"></div></div></div></div>`);
    this.teInner = this.teContainer.querySelector(".emote-menu-inner");
    for (const emote in bdEmotes.TwitchGlobal) {
        if (!bdEmotes.TwitchGlobal.hasOwnProperty(emote)) continue;
        this.teInner.append(makeEmote(emote, bdEmotes.TwitchGlobal[emote]));
    }

    this.faContainer = DOM.createElement(`<div id="bda-qem-favourite-container"><div class="scroller-wrap scrollerWrap-2lJEkd fade"><div class="scroller scroller-2FKFPG"><div class="emote-menu-inner"></div></div></div></div>`);
    this.faInner = this.faContainer.querySelector(".emote-menu-inner");
    for (const emote in this.favoriteEmotes) {
        this.faInner.append(makeEmote(emote, this.favoriteEmotes[emote], {contextmenu: this.favContext}));
    }
};

QuickEmoteMenu.prototype.favContext = function(e) {
    e.stopPropagation();
    const container = DOM.query("#app-mount");
    const cmWrap = DOM.createElement(`<div class="layer-v9HyYc da-layer">`);
    const cm = DOM.createElement(`<div class="contextMenu-HLZMGh da-contextMenu bd-context-menu"></div>`);
    cmWrap.append(cm);
    container.append(cmWrap);
    cmWrap.style.top = e.clientY + "px";
    cmWrap.style.left = e.clientX + "px";
    cmWrap.style.zIndex = "1002";
    const removeCM = function(e) {
        if (e && e.keyCode && e.keyCode !== 27) return;
        cmWrap.remove();
        document.removeEventListener("click", removeCM);
        document.removeEventListener("contextmenu", removeCM);
        document.removeEventListener("keyup", removeCM);
    };
    document.addEventListener("click", removeCM);
    document.addEventListener("contextmenu", removeCM);
    document.addEventListener("keyup", removeCM);

    const cmg = DOM.createElement(`<div class="itemGroup-1tL0uz da-itemGroup">`);
    const cmi = DOM.createElement(`<div class="item-1Yvehc itemBase-tz5SeC da-item da-itemBase clickable-11uBi- da-clickable">`);
    cmi.append(DOM.createElement(`<div class="label-JWQiNe da-label">Remove</div>`));
    cmi.addEventListener("click", () => {
        delete this.favoriteEmotes[e.target.getAttribute("title")];
        e.target.parentElement.remove();
        this.saveFavorites();
        removeCM();
    });
    cmg.append(cmi);
    cm.append(cmg);
};

QuickEmoteMenu.prototype.switchHandler = function(e) {
    this.switchQem(e.target.id);
};

QuickEmoteMenu.prototype.switchQem = function(id) {
    this.twitchButton.classList.remove("active");
    this.favoriteButton.classList.remove("active");
    this.emojiButton.classList.remove("active");

    const emojiPicker = DOM.query(".emojiPicker-3m1S-j");
    emojiPicker.style.display = "none";
    this.faContainer.style.display = "none";
    this.teContainer.style.display = "none";

    switch (id) {
        case "bda-qem-twitch":
            this.twitchButton.classList.add("active");
            this.teContainer.style.display = "";
        break;
        case "bda-qem-favourite":
            this.favoriteButton.classList.add("active");
            this.faContainer.style.display = "";
        break;
        case "bda-qem-emojis":
            this.emojiButton.classList.add("active");
            emojiPicker.style.display = "";
            emojiPicker.querySelector("input").focus();
        break;
    }
};

QuickEmoteMenu.prototype.obsCallback = function (elem) {
    if (!this.initialized) return;
    if (!settingsCookie["bda-es-9"]) elem.classList.add("bda-qme-hidden");
    else elem.classList.remove("bda-qme-hidden");

    if (!settingsCookie["bda-es-0"]) return;
    DOM.prependTo(this.qmeHeader, elem);
    elem.append(this.teContainer);
    elem.append(this.faContainer);
    this.switchQem("bda-qem-emojis");
};

QuickEmoteMenu.prototype.favorite = function (name, url) {
    if (!this.favoriteEmotes.hasOwnProperty(name)) this.favoriteEmotes[name] = url;
    this.updateFavorites();
};

QuickEmoteMenu.prototype.saveFavorites = function () {
    DataStore.setBDData("bdfavemotes", btoa(JSON.stringify(this.favoriteEmotes)));
};

QuickEmoteMenu.prototype.updateFavorites = function () {
    this.faInner.innerHTML = "";
    for (const emote in this.favoriteEmotes) this.faInner.append(makeEmote(emote, this.favoriteEmotes[emote], {contextmenu: this.favContext}));
    this.saveFavorites();
};

export default new QuickEmoteMenu();