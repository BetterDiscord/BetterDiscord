/*BDSocket*/

var bdSocket;
var bdws;

function BdWSocket() {
    bdws = this;
}

BdWSocket.prototype.start = function () {
    var self = this;
   /* $.ajax({
        method: "GET",
        url: "https://discordapp.com/api/gateway",
        headers: {
            authorization: localStorage.token.match(/\"(.+)\"/)[1]
        },
        success: function (data) {
            self.open(data.url);
        }
    });*/
};

BdWSocket.prototype.open = function (host) {
    utils.log("Socket Host: " + host);
    try {
        bdSocket = new WebSocket(host);
        bdSocket.onopen = this.onOpen;
        bdSocket.onmessage = this.onMessage;
        bdSocket.onerror = this.onError;
        bdSocket.onclose = this.onClose;
    } catch (err) {
        utils.log(err);
    }
};

BdWSocket.prototype.onOpen = function () {
    utils.log("Socket Open");
    var data = {
        op: 2,
        d: {
            token: JSON.parse(localStorage.getItem('token')),
            properties: JSON.parse(localStorage.getItem('superProperties')),
            v: 3
        }
    };
    bdws.send(data);
};

BdWSocket.prototype.onMessage = function (e) {

    var packet, data, type;
    try {
        packet = JSON.parse(e.data);
        data = packet.d;
        type = packet.t;
    } catch (err) {
        utils.err(err);
        return;
    }

    switch (type) {
    case "READY":
        bdSocket.interval = setInterval(function(){bdws.send({
            op: 1,
            d: Date.now()
        });}, data.heartbeat_interval);
        utils.log("Socket Ready");
        break;
    case "PRESENCE_UPDATE":
        pluginModule.socketEvent("PRESENCE_UPDATE", data);
        break;
    case "TYPING_START":
        pluginModule.socketEvent("TYPING_START", data);
        break;
    case "MESSAGE_CREATE":
        pluginModule.socketEvent("MESSAGE_CREATE", data);
        break;
    case "MESSAGE_UPDATE":
        pluginModule.socketEvent("MESSAGE_UPDATE", data);
        break;
    default:
        break;
    }

};

BdWSocket.prototype.onError = function (e) {
    utils.log("Socket Error - " + e.message);
};

BdWSocket.prototype.onClose = function (e) {
    utils.log("Socket Closed - " + e.code + " : " + e.reason);
    clearInterval(bdSocket.interval);
    bdws.start();
};

BdWSocket.prototype.send = function (data) {
    if (bdSocket.readyState == 1) {
        bdSocket.send(JSON.stringify(data));
    }
};

BdWSocket.prototype.getSocket = function () {
    return bdSocket;
};