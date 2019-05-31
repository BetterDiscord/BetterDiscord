import Builtin, {onSettingChange} from "../structs/builtin";
import {SettingsCookie, Emotes} from "data";
import {DataStore, Utilities, Events} from "modules";

const headerHTML = `<div id="bda-qem">
    <button class="active" id="bda-qem-twitch">Twitch</button>
    <button id="bda-qem-favourite">Favourite</button>
    <button id="bda-qem-emojis">Emojis</buttond>
</div>`;

const twitchEmoteHTML = `<div id="bda-qem-twitch-container">
    <div class="scroller-wrap scrollerWrap-2lJEkd fade">
        <div class="scroller scroller-2FKFPG">
            <div class="emote-menu-inner">

            </div>
        </div>
    </div>
</div>`;

const favoritesHTML = `<div id="bda-qem-favourite-container">
    <div class="scroller-wrap scrollerWrap-2lJEkd fade">
        <div class="scroller scroller-2FKFPG">
            <div class="emote-menu-inner">

            </div>
        </div>
    </div>
</div>`;

const makeEmote = (emote, url, options = {}) => {
    const {onContextMenu, onClick} = options;
    const emoteContainer = $(`<div class="emote-container">
        <img class="emote-icon" alt="${emote}" src="${url}" title="${emote}">
    </div>`)[0];
    if (onContextMenu) emoteContainer.addEventListener("contextmenu", onContextMenu);
    emoteContainer.addEventListener("click", onClick);
    return emoteContainer;
};

export default new class EmoteMenu extends Builtin {
    get name() {return "EmoteMenu";}
    get category() {return "Modules";}
    get id() {return "bda-es-0";}
    get hideEmojisID() {return "bda-es-9";}
    get hideEmojis() {return SettingsCookie[this.hideEmojisID];}

    constructor() {
        super();
        this.lastTab = "bda-qem-emojis";
        this.favoriteEmotes = {};

        this.qmeHeader = $(headerHTML)[0];
        for (const button of this.qmeHeader.getElementsByTagName("button")) button.addEventListener("click", this.switchMenu.bind(this));

        this.teContainer = $(twitchEmoteHTML)[0];
        this.teContainerInner = this.teContainer.querySelector(".emote-menu-inner");

        this.faContainer = $(favoritesHTML)[0];
        this.faContainerInner = this.faContainer.querySelector(".emote-menu-inner");

        this.observer = new MutationObserver(mutations => {for (const mutation of mutations) this.observe(mutation);});
        this.enableHideEmojis = this.enableHideEmojis.bind(this);
        this.disableHideEmojis = this.disableHideEmojis.bind(this);
    }

    initialize() {
        super.initialize();
        const fe = DataStore.getBDData("bdfavemotes");
        if (fe !== "" && fe !== null) this.favoriteEmotes = JSON.parse(atob(fe));
        this.updateFavorites();
    }

    async enabled() {
        await new Promise(resolve => {
            Events.on("emotes-loaded", resolve);
        });
        this.updateTwitchEmotes();
        this.log("Starting to observe");
        this.observer.observe(document.getElementById("app-mount"), {
            childList: true,
            subtree: true
        });
        this.hideEmojiCancel = onSettingChange(this.category, this.hideEmojisID, this.enableHideEmojis, this.disableHideEmojis);
        if (this.hideEmojis) this.enableHideEmojis();
    }

    disabled() {
        this.observer.disconnect();
        this.disableHideEmojis();
        if (this.hideEmojiCancel) this.hideEmojiCancel();
    }

    enableHideEmojis() {
        $(".emojiPicker-3m1S-j").addClass("bda-qme-hidden");
    }

    disableHideEmojis() {
        $(".emojiPicker-3m1S-j").removeClass("bda-qme-hidden");
    }

    insertEmote(emote) {
        const ta = Utilities.getTextArea();
        Utilities.insertText(ta[0], ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    }

    favContext(e) {
        e.stopPropagation();
        const em = e.target.closest(".emote-container").children[0];
        const menu = $(`<div id="removemenu" class="bd-context-menu context-menu theme-dark">Remove</div>`);
        menu.css({
            top: e.pageY - $("#bda-qem-favourite-container").offset().top,
            left: e.pageX - $("#bda-qem-favourite-container").offset().left
        });
        $(em).parent().append(menu);
        menu.on("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            $(em).remove();
            delete this.favoriteEmotes[$(em).attr("title")];
            this.updateFavorites();
            $(document).off("mousedown.emotemenu");
        });
        $(document).on("mousedown.emotemenu", function(e) {
            if (e.target.id == "removemenu") return;
            $("#removemenu").remove();
            $(document).off("mousedown.emotemenu");
        });
    }

    switchMenu(e) {
        let id = typeof(e) == "string" ? e : $(e.target).attr("id");
        if (id == "bda-qem-emojis" && this.hideEmojis) id = "bda-qem-favourite";
        const twitch = $("#bda-qem-twitch");
        const fav = $("#bda-qem-favourite");
        const emojis = $("#bda-qem-emojis");
        twitch.removeClass("active");
        fav.removeClass("active");
        emojis.removeClass("active");

        $(".emojiPicker-3m1S-j").hide();
        $("#bda-qem-favourite-container").hide();
        $("#bda-qem-twitch-container").hide();

        switch (id) {
            case "bda-qem-twitch":
                twitch.addClass("active");
                $("#bda-qem-twitch-container").show();
                break;
            case "bda-qem-favourite":
                fav.addClass("active");
                $("#bda-qem-favourite-container").show();
                break;
            case "bda-qem-emojis":
                emojis.addClass("active");
                $(".emojiPicker-3m1S-j").show();
                $(".emojiPicker-3m1S-j input").focus();
                break;
        }
        if (id) this.lastTab = id;
    }

    observe(mutation) {
        if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) return;
        const node = mutation.addedNodes[0];
        if (!node.classList.contains("popout-3sVMXz") || node.classList.contains("popoutLeft-30WmrD") || !node.getElementsByClassName("emojiPicker-3m1S-j").length) return;

        const e = $(node);
        if (this.hideEmojis) e.addClass("bda-qme-hidden");
        else e.removeClass("bda-qme-hidden");

        e.prepend(this.qmeHeader);
        e.append(this.teContainer);
        e.append(this.faContainer);

        this.switchMenu(this.lastTab);
    }

    favorite(name, url) {
        if (!this.favoriteEmotes.hasOwnProperty(name)) this.favoriteEmotes[name] = url;
        this.updateFavorites();
    }

    updateTwitchEmotes() {
        while (this.teContainerInner.firstChild) this.teContainerInner.firstChild.remove();
        for (const emote in Emotes.TwitchGlobal) {
            if (!Emotes.TwitchGlobal.hasOwnProperty(emote)) continue;
            const url = Emotes.TwitchGlobal[emote];
            const emoteElement = makeEmote(emote, url, {onClick: this.insertEmote.bind(this, emote)});
            this.teContainerInner.append(emoteElement);
        }
    }

    updateFavorites() {
        while (this.faContainerInner.firstChild) this.faContainerInner.firstChild.remove();
        for (const emote in this.favoriteEmotes) {
            const url = this.favoriteEmotes[emote];
            const emoteElement = makeEmote(emote, url, {onClick: this.insertEmote.bind(this, emote), onContextMenu: this.favContext.bind(this)});
            this.faContainerInner.append(emoteElement);
        }
        DataStore.setBDData("bdfavemotes", btoa(JSON.stringify(this.favoriteEmotes)));
    }

};