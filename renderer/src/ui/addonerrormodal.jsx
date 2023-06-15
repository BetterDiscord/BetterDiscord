import React from "@modules/react";
import Strings from "@modules/strings";
import DiscordClasses from "@modules/discordclasses";
import WebpackModules from "@modules/webpackmodules";

import Extension from "@ui/icons/extension";
import ThemeIcon from "@ui/icons/theme";

import Divider from "@ui/divider";

const Parser = Object(WebpackModules.getByProps("defaultRules", "parse")).defaultRules;
const {useState, useCallback, useMemo} = React;

const joinClassNames = (...classNames) => classNames.filter(e => e).join(" ");


function AddonError({err, index}) {
    const [expanded, setExpanded] = useState(false);
    const toggle = useCallback(() => setExpanded(!expanded), [expanded]);

    function renderErrorBody() {
        const stack = err?.error?.stack ?? err.stack;
        if (!expanded || !stack) return null;
        return <div className="bd-addon-error-body">
            <Divider />
            <div className="bd-addon-error-stack">
                {Parser ? Parser.codeBlock.react({content: stack, lang: "js"}, null, {}) : stack}
            </div>
        </div>;
    }

    return <div key={`${err.type}-${index}`} className={joinClassNames("bd-addon-error", (expanded) ? "expanded" : "collapsed")}>
        <div className="bd-addon-error-header" onClick={toggle} >
            <div className="bd-addon-error-icon">
                {err.type == "plugin" ? <Extension /> : <ThemeIcon />}
            </div>
            <div className="bd-addon-error-header-inner">
                <h3 className={`bd-addon-error-file ${DiscordClasses.Text.colorHeaderPrimary} ${DiscordClasses.Integrations.secondaryHeader} ${DiscordClasses.Text.size16}`}>{err.name}</h3>
                <div className={`bd-addon-error-details ${DiscordClasses.Integrations.detailsWrapper}`}>
                    <svg className={DiscordClasses.Integrations.detailsIcon} aria-hidden="false" width="16" height="16" viewBox="0 0 12 12">
                        <path fill="currentColor" d="M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z"></path>
                    </svg>
                    <div className={`${DiscordClasses.Text.colorHeaderSecondary} ${DiscordClasses.Text.size12}`}>{err.message}</div>
                </div>
            </div>
            <svg className="bd-addon-error-expander" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 10L12 15 17 10" aria-hidden="true"></path>
            </svg>
        </div>
        {renderErrorBody(err)}
    </div>;
}


function generateTab(id, errors) {
    return {id, errors, name: Strings.Panels[id]};
}

export default function AddonErrorModal({pluginErrors, themeErrors}) {
    const tabs = useMemo(() => {
        return [
            pluginErrors.length && generateTab("plugins", pluginErrors),
            themeErrors.length && generateTab("themes", themeErrors)
        ].filter(e => e);
    }, [pluginErrors, themeErrors]);

    const [tabId, setTab] = useState(tabs[0].id);
    const switchToTab = useCallback((id) => setTab(id), []);
    const selectedTab = tabs.find(e => e.id === tabId);

    return <>
        <div className={`bd-error-modal-header ${DiscordClasses.Modal.header} ${DiscordClasses.Modal.separator}`}>
            <h4 className={`${DiscordClasses.Titles.defaultColor} ${DiscordClasses.Text.size14} ${DiscordClasses.Titles.h4} ${DiscordClasses.Margins.marginBottom8}`}>{Strings.Modals.addonErrors}</h4>
            <div className="bd-tab-bar">
                {tabs.map(tab => <div onClick={() => {switchToTab(tab.id);}} className={joinClassNames("bd-tab-item", tab.id === selectedTab.id && "selected")}>{tab.name}</div>)}
            </div>
        </div>
        <div className={`bd-error-modal-content ${DiscordClasses.Modal.content} ${DiscordClasses.Scrollers.thin}`}>
            <div className="bd-addon-errors">
                {selectedTab.errors.map((error, index) => <AddonError index={index} err={error} />)}
            </div>
        </div>
    </>;
}