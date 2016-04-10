/* BetterDiscordApp QuickEmoteMenu JavaScript
 * Version: 1.3
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:49
 * Last Update: 29/08/2015 - 11:46
 * https://github.com/Jiiks/BetterDiscordApp
 */

function QuickEmoteMenu() {

}

QuickEmoteMenu.prototype.init = function() {

    $(document).on("mousedown", function(e) {
        if(e.target.id != "rmenu") $("#rmenu").remove();
    });

    var fe = localStorage["bdfavemotes"];
    if (fe != undefined) {
        this.favoriteEmotes = JSON.parse(atob(fe));
    }

    var qmeHeader="";
    qmeHeader += "<div id=\"bda-qem\">";
    qmeHeader += "    <button class=\"active\" id=\"bda-qem-twitch\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Twitch<\/button>";
    qmeHeader += "    <button id=\"bda-qem-favourite\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Favourite<\/button>";
    qmeHeader += "    <button id=\"bda-qem-emojis\" onclick='quickEmoteMenu.switchHandler(this); return false;'>Emojis<\/buttond>";
    qmeHeader += "<\/div>";
    this.qmeHeader = qmeHeader;

    var teContainer="";
    teContainer += "<div id=\"bda-qem-twitch-container\">";
    teContainer += "    <div class=\"scroller-wrap fade\">";
    teContainer += "        <div class=\"scroller\">";
    teContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in emotesTwitch.emotes) {
        if (emotesTwitch.emotes.hasOwnProperty(emote)) {
            var id = emotesTwitch.emotes[emote].image_id;
            teContainer += "<div class=\"emote-container\">";
            teContainer += "    <img class=\"emote-icon\" id=\""+emote+"\" alt=\"\" src=\"https://static-cdn.jtvnw.net/emoticons/v1/"+id+"/1.0\" title=\""+emote+"\">";
            teContainer += "    </img>";
            teContainer += "</div>";
        }
    }
    teContainer += "            <\/div>";
    teContainer += "        <\/div>";
    teContainer += "    <\/div>";
    teContainer += "<\/div>";
    this.teContainer = teContainer;

    var faContainer="";
    faContainer += "<div id=\"bda-qem-favourite-container\">";
    faContainer += "    <div class=\"scroller-wrap fade\">";
    faContainer += "        <div class=\"scroller\">";
    faContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in this.favoriteEmotes) {
        var url = this.favoriteEmotes[emote];
        faContainer += "<div class=\"emote-container\">";
        faContainer += "    <img class=\"emote-icon\" alt=\"\" src=\""+url+"\" title=\""+emote+"\" oncontextmenu='quickEmoteMenu.favContext(event, this);'>";
        faContainer += "    </img>";
        faContainer += "</div>";
    }
    faContainer += "            <\/div>";
    faContainer += "        <\/div>";
    faContainer += "    <\/div>";
    faContainer += "<\/div>";
    this.faContainer = faContainer;
};

QuickEmoteMenu.prototype.favContext = function(e, em) {
    e.stopPropagation();
    var menu = $('<div/>', { id: "rmenu", "data-emoteid": $(em).prop("title"), text: "Remove" });
    menu.css({
        top: e.pageY - $("#bda-qem-favourite-container").offset().top,
        left: e.pageX - $("#bda-qem-favourite-container").offset().left
    });
    $(em).parent().append(menu);
    menu.on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).remove();
        console.log($(this).data("emoteid"));
        delete quickEmoteMenu.favoriteEmotes[$(this).data("emoteid")];
        quickEmoteMenu.updateFavorites();
        return false;
    });
    return false;
};

QuickEmoteMenu.prototype.switchHandler = function(e) {
    this.switchQem($(e).attr("id"));
};

QuickEmoteMenu.prototype.switchQem = function(id) {
    var twitch = $("#bda-qem-twitch");
    var fav = $("#bda-qem-favourite");
    var emojis = $("#bda-qem-emojis");
    twitch.removeClass("active");
    fav.removeClass("active");
    emojis.removeClass("active");

    $(".emoji-picker").hide();
    $("#bda-qem-favourite-container").hide();
    $("#bda-qem-twitch-container").hide();

    switch(id) {
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
            $(".emoji-picker").show();
        break;
    }
    this.lastTab = id;

    var emoteIcon = $(".emote-icon");
    emoteIcon.off();
    emoteIcon.on("click", function () {
        var emote = $(this).attr("title");
        var ta = $(".channel-textarea-inner textarea");
        ta.val(ta.val().slice(-1) == " " ? ta.val() + emote : ta.val() + " " + emote);
    });
};

QuickEmoteMenu.prototype.obsCallback = function (e) {

    if(!settingsCookie["bda-es-9"]) {
        e.addClass("bda-qme-hidden");
    } else {
        e.removeClass("bda-qme-hidden");
    }

    if(!settingsCookie["bda-es-0"]) return;
    var self = this;

    e.prepend(this.qmeHeader);
    e.append(this.teContainer);
    e.append(this.faContainer);

    if(this.lastTab == undefined) {
        this.lastTab = "bda-qem-favourite";
    } 
    this.switchQem(this.lastTab);
};

QuickEmoteMenu.prototype.favorite = function (name, url) {

    if (!this.favoriteEmotes.hasOwnProperty(name)) {
        this.favoriteEmotes[name] = url;
    }

    this.updateFavorites();
};

QuickEmoteMenu.prototype.updateFavorites = function () {

    var faContainer="";
    faContainer += "<div id=\"bda-qem-favourite-container\">";
    faContainer += "    <div class=\"scroller-wrap fade\">";
    faContainer += "        <div class=\"scroller\">";
    faContainer += "            <div class=\"emote-menu-inner\">";
    for (var emote in this.favoriteEmotes) {
        var url = this.favoriteEmotes[emote];
        faContainer += "<div class=\"emote-container\">";
        faContainer += "    <img class=\"emote-icon\" alt=\"\" src=\""+url+"\" title=\""+emote+"\" oncontextmenu='quickEmoteMenu.favContext(event, this);'>";
        faContainer += "    </img>";
        faContainer += "</div>";
    }
    faContainer += "            <\/div>";
    faContainer += "        <\/div>";
    faContainer += "    <\/div>";
    faContainer += "<\/div>";
    this.faContainer = faContainer;

    $("#bda-qem-favourite-container").replaceWith(faContainer);

    window.localStorage["bdfavemotes"] = btoa(JSON.stringify(this.favoriteEmotes));
};