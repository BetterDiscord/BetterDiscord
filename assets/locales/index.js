/* eslint-disable no-multi-spaces */

module.exports = {
    "en-US": require("./en-us.json"),   // English, US
    "en-GB": require("./en-gb.json"),   // English, UK
    "zh-CN": require("./zh-cn.json"),   // Chinese, Simplified
    "zh-TW": require("./zh-tw.json"),   // Chinese, Traditional
    "cs": require("./cs.json"),         // Czech
    "da": require("./da.json"),         // Danish
    "nl": require("./nl.json"),         // Dutch
    "fr": require("./fr.json"),         // French
    "de": require("./de.json"),         // German
    "el": require("./el.json"),         // Greek
    "hu": require("./hu.json"),         // Hungarian
    "it": require("./it.json"),         // Italian
    "ja": require("./ja.json"),         // Japanese
    "ko": require("./ko.json"),         // Korean
    "pl": require("./pl.json"),         // Polish
    "pt-PT": require("./pt-pt.json"),   // Portuguese, Portugal
    "pt-BR": require("./pt-br.json"),   // Protuguese, Brazil
    "ru": require("./ru.json"),         // Russian
    "sk": require("./sk.json"),         // Slovak
    "es-ES": require("./es-es.json"),   // Spanish (Spain)
    "sv-SE": require("./sv-se.json"),   // Swedish
    "tr": require("./tr.json"),         // Turkish
    "bg": require("./bg.json"),         // Bulgarian
    "uk": require("./uk.json"),         // Ukrainian
    "fi": require("./fi.json"),         // Finnish
    "no": require("./no.json"),         // Norwegian
    "hr": require("./hr.json"),         // Croation
    "ro": require("./ro.json"),         // Romanian
    "lt": require("./lt.json"),         // Lithuanian
    "th": require("./th.json"),         // Thai
    "vi": require("./vi.json"),         // Vietnamese
    "hi": require("./hi.json"),         // Hindi
};


/*

The following is the list of Discord's available locales as of April 15th 2021

English, US: en-US
English, UK: en-GB
Chinese Simplified: 
Traditional Chinese: zh-TW
Czech: cs
Danish: da
Dutch: nl
French: fr
German: de
Greek: el
Hungarian: hu
Italian: it
Japanese: ja
Korean: ko
Polish: pl
Portuguese: pt-PT
Portuguese, Brazilian: pt-BR
Russian: ru
Slovak: sk
Spanish: es-ES
Swedish: sv-SE
Turkish: tr
Bulgarian: bg
Ukrainian: uk
Finnish: fi
Norwegian: no
Croatian: hr
Romanian: ro
Lithuanian: lt
Thai: th
Vietnamese: vi
Hindi: hi

List was retrieved using: DiscordModules.LocaleManager.getLanguages().map(l => `${l.englishName}: ${l.code}`)

This means that the above list includes locales that exist in their current system, but are not yet available to select via UI.

That list can be checked with DiscordModules.LocaleManager.getAvailableLocales()

*/