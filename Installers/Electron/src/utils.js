'use strict';

const https = require('https');
const fs = require('fs');
const eol = require('os').EOL;

function utils() {}

var logs = "";
utils.prototype.log = (message) => {
    var d = new Date();
    var ds = ("00" + (d.getDate() + 1)).slice(-2) + "/" + 
    ("00" + d.getMonth()).slice(-2) + "/" + 
    d.getFullYear() + " " + 
    ("00" + d.getHours()).slice(-2) + ":" + 
    ("00" + d.getMinutes()).slice(-2) + ":" + 
    ("00" + d.getSeconds()).slice(-2);
    console.log(`[${ds}] ${message}`);
    logs += `[${ds}] ${message}${eol}`;
}
utils.prototype.saveLogs = () => {

}
utils.prototype.downloadResource = (host, resource, callback) => {
    https.get({
        host: host == "default" ? "raw.githubusercontent.com" : host,
        path: resource,
        headers: { 'user-agent': 'Mozilla/5.0' }
    },
    (response) => {
        var data = "";
        response.on("data", (chunk) => {
            data += chunk;
        });
        response.on("end", () => {
            callback(false, data);
        });
        response.on("error", (e) => {
            callback(true, e);
        });
    });
}


exports.utils = utils;