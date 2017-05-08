//META{"name":"agif"}*//

var agif = function () {};

// Autoplay GIFs
agif.prototype.convert = function (target) {
    // Handle GIF
    $(target).find(".image:has(canvas)").each(function () {
        var image = $(this);
        var canvas = image.children("canvas").first();
        // Replace GIF preview with actual image
        var src = canvas.attr("src");
        if(src !== undefined) {
            image.replaceWith($("<img>", {
                src: canvas.attr("src"),
                width: canvas.attr("width"),
                height: canvas.attr("height"),
            }).addClass("image kawaii-autogif"));
        }
    });

    // Handle GIFV
    $(target).find(".embed-thumbnail-gifv:has(video)").each(function () {
        var embed = $(this);
        var video = embed.children("video").first();
        // Remove the class, embed-thumbnail-gifv, to avoid the "GIF" overlay
        embed.removeClass("embed-thumbnail-gifv").addClass("kawaii-autogif");
        // Prevent the default behavior of pausing the video
        embed.parent().on("mouseout.autoGif", function (event) {
            event.stopPropagation();
        });
        video[0].play();
    });
};

agif.prototype.onMessage = function () {};

agif.prototype.onSwitch = function () {};

agif.prototype.start = function () {
    this.convert(document);
};

agif.prototype.observer = function (e) {
    this.convert(e.target);
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
    return "1.0.0";
};
agif.prototype.getAuthor = function () {
    return "noodlebox";
};
