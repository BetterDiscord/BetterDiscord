//META{"name":"videoSupport"}*//

var videoSupport = function () {};

videoSupport.prototype.convert = function () {
    $(".message-group a").each(function() {
        var t = $(this);
        var href = t.attr("href");
        if(href == undefined) return true;
        href = href.replace("http", "https");
        if(!href.endsWith(".mp4") && !href.endsWith(".webm") && !href.endsWith(".ogg")) return true;
        var type = "webm";
        if(href.endsWith(".mp4")) type = "mp4";
        if(href.endsWith(".ogg")) type = "ogg";
        
        t.replaceWith( '<video width="480" height="320" controls>' +
                '<source src="'+href+'" type="video/'+type+'">' +
                '</video>');
    });
};

videoSupport.prototype.onMessage = function () {
    this.convert();
};
videoSupport.prototype.onSwitch = function () {
    this.convert();
};
videoSupport.prototype.start = function () {
    this.convert();
};

videoSupport.prototype.load = function () {};
videoSupport.prototype.unload = function () {};
videoSupport.prototype.stop = function () {};
videoSupport.prototype.getSettingsPanel = function () {
    return "";
};

videoSupport.prototype.getName = function () {
    return "Video Support";
};
videoSupport.prototype.getDescription = function () {
    return "Add support for html5 video";
};
videoSupport.prototype.getVersion = function () {
    return "0.1.0";
};
videoSupport.prototype.getAuthor = function () {
    return "Jiiks";
};