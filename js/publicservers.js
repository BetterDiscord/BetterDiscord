/* BetterDiscordApp PublicSevers JavaScripts
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 14:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

var publicServers = { "servers": { "server": { "code": 0, "icon": null, "title": "title", "language": "EN", "description": "description" } } }; //for ide

function PublicServers() {

}

PublicServers.prototype.getPanel = function() {
    return this.container;
};

PublicServers.prototype.init = function() {

    var self = this;

    this.container = $("<div/>", {
        id: "bd-ps-container",
        style: "display:none"
    });

    var header = $("<div/>", {
        id: "bd-ps-header"
    });

    $("<h2/>", {
        text: "Public Servers"
    }).appendTo(header);

    $("<span/>", {
        id: "bd-ps-close",
        style:"cursor:pointer;",
        text: "X"
    }).appendTo(header);

    header.appendTo(this.getPanel());

    var psbody = $("<div/>", {
        id: "bd-ps-body"
    });

    psbody.appendTo(this.getPanel());

    var table = $("<table/>", {
        border:"0"
    });

    var thead = $("<thead/>");

    thead.appendTo(table);

    var headers = $("<tr/>", {

    }).append($("<th/>", {
        text: "Name"
    })).append($("<th/>", {
        text: "Code"
    })).append($("<th/>", {
        text: "Language"
    })).append($("<th/>", {
        text: "Description"
    })).append($("<th/>", {
        text: "Join"
    }));

    headers.appendTo(thead);

    var tbody = $("<tbody/>", {
        id: "bd-ps-tbody"
    });

    tbody.appendTo(table);

    table.appendTo(psbody);

    $("body").append(this.getPanel());

    $("#bd-ps-close").on("click", function() { self.show(); });

    var servers = publicServers.servers;

    for(var server in servers) {
        if(servers.hasOwnProperty(server)) {
            var s = servers[server];
            var code = s.code;
            var title = s.title;
            var language = s.language;
            var description = s.description;

            this.addServer(server, code, title, language, description);
        }
    }
};

PublicServers.prototype.addServer = function(name, code, title, language, description) {
    var self = this;
    var tableBody = $("#bd-ps-tbody");


    var desc = $("<td/>").append($("<div/>", {
        class: "bd-ps-description",
        text: description
    }));

    var tr = $("<tr/>");

    tr.append($("<td/>", {
        text: title
    }));

    tr.append($("<td/>", {
        css: {
            "-webkit-user-select":"initial",
            "user-select":"initial"
        },
        text: code
    }));

    tr.append($("<td/>", {
        text: language
    }));

    tr.append(desc);

    tr.append($("<td/>").append($("<button/>", {
        text: "Join",
        css: {
            "height": "30px",
            "display": "block",
            "margin-top": "10px",
            "background-color": "#36393E",
            "border": "1px solid #404040",
            "outline": "1px solid #000",
            "color": "#EDEDED"
        },
        click: function() { self.joinServer(code); }
    })));

    tableBody.append(tr);
};

PublicServers.prototype.show = function() {
    this.getPanel().toggle();
    var li = $("#bd-pub-li");
    li.removeClass();
    if(this.getPanel().is(":visible")) {
        li.addClass("active");
    }
};

//Workaround for joining a server
PublicServers.prototype.joinServer = function(code) {
    $(".guilds-add").click();
    $(".action.join .btn").click();
    $(".create-guild-container input").val(code);
    $(".form.join-server .btn-primary").click();
};