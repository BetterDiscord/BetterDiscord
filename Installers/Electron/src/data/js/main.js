'use strict';

const ipcRenderer = require('electron').ipcRenderer;

var config = {
    urls: {
        package: "https://github.com/Jiiks/BetterDiscordApp/archive/stable16.zip",
        finish: "https://betterdiscord.net/installed"
    },
    discord: {
        lastKnownVersion: "0.0.291"
    },
    import: "BetterDiscordApp-stable16",
    cache: [
        "emotes_bttv.json",
        "emotes_bttv_2.json",
        "emotes_ffz.json",
        "emotes_twitch_global.json",
        "emotes_twitch_subscriber.json",
        "user.json"
    ]
};

(function() {
    //Pass latest config to core application
    ipcSendAsync("config", config);
    //Get Discord installation path
    ipcSendAsync("get",  "discordpath" );
    //Get BetterDiscord installation path
    ipcSendAsync("get", "libpath");
})();


//Listeners
(function() {

    $("#cd").on("change", () => {
        $("#next").prop("disabled", !$("#cd").prop("checked"));
    });

    var currentPanel = 0;

    function switchPanel() {
        var container = $(".panel-container");
        var main = $(".main-container");
        main.removeClass();
        main.addClass(`main-container panel-${currentPanel}`)
        switch(currentPanel) {
          case 0:
            $("#next").text("Next");
            //$("#next").prop("disabled", !$("#cd").prop("checked"));
            break;
          case 1:
            $("#next").text("Next");
            //$("#next").prop("disabled", !$("#accept").prop("checked"));
            break;
          case 2:
            $("#next").text("Install");
            $("#cancel").text("Cancel");
            break;
          case 3:
            $("#cancel").text("Abort");
            ipcSendAsync("install");
            break;
        }
    }

    $("#next").on("click", function() {
        currentPanel++;
        switchPanel();
    });

    $("#back").on("click", function() {
        currentPanel--;
        switchPanel();
    });

    $("#cancel").on("click", function() {
        $("#quit").show();
    });

    $("#uninstall").on("click", function() {

    });

    $("#accept").on("change", function() {
       // $("#next").prop("disabled", !$(this).prop("checked"));
    });

    $("#decline").on("change", function() {
       // $("#next").prop("disabled", $(this).prop("checked"));
    });

    $("#licensetext").on("scroll", function() {
        var e = $(this);
        if(e.height() + e.scrollTop() >= e[0].scrollHeight) {
          $("#accept").prop("disabled", false);
        } else {
          $("#accept").prop("disabled", true);
          $("#decline").prop("checked", true)
         // $("#next").prop("disabled", true);
        }
    });

    $(".modal").on("click", function(e) {
        if(e.target.className !== "modal") return;
        $(this).hide();
    });

    $("#modal-cancel").on("click", function() {
        $(".modal").hide();
    });

    $("#modal-exit").on("click", function() {
        ipcRenderer.send("async", {arg: "quit", data: []});
    });

    $("#path").on("click", () => {
        ipcRenderer.send("async", { arg: "browsedialog", data: "discordpath" });
    });

    $("#libpathbtn").on("click", () => {
        ipcRenderer.send("async", { arg: "browsedialog", data: "libpath" });
    });

    $("#advanced-settings").on("click", function() {
        currentPanel = "advanced";
        switchPanel();
    });

    $("#advanced-close").on("click", function() {
        var main = $(".main-container");
        currentPanel = 2;
        switchPanel();
    });

})();

ipcRenderer.on("async-reply", (event, arg) => {

    var data = arg.data;
    arg = arg.arg;

    switch(arg) {
        case "discordpath":
            $("#discordPath").val(data);
            break;
        case "libpath":
            $("#libpath").val(data);
            break;
    }

});


/*ipcRenderer.on('async-reply', (event, arg) => {
  switch(arg.arg) {
    case "exists":
      switch(arg.file) {
        case "install":
          if(arg.exists) {
            appendLog("Located app package");
            appendLog("Downloading latest BetterDiscord package");
            ipcRenderer.send('async', '{"arg": "download", "package": "https://github.com/Jiiks/BetterDiscordApp/archive/stable16.zip" }');
          } else {
            appendLog("Unable to locate app.asar. Check your install path.");
          }
      }
    break;
    case "discordpath": 
      $("#discordPath").val(arg.path);
    break;
    case "locate-app.asar":
      appendLog(arg.data);
    break;
  }
});*/

function ipcSendAsync(arg, data) {
    ipcRenderer.send("async", { arg: arg, data: data });
}

function install() {
  appendLog("Initiating installation");
  appendLog("Locating Discord package");
  ipcRenderer.send('async', { "arg": "install" });
}

function appendLog(text) {
  var log = $("#log");
  log.append(text+"\n");
  var sh = log[0].scrollHeight - 40;
  if(log.height() + log.scrollTop() >= sh) {
    log.scrollTop(sh);
  }
}

function updatePbar(cur, max) {
  var pbar = $("#logpbar");
  pbar.val(cur);
  pbar.prop("max", max);
}