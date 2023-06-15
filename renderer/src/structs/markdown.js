import DiscordModules from "@modules/discordmodules";
import Utilities from "@modules/utilities";


export default class SimpleMarkdownExt {
    static parseToReact(str) {
        if (!this._parser) this._initialize();
        return this._renderer(this._parse(str, {inline: true}));
    }

    static _initialize() {
        const SMD = DiscordModules.SimpleMarkdown;
        const originalLink = SMD.defaultRules.link.react;
        const newRules = Utilities.extend({}, SMD.defaultRules, {link: {react: function() {
            const original = Reflect.apply(originalLink, undefined, arguments);
            original.props.className = "bd-link";
            original.props.target = "_blank";
            original.props.rel = "noopener noreferrer";
            return original;
        }}});

        for (const type in newRules) {
            if (!newRules[type].requiredFirstCharacters) continue;
            newRules[type].requiredFirstCharacters = Object.values(newRules[type].requiredFirstCharacters);
        }

        this._parse = SMD.parserFor(newRules);
        this._renderer = SMD.reactFor(SMD.ruleOutput(newRules, "react"));
    }
}