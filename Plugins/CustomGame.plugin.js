//META{"name":"customGamePlugin"}*//

function customGamePlugin() {}

customGamePlugin.prototype.load = function() {
};

customGamePlugin.prototype.unload = function() {
};

customGamePlugin.prototype.start = function() {
	return;
    var self = this;
    this.enabled = true;
    this.interval = setInterval(function() {
        self.setPlaying();
    }, 60000);
    this.setPlaying();
};

customGamePlugin.prototype.stop = function() {
	return;
    var gp = this.game;
    this.game = "";
    this.setPlaying();
    this.game = gp;
    clearInterval(this.interval);
    this.enabled = false;
};

customGamePlugin.prototype.getName = function() {
    return "Custom Game";
};

customGamePlugin.prototype.getDescription = function() {
    return "Set custom game as your playing status";
};

customGamePlugin.prototype.getVersion = function() {
    return "1.0";
};

customGamePlugin.prototype.getAuthor = function() {
    return "Jiiks";
};

customGamePlugin.prototype.getSettingsPanel = function() {
    if(this.game == null) this.game = "";
	return '<label for="cgPluginGame">Game: </label> ' + 
           '<input type="text" placeholder="Game.." name="cgPluginGame" id="cgPluginGame" value="'+this.game+'">' + 
           '<button onclick="BdApi.getPlugin(\'Custom Game\').setGame()">Apply</button>';
};

customGamePlugin.prototype.setGame = function(game) {
    if(game == null) {
        game = document.getElementById("cgPluginGame").value;
    }
    this.game = game;
    this.setPlaying();
};

customGamePlugin.prototype.setPlaying = function() {
    if(!this.enabled) return;
    if(this.uid == null) {
    	if($(".account .avatar-small").css("background-image") == undefined)return;
    	this.uid = $(".account .avatar-small").css("background-image").match(/\d+/);
    }

    if(this.game == null) this.game = "";
    
    var minner = $('.channel-members .member[data-reactid*="'+this.uid+'"]').find(".member-inner")
    var mgame = minner.find(".member-game");
    if(this.game != "") {
        if(mgame.length) {
            mgame.find("strong").text(this.game);
        } else {
            minner.append('<div class="member-game"><span>Playing: </span><strong>'+this.game+'</strong></div>');
        }
    } else {
        if(mgame.length) {
            mgame.remove();
        }
    }
    
    BdApi.setPlaying(this.game);
};
