//META{"name":"emoteBlacklist"}*//

var emoteBlacklist = function () {};

emoteBlacklist.prototype.onMessage = function () {
};
emoteBlacklist.prototype.onSwitch = function () {
};
emoteBlacklist.prototype.start = function () {
    window.ebEnabled = true;
    var self = this;
    var em = localStorage["emoteBlacklist"];
    if(em == undefined) return;
    JSON.parse(em).forEach(function(emote) {
        self.remove(emote);
        self.add(emote);
    });
};
emoteBlacklist.prototype.add = function(emote) {
    window.bemotes.push(emote);
};
emoteBlacklist.prototype.remove = function(emote) {
    var index = bemotes.indexOf(emote);
    if(index > -1) {
        window.bemotes.splice(index, 1);
    }
}

emoteBlacklist.prototype.load = function () {};
emoteBlacklist.prototype.unload = function () {
};
emoteBlacklist.prototype.stop = function () {
    window.ebEnabled = false;
    this.clear();
};
emoteBlacklist.prototype.clear = function() {
    var self = this;
    var em = localStorage["emoteBlacklist"];
    if(em == undefined) return;
    var em = JSON.parse(em);
    em.forEach(function(emote) {
        self.remove(emote);
    });
};
emoteBlacklist.prototype.getSettingsPanel = function () {
    var em = localStorage["emoteBlacklist"];

    var html = '';
    html += '<h2>Emote Blacklist</2>';
    html += '<textarea id="emoteBlistTa" style="width:100%; min-height:200px;">';
    if(em != undefined) {
        JSON.parse(em).forEach(function(item) { 
            html += item + "\n";
        });
    }
    html += '</textarea>';
    html += '<button onclick="emoteBlacklist.prototype.save()">Save</button>';
    html += '<span>Add emote names here to blacklist(1 per line)</span>';
    return html;
};
emoteBlacklist.prototype.save = function() {
    this.clear();
    var blist = [];
    $("#emoteBlistTa").val().split("\n").forEach(function(item) { 
        blist.push(item);
    });
    localStorage["emoteBlacklist"] = JSON.stringify(blist);
    if(window.ebEnabled) {
        this.start();
    }
};

emoteBlacklist.prototype.getName = function () {
    return "Emote Blacklist";
};
emoteBlacklist.prototype.getDescription = function () {
    return "Blacklist emotes locally";
};
emoteBlacklist.prototype.getVersion = function () {
    return "0.1.0";
};
emoteBlacklist.prototype.getAuthor = function () {
    return "Jiiks";
};