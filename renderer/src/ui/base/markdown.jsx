import {React, WebpackModules, DiscordModules} from "modules";


const DiscordMarkdown = WebpackModules.find(m => m?.prototype?.render && m.rules);
let rules = {};
if (DiscordMarkdown) {
    rules = {
        ...DiscordMarkdown.rules,
        link: DiscordModules.SimpleMarkdown.defaultRules.link
    };

    const originalLink = rules.link.react;
    rules.link.react = function() {
        const original = Reflect.apply(originalLink, undefined, arguments);
        original.props.className = "bd-link";
        original.props.target = "_blank";
        original.props.rel = "noopener noreferrer";
        return original;
    };
}


export default function Markdown({className, children}) {
    if (!DiscordMarkdown) return <div className="bd-markdown-fallback">{children}</div>;
    
    return <DiscordMarkdown
                className={className}
                parser={DiscordModules.SimpleMarkdown.parserFor(rules)}
                output={DiscordModules.SimpleMarkdown.reactFor(DiscordModules.SimpleMarkdown.ruleOutput(rules, "react"))}
            >
                {children}
            </DiscordMarkdown>;
}