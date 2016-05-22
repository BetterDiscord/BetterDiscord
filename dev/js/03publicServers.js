/* BetterDiscordApp PublicSevers JavaScripts
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 14:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

function PublicServers() {

}

PublicServers.prototype.getPanel = function () {
    return this.container;
};

PublicServers.prototype.init = function () {
    this.filtered = ["134680912691462144", "86004744966914048"];
    this.bdServer = null;
    this.loadingServers = false;
    var self = this;

    var guilds = $(".guilds>:first-child");

    guilds.after($("<div></div>", {
        class: "guild",
        id: "bd-pub-li",
        css: {
            "height": "20px",
            "display": settingsCookie["bda-gs-1"] == true ? "" : "none"
        }
    }).append($("<div/>", {
        class: "guild-inner",
        css: {
            "height": "20px",
            "border-radius": "4px"
        }
    }).append($("<a/>").append($("<div/>", {
        css: {
            "line-height": "20px",
            "font-size": "12px"
        },
        text: "public",
        id: "bd-pub-button"
    })))));

    $("#bd-pub-button").on("click", function () {
        self.show();
    });


    var panelBase = '\
        <div id="pubs-container">\
            <div id="pubs-spinner">\
                <span class="spinner" type="wandering-cubes">\
                    <span class="spinner-inner spinner-wandering-cubes">\
                        <span class="spinner-item"></span>\
                        <span class="spinner-item"></span>\
                    </span>\
                </span>\
            </div>\
            <div id="pubs-header">\
                <h2 id="pubs-header-title">Public Servers</h2>\
                <button id="pubs-searchbtn">Search</button>\
                <input id="pubs-sterm" type="text" placeholder="Search Term...">\
                <div id="pubs-select-dropdown" class="bd-dropdown">\
                    <button class="bd-dropdown-select" id="pubs-cat-select">All</button>\
                    <div class="bd-dropdown-list">\
                        <ul>\
                            <li class="pubs-cat-select-li" data-val="all">All</li>\
                            <li class="pubs-cat-select-li" data-val="1">FPS Games</li>\
                            <li class="pubs-cat-select-li" data-val="2">MMO Games</li>\
                            <li class="pubs-cat-select-li" data-val="3">MOBA Games</li>\
                            <li class="pubs-cat-select-li" data-val="4">Strategy Games</li>\
                            <li class="pubs-cat-select-li" data-val="5">Sports Games</li>\
                            <li class="pubs-cat-select-li" data-val="6">Puzzle Games</li>\
                            <li class="pubs-cat-select-li" data-val="7">Retro Games</li>\
                            <li class="pubs-cat-select-li" data-val="8">Party Games</li>\
                            <li class="pubs-cat-select-li" data-val="9">Tabletop Games</li>\
                            <li class="pubs-cat-select-li" data-val="10">Sandbox Games</li>\
                            <li class="pubs-cat-select-li" data-val="11">Community</li>\
                            <li class="pubs-cat-select-li" data-val="12">Language</li>\
                            <li class="pubs-cat-select-li" data-val="13">Programming</li>\
                            <li class="pubs-cat-select-li" data-val="14">Other</li>\
                            <li class="pubs-cat-select-li" data-val="15">Simulation Games</li>\
                        </ul>\
                    </div>\
                </div>\
            </div>\
            <div class="server-row server-pinned" style="display:none;">\
                <div class="server-icon" style="background-image:url(https://cdn.discordapp.comi/cons/86004744966914048/6e5729ed5c12d5af558d80d7a194c3f9.jpg)"></div>\
                <div class="server-info server-name"><span>BetterDiscord</span><span id="server-bd-tag">Official BetterDiscord server</span></div>\
                <div class="server-info server-members"><span></span></div>\
                <div class="server-info server-region"><span></span></div>\
                <div class="server-info">\
                    <button data-server-invite-code="0Tmfo5ZbORCRqbAd">Join</button>\
                </div>\
            </div>\
            <div class="scroller-wrap">\
                <div class="scroller" id="pubs-scroller">\
                    <div id="pubs-list" class="servers-listing">\
                    </div>\
                    <div style="background:#FFF; padding: 5px 0; display:none;" id="pubs-spinner-bottom">\
                        <div>\
                            <span class="spinner" type="wandering-cubes">\
                                <span class="spinner-inner spinner-wandering-cubes">\
                                    <span class="spinner-item"></span>\
                                    <span class="spinner-item"></span>\
                                </span>\
                            </span>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id="pubs-footer">\
                <span style="color:#FFF; font-size:10px; font-weight:700; margin-left:5px;">Tip: Hover over server name for description if available</span>\
                <div>Server list provided by <a href="https://discordservers.com" target="_blank">DiscordServers.com</a></div>\
            </div>\
        ';

    this.container = panelBase;

    if($("#bd-pub-li").length < 1) {
        setTimeout(function() {
            self.init();
        }, 250);
    }
};

PublicServers.prototype.getPinnedServer = function() {
    var self = this;
    var dataset = {
        "sort": [{"online": "desc"}],
        "size": 1,
        "query": {
            "query_string": {
            "default_operator": "AND",
            "query": "BetterDiscord"
            }
        }
    };
    
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "https://search-discordservers-izrtub5nprzrl76ugyy6hdooe4.us-west-1.es.amazonaws.com/discord_servers/_search",
        crossDomain: true,
        data: JSON.stringify(dataset),
        success: function(data) {
            try {
                var s = data.hits.hits[0]._source;
                if(s.identifier == "86004744966914048") {
                    self.bdServer = s;
                    self.showPinnedServer();
                }
            }catch(err) {
                self.bdServer = null;
            }
        }
    });
};

PublicServers.prototype.hidePinnedServer = function() {
    $("#pubs-container .scroller-wrap").css({"margin-top": "0", "height": "500px"});
    $(".server-pinned").hide();
};

PublicServers.prototype.showPinnedServer = function() {
    $(".server-pinned .server-icon").css("background-image", "url("+this.bdServer.icon+")");
    $(".server-pinned .server-members span").text(this.bdServer.online + "/"+this.bdServer.members+" Members");
    $(".server-pinned .server-region span").text(this.bdServer.region);
    $(".server-pinned .server-info button").data("server-invite-code", this.bdServer.invite_code);
    $("#pubs-container .scroller-wrap").css({"margin-top": "75px", "height": "425px"});
    $(".server-pinned").show();
};

PublicServers.prototype.show = function () {
    var self = this;
    this.hidePinnedServer();
    $("#pubs-cat-select").text("All");
    this.selectedCategory = "all";
    $("#pubs-container .scroller-wrap").css({"margin-top": "0", "height": "500px"});
    $(".server-pinned").hide();
    
    $(".app").append(this.getPanel());
    
    if(this.bdServer == null) {
        this.getPinnedServer();
    } else {
        this.showPinnedServer();
    }

    self.search(0, true);

    $("#pubs-searchbtn").off("click").on("click", function() {
        self.search();
    });
    $("#pubs-sterm").off("keyup").on("keyup", function(e) {
        if (e.keyCode == 13) {
            self.search(0, true);
        }
    });
    $("#pubs-cat-select").off("click").on("click", function() {
        $("#pubs-select-dropdown").addClass("open");
    });
    $(".pubs-cat-select-li").off("click").on("click", function() {
        $("#pubs-select-dropdown").removeClass("open");
        $("#pubs-cat-select").text($(this).text());
        if(self.selectedCategory != $(this).data("val")) {
            self.selectedCategory = $(this).data("val");
            self.search(0, true);
        }
    });
    $("#pubs-container").off("mouseup").on("mouseup", function() {
        $("#pubs-select-dropdown").removeClass("open");
    });

   var self = this;
    $(document).on("mouseup.bdps",function(e) {
        if(!$("#bd-pub-button").is(e.target) && !$("#pubs-container").is(e.target) && $("#pubs-container").has(e.target).length === 0) {
            self.hide();
        }
    });

    $("#pubs-scroller").off("scroll.pubs").on("scroll.pubs", function() {
        if(self.loadingServers) return;
        var list = $("#pubs-list");
        if($(this).scrollTop() + 550 < list.height()) return;
        if(list.children().length % 20 != 0) return;

        self.loadingServers = true;
        $("#pubs-spinner-bottom").show();
        self.search(list.children().length, false);
    });
};

PublicServers.prototype.hide = function() {
    $("#pubs-container").remove();
    $(document).off("mouseup.bdps");
};


PublicServers.prototype.loadServers = function(dataset, search, clear) {
    this.loadingServers = true;
    var self = this;
    $("#pubs-searchbtn").prop("disabled", true);
    $("#pubs-sterm").prop("disabled", true);
    if(clear) $("#pubs-list").empty();
    $("#pubs-spinner").show();
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "https://search-discordservers-izrtub5nprzrl76ugyy6hdooe4.us-west-1.es.amazonaws.com/discord_servers/_search",
        crossDomain: true,
        data: JSON.stringify(dataset),
        success: function(data) {
            var hits = data.hits.hits;
            
            if(search) {
              $("#pubs-header-title").text("Public Servers - Search Results: " + hits.length);
            } else {
              $("#pubs-header-title").text("Public Servers");
            }

            hits.forEach(function(hit) {
                var source = hit._source;
                var icode = source.invite_code.replace(/ /g,'');
                var html = '<div class="server-row">';
                html += '<div class="server-icon" style="background-image:url(' + source.icon + ')"></div>';
                html += '<div class="server-info server-name">';
                html += '<div class="server-information">';
                
                if(source.is_official) {
                    html += '<span class="server-official">Official!</span>';
                }

                html += '<span class="server-name-span">' + source.name + '</span>';
                
                var tags = [];
                source.categories.forEach(function(tag) {
                    tags.push(tag.name);
                });

                html += '<span class="server-tags">'+tags.join(", ")+'</span>';
                html += '<span class="server-description">'+(source.description == undefined ? "No Description" : source.description)+'</span>';
                html += '</div>';
                html += '</div>';
                html += '<div class="server-info server-members">';
                html += '<span>' + source.online + '/' + source.members + ' Members</span>';
                html += '</div>';
                html += '<div class="server-info server-region">';
                html += '<span>' + source.region + '</span>';
                html += '</div>';
                html += '<div class="server-info">';
                html += '<button data-server-invite-code='+icode+'>Join</button>';
                html += '</div>';
                html += '</div>';
                $("#pubs-list").append(html);
                $("button[data-server-invite-code="+icode+"]").on("click", function(){
                    self.joinServer(icode);
                });
            });

            if(search) {
              $("#pubs-header-title").text("Public Servers - Search Results: " + $("#pubs-list").children().length);
            }
        },
      done: function() {
        $("#pubs-spinner").hide();
        $("#pubs-spinner-bottom").hide();
        $("#pubs-searchbtn").prop("disabled", false);
        $("#pubs-sterm").prop("disabled", false);
        self.loadingServers = false;
      },
      always: function() {
        $("#pubs-spinner").hide();
        $("#pubs-spinner-bottom").hide();
        $("#pubs-searchbtn").prop("disabled", false);
        $("#pubs-sterm").prop("disabled", false);
        self.loadingServers = false;
      },
      error: function() {
        $("#pubs-spinner").hide();
        $("#pubs-spinner-bottom").hide();
        $("#pubs-searchbtn").prop("disabled", false);
        $("#pubs-sterm").prop("disabled", false);
        self.loadingServers = false;
      },
      complete: function() {
        $("#pubs-spinner").hide();
        $("#pubs-spinner-bottom").hide();
        $("#pubs-searchbtn").prop("disabled", false);
        $("#pubs-sterm").prop("disabled", false);
        self.loadingServers = false;
      }
    });
};

PublicServers.prototype.search = function(start, clear) {
    var sterm = $("#pubs-sterm").val();
    
    var dataset = {
        "sort": [{ "online": "desc" }],
        "from": start,
        "size": 20,
        "query": {
            "filtered": {
                "query": {
                    "query_string": {
                        "default_operator": "AND",
                        "query": sterm ? sterm : "*"
                    }
                },
                "filter": {
                    "bool": {
                        "must_not": [{
                            "terms": {
                                "identifier": this.filtered
                            }
                        }]
                    }
                }
            }
        }
    };
    if(this.selectedCategory != "all") {
        dataset.query.filtered.filter.bool.must = [{ "term": { "categories.id": this.selectedCategory } }]
    }
    
    this.loadServers(dataset, true, clear);
};

//Workaround for joining a server
PublicServers.prototype.joinServer = function (code) {
    $(".guilds-add").click();
    $(".action.join .btn").click();
    $(".create-guild-container input").val(code);
    $(".form.join-server .btn-primary").click();
};