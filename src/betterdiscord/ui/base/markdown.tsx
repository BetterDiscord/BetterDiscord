import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import type {Rules, SimpleMarkdown} from "discord/modules";
import type {ComponentClass, PropsWithChildren} from "react";


let DiscordMarkdown: ComponentClass<PropsWithChildren<{className: string; parser: ReturnType<SimpleMarkdown["parserFor"]>; output: ReturnType<SimpleMarkdown["reactFor"]>;}>> & {rules: Rules;}, rules: Rules;

function setupMarkdown() {
    DiscordMarkdown = DiscordModules.DiscordMarkdown;
    rules = {} as Rules;
    if (DiscordMarkdown) {
        rules = {
            ...DiscordMarkdown.rules,
            link: DiscordModules.SimpleMarkdown!.defaultRules.link
        };

        const originalLink = rules.link?.react;
        if (!originalLink) return;
        rules.link.react = function (...args: any[]) {
            const original = Reflect.apply(originalLink, undefined, args);
            original.props.className = "bd-link";
            original.props.target = "_blank";
            original.props.rel = "noopener noreferrer";
            return original;
        };
    }
}

export default function Markdown({className, children}: PropsWithChildren<{className?: string;}>) {
    if (!DiscordMarkdown && !rules) setupMarkdown();
    if (!DiscordMarkdown) return <div className="bd-markdown-fallback">{children}</div>;

    return <DiscordMarkdown
        className={className ?? ""}
        parser={DiscordModules.SimpleMarkdown!.parserFor(rules)}
        output={DiscordModules.SimpleMarkdown!.reactFor(DiscordModules.SimpleMarkdown!.ruleOutput(rules, "react"))}
    >
        {children}
    </DiscordMarkdown>;
}