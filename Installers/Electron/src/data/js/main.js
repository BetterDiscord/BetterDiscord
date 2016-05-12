'use strict';

const ipcRenderer = require('electron').ipcRenderer;

$(function() {

  var currentPanel = 0;
  
  $("#accept").on("change", function() {
    console.log("WTF");
    $("#next").prop("disabled", true);
    if($(this).prop("checked")) {
      $("#next").prop("disabled", false);
    }
  });
  
  $("#decline").on("change", function() {
    $("#next").prop("disabled", true);
    if(!$(this).prop("checked")) {
      $("#next").prop("disabled", false);
    }
  });
  
  $("#back").on("click", function(){
    currentPanel--;
    if(currentPanel <= 0) currentPanel = 0;
    switchPanel();
  });
  
  $("#next").on("click", function() {
    currentPanel++;
    if(currentPanel >= 3) currentPanel = 3;
    switchPanel();
  });

  $("#path").on("click", function() {
    var p = ipcRenderer.sendSync('sync', 'openDirectory');
    if(p != null) {
      $("#discordPath").val(p);
    }
  });

  $("#licensetext").on("scroll", function() {
    var e = $(this);
    if(e.height() + e.scrollTop() >= e[0].scrollHeight) {
      $("#accept").prop("disabled", false);
    } else {
      $("#accept").prop("disabled", true);
      $("#decline").prop("checked", true)
      $("#next").prop("disabled", true);
    }
  });
  
  function switchPanel() {
    $(".panel-container").css("left", currentPanel*-600+10 + "px");
    switch(currentPanel) {
      case 0:
        $("#back").hide();
        $("#next").show();
        $("#next").text("Next");
        $("#next").prop("disabled", false);
        break;
      case 1:
        $("#back").show();
        $("#next").text("Next");
        $("#next").prop("disabled", !$("#accept").prop("checked"));
        break;
      case 2:
        $("#back").show();
        $("#next").show();
        $("#next").text("Install");
        break;
    }
  }

  $("#discordPath").val(ipcRenderer.sendSync('sync', 'getInstallPath'));

})();