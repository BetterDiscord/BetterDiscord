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
    var self = this;

    var guilds = $(".guilds>li:first-child");

    guilds.after($("<li></li>", {
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

    var panelBase="";
        panelBase += "<div id=\"pubs-container\">";
        panelBase += "  <div id=\"pubs-spinner\">";
        panelBase += "    <span class=\"spinner\" type=\"wandering-cubes\"><span class=\"spinner-inner spinner-wandering-cubes\"><span class=\"spinner-item\"><\/span><span class=\"spinner-item\"><\/span><\/span><\/span>";
        panelBase += "  <\/div>";
        panelBase += "  <div id=\"pubs-header\">";
        panelBase += "    <h2 id=\"pubs-header-title\">Public Servers<\/h2>";
        panelBase += "    <button id=\"sbtn\">Search<\/button>";
        panelBase += "    <input id=\"sterm\" type=\"text\" placeholder=\"Search term...\"\/>";
        panelBase += "  <\/div>";
        panelBase += "  <div class=\"scroller-wrap\">";
        panelBase += "    <div class=\"scroller\">";
        panelBase += "      <div id=\"slist\" class=\"servers-listing\">";
        panelBase += "        ";
        panelBase += "      <\/div>";
        panelBase += "    <\/div>";
        panelBase += "  <\/div>";
        panelBase += "  <div id=\"pubs-footer\">";
        panelBase += "    <div>Server list provided by <a href=\"https:\/\/www.discordservers.com\/\" target=\"_blank\">DiscordServers.com<\/a><\/div>";
        panelBase += "  <\/div>";
        panelBase += "<\/div>";
    this.container = panelBase;

    if($("#bd-pub-li").length < 1) {
        setTimeout(function() {
            self.init();
        }, 250);
    }
};


PublicServers.prototype.show = function () {
    var self = this;
    $("body").append(this.getPanel());

    var dataset = {
        "sort": [{
            "online": "desc"
        }],
        "from": 0,
        "size": 20,
        "query": {
            "filtered": {
                "query": {
                    "match_all": {}
                }
            }
        }
    };

    $("#sbtn").on("click", function() {
        self.search();
    });
    $("#sterm").on("keyup", function(e) {
        if (e.keyCode == 13) {
            self.search();
        }
    });

   this.loadServers(dataset, false);
   var self = this;
    $(document).on("mouseup.bdps",function(e) {
        if(!$("#bd-pub-button").is(e.target) && !$("#pubs-container").is(e.target) && $("#pubs-container").has(e.target).length === 0) {
            self.hide();
        }
    });
};

PublicServers.prototype.hide = function() {
    $("#pubs-container").remove();
    $(document).off("mouseup.bdps");
};

PublicServers.prototype.loadServers = function(dataset, search) {
    var self = this;
    $("#sbtn").prop("disabled", true);
    $("#sterm").prop("disabled", true);
    $("#slist").empty();
    $("#pubs-spinner").show();
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "https://search-discordservers-izrtub5nprzrl76ugyy6hdooe4.us-west-1.es.amazonaws.com/app/_search",
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
                var icode = source.invite_code;
                var html = '<div class="server-row">';
                html += '<div class="server-icon" style="background-image:url(' + source.icon + ')"></div>';
                html += '<div class="server-info server-name">';
                html += '<span>' + source.name + ' by ' + source.owner.name + '</span>';
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
                $("#slist").append(html);
                $("button[data-server-invite-code="+icode+"]").on("click", function(){
                    self.joinServer(icode);
                });
            });
        },
      done: function() {
        $("#pubs-spinner").hide();
        $("#sbtn").prop("disabled", false);
        $("#sterm").prop("disabled", false);
      },
      always: function() {
        $("#pubs-spinner").hide();
        $("#sbtn").prop("disabled", false);
        $("#sterm").prop("disabled", false);
      },
      error: function() {
        $("#pubs-spinner").hide();
        $("#sbtn").prop("disabled", false);
        $("#sterm").prop("disabled", false);
      },
      complete: function() {
        $("#pubs-spinner").hide();
        $("#sbtn").prop("disabled", false);
        $("#sterm").prop("disabled", false);
      }
    });
};

PublicServers.prototype.search = function() {
    var dataset = {
        "sort": [{
            "online": "desc"
        }],
        "from": 0,
        "size": 20,
        "query": {
            "filtered": {
                "query": {
                    "match_all": {}
                }
            }
        }
    };

    var filter = {
        "filter": {
            "and": [{
                "query": {
                    "match_phrase_prefix": {
                        "name": $("#sterm").val()
                    }
                }
            }]
        }
    };

    if ($("#sterm").val()) {
        $.extend(dataset, filter);
    }
    this.loadServers(dataset, true);
};

//Workaround for joining a server
PublicServers.prototype.joinServer = function (code) {
    $(".guilds-add").click();
    $(".action.join .btn").click();
    $(".create-guild-container input").val(code);
    $(".form.join-server .btn-primary").click();
};