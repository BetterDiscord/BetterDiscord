//META{"name":"agif"}*//

var agif = function () {};

agif.prototype.convert = function () {
    $(".image canvas").each(function() { 
        var href = $(this).attr("href"); 
        if(href != undefined) { 
            if(href.endsWith(".gif")) {
                $(this).replaceWith('<img src="'+href+'"></img>'); 
            }
        } 
    });
};

agif.prototype.onMessage = function () {
    this.convert();
};
agif.prototype.onSwitch = function () {
    this.convert();
};
agif.prototype.start = function () {
    this.convert();
};

agif.prototype.load = function () {};
agif.prototype.unload = function () {};
agif.prototype.stop = function () {};
agif.prototype.getSettingsPanel = function () {
    return "";
};

agif.prototype.getName = function () {
    return "Autogif";
};
agif.prototype.getDescription = function () {
    return "Autoplay gifs without having to hover.";
};
agif.prototype.getVersion = function () {
    return "0.1.0";
};
agif.prototype.getAuthor = function () {
    return "Jiiks";
};