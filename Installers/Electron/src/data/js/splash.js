'use strict';

const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('async-reply', (event, arg) => {
  switch(arg) {
    case "update":
      $(".spinnertext").text("Downloading Update");
    break;
  }
});

$(function() {
  ipcRenderer.send('async', '{ "arg": "update" }');
});