const fs = require("fs");
const path = require("path");
const localeFolder = path.join(__dirname, "..", "assets", "locales");

const https = require("https");
const qs = require("querystring");

const get = (opts, postData) => {
    if (postData) {
        postData = qs.stringify(postData);
        opts.headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": postData.length
         };
    }

    if (!opts.method) opts.method = "GET";
    return new Promise(resolve => {
        const req = https.request(opts, res => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve(data));
        });
        if (postData) req.write(postData);
        req.end();
    });
};

const HOST = "api.poeditor.com";
const LIST = "/v2/languages/list";
const EXPORT = "/v2/projects/export";

/* eslint-disable no-multi-spaces */
const editorMap = {
    "en-us": "en-us.json",   // English, US
    "en": "en-gb.json",      // English, UK
    "zh-Hans": "zh-cn.json", // Chinese, Simplified
    "zh-Hant": "zh-tw.json", // Chinese, Traditional
    "cs": "cs.json",         // Czech
    "da": "da.json",         // Danish
    "nl": "nl.json",         // Dutch
    "fr": "fr.json",         // French
    "de": "de.json",         // German
    "el": "el.json",         // Greek
    "hu": "hu.json",         // Hungarian
    "it": "it.json",         // Italian
    "ja": "ja.json",         // Japanese
    "ko": "ko.json",         // Korean
    "pl": "pl.json",         // Polish
    "pt": "pt-pt.json",      // Portuguese, Portugal
    "pt-br": "pt-br.json",   // Protuguese, Brazil
    "ru": "ru.json",         // Russian
    "sk": "sk.json",         // Slovak
    "es": "es-es.json",      // Spanish (Spain)
    "sv": "sv-se.json",      // Swedish
    "tr": "tr.json",         // Turkish
    "bg": "bg.json",         // Bulgarian
    "uk": "uk.json",         // Ukrainian
    "fi": "fi.json",         // Finnish
    "no": "no.json",         // Norwegian
    "hr": "hr.json",         // Croation
    "ro": "ro.json",         // Romanian
    "lt": "lt.json",         // Lithuanian
    "th": "th.json",         // Thai
    "vi": "vi.json",         // Vietnamese
    "hi": "hi.json",         // Hindi
};
/* eslint-enable no-multi-spaces */

const mo = opts => Object.assign(opts ?? {}, {api_token: process.env.POEDITOR_API_KEY, id: process.env.POEDITOR_PROJECT_ID});

const getAvailableLanguages = async () => {
    const response = await get({method: "POST", host: HOST, path: LIST}, mo());
    const respJson = JSON.parse(response);
    return respJson.result.languages;
};

const getTranslationUrl = async (code) => {
    const response = await get({method: "POST", host: HOST, path: EXPORT}, mo({language: code, type: "key_value_json", filters: "translated"}));
    const respJson = JSON.parse(response);
    return new URL(respJson.result.url);
};

const getTranslationString = async (hostname, pathname) => {
    const response = await get({host: hostname, path: pathname});
    return response ? response : "{}";
};

const saveTranslationFile = (code, fileString) => {
    const filename = editorMap[code];
    const filePath = path.join(localeFolder, filename);
    fs.writeFileSync(filePath, fileString);
};

const updateTranslations = async () => {
    console.log("Getting all available languages...");
    const languages = await getAvailableLanguages();
    console.log("Acquired all available languages!");
    console.log("");
    // const lang = {name: "English, UK", code: "en"};
    for (const lang of languages) {
        console.log("Getting translation for " + lang.name);
        const langUrl = await getTranslationUrl(lang.code);
        const resultString = await getTranslationString(langUrl.hostname, langUrl.pathname);
        saveTranslationFile(lang.code, resultString);
        console.log("Saved translation for " + lang.name);
        console.log("");
    }
    console.log("");
    console.log("Successfully updated all translations!");
};

updateTranslations();