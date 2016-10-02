//META{"name":"properTimestamps"}*//

var properTimestamps = function () {};

properTimestamps.prototype.convert = function () {
    $(".timestamp").each(function() {
        var t = $(this);

        if(t.data("24") != undefined) return;

        var text = t.text();
        var matches = /(.*)?at\s+(\d{1,2}):(\d{1,2})\s+(.*)/.exec(text);
        if(matches == null) return false;
        if(matches.length < 5) return false;
        
        var h = parseInt(matches[2]);
        if(matches[4] == "AM") {
            if(h == 12) h -= 12;
        }else if(matches[4] == "PM") {
            if(h < 12) h += 12;
        }
    
        matches[2] = ('0' + h).slice(-2);
        t.text(matches[1] + matches[2] + ":" + matches[3]);
        t.data("24", true);
    });
};

properTimestamps.prototype.onMessage = function () {
    this.convert();
};
properTimestamps.prototype.onSwitch = function () {
    this.convert();
};
properTimestamps.prototype.start = function () {
    this.convert();
};

properTimestamps.prototype.load = function () {};
properTimestamps.prototype.unload = function () {};
properTimestamps.prototype.stop = function () {};
properTimestamps.prototype.getSettingsPanel = function () {
    return "";
};

properTimestamps.prototype.getName = function () {
    return "Proper Timestamps";
};
properTimestamps.prototype.getDescription = function () {
    return "24 hours timestamps";
};
properTimestamps.prototype.getVersion = function () {
    return "0.1.0";
};
properTimestamps.prototype.getAuthor = function () {
    return "Jiiks";
};