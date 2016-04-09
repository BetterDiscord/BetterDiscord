//META{"name":"dblClickEdit"}*//

var dblClickEdit = function () {};

dblClickEdit.prototype.onMessage = function () {
};
dblClickEdit.prototype.onSwitch = function () {
};
dblClickEdit.prototype.start = function () {
    $(document).on("dblclick.dce", function(e) {
        var target = $(e.target);
        if(target.parents(".message").length > 0) {
            var msg = target.parents(".message").first();
            var opt = msg.find(".btn-option");
            opt.click();
    
            var popout = $(".option-popout");
            if(popout.children().length == 2) {
                popout.children().first().click();
            } else {
                popout.hide();
            }
        }
    });
};

dblClickEdit.prototype.load = function () {};
dblClickEdit.prototype.unload = function () {
    $(document).off("dblclick.dce");
};
dblClickEdit.prototype.stop = function () {
    $(document).off("dblclick.dce");
};
dblClickEdit.prototype.getSettingsPanel = function () {
    return "";
};

dblClickEdit.prototype.getName = function () {
    return "Double click edit";
};
dblClickEdit.prototype.getDescription = function () {
    return "Double click messages to edit them";
};
dblClickEdit.prototype.getVersion = function () {
    return "0.1.0";
};
dblClickEdit.prototype.getAuthor = function () {
    return "Jiiks";
};