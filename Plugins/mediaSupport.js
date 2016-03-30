//META{"name":"mediaSupport"}*//

var mediaSupport = function () {};

mediaSupport.prototype.convert = function () {
    $(".message a").each(function() {
        var t = $(this);
        var href = t.attr("href");
        if(href == undefined) return true;
        href = href.replace("http:", "https:");
        if(!href.endsWith(".mp4") && !href.endsWith(".webm") && !href.endsWith(".ogg") && !href.endsWith(".mp3") && !href.endsWith(".wav")) return true;
        var video = true;
        var type = "webm";
        if(href.endsWith(".mp4")) type = "mp4";
        if(href.endsWith(".ogg")) type = "ogg";
        if(href.endsWith(".mp3")) {
            type = "mpeg";
            video = false;
        }
        if(href.endsWith(".wav")) {
            type = "wav";
            video = false;
        }
        
        if(video) {
            t.replaceWith('<video width="480" height="320" src="'+href+'" type="video/'+type+'" controls></video>');
        } else {
            t.replaceWith('<audio src="'+href+'" type="audio/'+type+'" controls></audio>');
        }
    });
};

mediaSupport.prototype.onMessage = function () {
    setTimeout(this.convert(), 2000);
};
mediaSupport.prototype.onSwitch = function () {
    this.convert();
};
mediaSupport.prototype.start = function () {
    this.convert();
};

mediaSupport.prototype.load = function () {};
mediaSupport.prototype.unload = function () {};
mediaSupport.prototype.stop = function () {};
mediaSupport.prototype.getSettingsPanel = function () {
    return "";
};

mediaSupport.prototype.getName = function () {
    return "Media Support";
};
mediaSupport.prototype.getDescription = function () {
    return "Add support for html5 media";
};
mediaSupport.prototype.getVersion = function () {
    return "0.1.0";
};
mediaSupport.prototype.getAuthor = function () {
    return "Jiiks";
};