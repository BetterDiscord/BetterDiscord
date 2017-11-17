"use sctrict"

var pageMod = require('sdk/page-mod');
var data = require("sdk/self").data;

function BdPageMod(options, callbacks) {
    pageMod.PageMod({
        include: '*.discordapp.com',
        contentScriptFile: [data.url('../data/js/jquery-2.1.4.min.js'), data.url('../data/js/main.js')],
        contentStyleFile:  []
    });
}

exports.BdPageMod = BdPageMod;