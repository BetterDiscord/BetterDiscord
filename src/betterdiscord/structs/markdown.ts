import DiscordModules from "@modules/discordmodules";
import {extend} from "@common/utils";
import type {ReactElement} from "react";
import type {Rules, SimpleMarkdown} from "discord/modules";


export default class SimpleMarkdownExt {

    private static _parse: (s: string, o?: {inline: boolean;}) => object;
    private static _renderer: (o: object) => ReactElement;

    static parseToReact(str: string, inline = true) {
        if (!this._parse) this._initialize();
        return this._renderer(this._parse(str, {inline}));
    }

    static _initialize() {
        const SMD: SimpleMarkdown = DiscordModules.SimpleMarkdown!;
        const originalLink = SMD.defaultRules.link.react!;
        const newRules: SimpleMarkdown["defaultRules"] = extend({}, SMD.defaultRules, {
            link: {
                react: function (e: RegExpExecArray, t: (s: string, o: object) => string, n: object) {
                    const original = Reflect.apply(originalLink, this, [e, t, n])! as ReactElement<{className: string; target: string; rel: string;}>;
                    original.props.className = "bd-link";
                    original.props.target = "_blank";
                    original.props.rel = "noopener noreferrer";
                    return original;
                }
            }
        }) as SimpleMarkdown["defaultRules"];

        for (const type in newRules) {
            if (!newRules[type as keyof Rules].requiredFirstCharacters) continue;
            newRules[type as keyof Rules].requiredFirstCharacters = Object.values(newRules[type as keyof Rules].requiredFirstCharacters!);
        }

        this._parse = SMD.parserFor(newRules);
        this._renderer = SMD.reactFor(SMD.ruleOutput(newRules, "react"));
    }
}