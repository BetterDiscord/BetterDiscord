//META{"name":"GuildsScroller"}*//

function GuildsScroller() {}

GuildsScroller.prototype.load = function() {
};

GuildsScroller.prototype.unload = function() {
};

GuildsScroller.prototype.start = function() {
	$(".guilds").wrap('<div class="scroller-wrap fade dark"></div>').wrap('<div class="scroller" style="overflow-x:hidden;"></div>');
};
GuildsScroller.prototype.stop = function() {
    $(".guilds").unwrap().unwrap();
};

GuildsScroller.prototype.update = function() {
};

GuildsScroller.prototype.getName = function() {
    return "Guilds Scrollbar";
};

GuildsScroller.prototype.getDescription = function() {
    return "Adds a scrollbar to guilds/servers list";
};

GuildsScroller.prototype.getVersion = function() {
    return "1.0";
};

GuildsScroller.prototype.getAuthor = function() {
    return "Jiiks";
};