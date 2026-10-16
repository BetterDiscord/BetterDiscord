import Button from "@ui/base/button";
import React from "react";
import Logger from "@common/logger";
import DiscordModules from "@modules/discordmodules";
import {t} from "@common/i18n";
import Builtin from "@structs/builtin";
import pluginmanager from "@modules/pluginmanager";
import Modals from "@ui/modals";
import {getByPrototypes, getProxy} from "@webpack";
import * as Webpack from "@webpack";
import type {ErrorBoundary, TransitionTo} from "@typed/discord/modules";
import SimpleMarkdownExt from "@structs/markdown";
import Notifications from "@stores/notifications";
import Flex from "@ui/base/flex.tsx";
import {Check, ChevronDown, ChevronRightIcon, Copy, GithubIcon, MessageCircleWarningIcon, Server} from "lucide-react";
import config from "@stores/config.ts";
import {Logo} from "@ui/logo.tsx";
import Ipc from "@modules/ipc.ts";

const TEST_PLUGIN_REGEX = /betterdiscord:\/\/(plugins)\/(.*?).(\w+).js/;

interface PluginInfo {
    name: string;
    githubUrl: string | null;
    invite: string | null;
    version: string;
}

const transitionTo = getProxy<TransitionTo>(Webpack.Filters.byStrings("transitionTo - Transitioning to"), {searchExports: true, firstId: 976860, cacheId: "core-recovery-transitionTo"});

const recoverySteps = [
    {
        action: () => DiscordModules.Dispatcher?.dispatch?.({type: "LAYER_POP_ALL"}),
        errorMessage: "Failed to pop all layers"
    },
    {
        action: () => DiscordModules.Dispatcher?.dispatch?.({type: "MODAL_POP_ALL"}),
        errorMessage: "Failed to pop all modals"
    },
    {
        action: () => DiscordModules.Dispatcher?.dispatch({type: "CONTEXT_MENU_CLOSE"}),
        errorMessage: "Failed to close context menus"
    },
    {
        action: () => Modals.ModalActions?.closeAllModals?.(),
        errorMessage: "Failed to close all modals"
    },
    {
        action: () => transitionTo?.("/channels/@me"),
        errorMessage: "Failed to route to main channel"
    },
];

async function attemptRecovery() {
    let allActionsCompleted = true;

    for (const {action, errorMessage} of recoverySteps) {
        try {
            await action();
        }
        catch (error) {
            Logger.error("Recovery", `${errorMessage}:, ${error}`);
            allActionsCompleted = false;
        }
    }

    return allActionsCompleted;
}

const parseGithubUrl = (url: string) => {
    try {
        const urlObj = new URL(url?.replace(/^(http:\/\/|git:\/\/|git\+https:\/\/|git@)/, "https://"));
        if (!urlObj.hostname.includes("github")) return null;
        const [owner, repo] = urlObj.pathname.split("/").filter(Boolean);
        return owner && repo ? `https://github.com/${owner}/${repo.replace(/\.git$/, "")}` : null;
    }
    catch {
        return null;
    }
};

function getPluginInfo(pluginName: string): PluginInfo | null {
    try {
        const plugin = pluginmanager.resolveAddon(pluginName);
        if (!plugin) return null;

        return {
            name: plugin.name ?? pluginName,
            githubUrl: plugin.source ? parseGithubUrl(plugin.source) : null,
            invite: plugin.invite ?? null,
            version: plugin.version ?? "0.0.0"
        };
    }
    catch (error) {
        Logger.error("Recovery", `Failed to get plugin info: ${error}`);
        return null;
    }
}

function purgeChildren(ret: { props: { action: { props: { children: never[]; }; }; }; }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ret.props?.action?.props?.children && (ret.props.action.props.children = []);
}

function ErrorButtons({instance}: {instance: ErrorBoundary}) {
    const recover = React.useCallback(() => {
        attemptRecovery().then((_) => {
            instance.setState({info: null, error: null});
        });
    }, [instance]);

    const ipcLoad = React.useCallback(() => {
        pluginmanager.disableAllAddons();
        Ipc.relaunch();
    }, []);

    return <Flex align={Flex.Align.CENTER} style={{gap: "8px"}}>
        <Button onClick={() => window.location.reload()} color={"bd-button-color-brand"}>{t("Addons.reload")}</Button>
        <Button onClick={recover} color={"bd-button-color-green"}>{t("Recovery.button")}</Button>
        <Button onClick={ipcLoad} color={"bd-button-color-red"}>{t("Recovery.safeMode")}</Button>
    </Flex>;
}

function ErrorDetails({instance, pluginInfo, stack}: {instance: ErrorBoundary, pluginInfo: PluginInfo | null, stack: React.ReactNode | null}) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const timeout = React.useRef<number>(0);

    const githubUrl = pluginInfo?.githubUrl ?? null;

    React.useEffect(() => () => window.clearTimeout(timeout.current), []);

    const openReport = React.useCallback(() => {
        if (!githubUrl) return;

        const name = pluginInfo?.name ?? "Unknown Plugin";
        const version = pluginInfo?.version ?? "unknown";
        const error = instance.state?.error;

        const issueTitle = encodeURIComponent(`[Bug Report] Plugin Crash - ${name} v${version}`);
        const issueBody = encodeURIComponent(
            `### Error Details\n\`\`\`js\n${error?.stack ?? error ?? "Failed to get stack"}\n\`\`\`\n - Generated by BD Recovery Builtin.` + "\n\n### Steps to Reproduce\n1.\n2.\n3.\n\n" + "### Additional Context\n"
        );
        window.open(`${githubUrl}/issues/new?title=${issueTitle}&body=${issueBody}`, "_blank", "noopener,noreferrer");
    }, [githubUrl, pluginInfo?.name, pluginInfo?.version, instance.state?.error]);

    const recover = React.useCallback(() => {
        attemptRecovery().then((_) => {
            instance.setState({info: null, error: null});
        });
    }, [instance]);

    const copy = React.useCallback(() => {
        const {error, info} = (instance.state ?? {}) as any;

        const text = [
            pluginInfo && `Suspected addon: ${pluginInfo.name} v${pluginInfo.version}`,
            error?.stack ?? String(error ?? "No stack available"),
            info?.componentStack && `Component stack:${info.componentStack}`
        ].filter(Boolean).join("\n\n");

        try {
            const nativeCopy = (window as any).DiscordNative?.clipboard?.copy;
            if (nativeCopy) nativeCopy(text);
            else navigator.clipboard.writeText(text);

            setCopied(true);
            window.clearTimeout(timeout.current);
            timeout.current = window.setTimeout(() => setCopied(false), 2000);
        }
        catch (_error) {
            Logger.error("Recovery", `Failed to copy error details: ${_error}`);
        }
    }, [instance, pluginInfo]);

    return (
        <DiscordModules.AccessibilityContext.Provider value={{reducedMotion: {enabled: true}}}>
            <DiscordModules.LayerProvider.AppLayerProvider>
                <div className={"bd-recovery-container"}>
                    <Flex className={"bd-recovery-header"}>
                        <div
                            className={"bd-recovery-toggle"}
                            aria-expanded={isExpanded}
                            onClick={() => setIsExpanded(v => !v)}
                        >
                            <span>{isExpanded ? "Hide Error Details" : "Show Error Details"}</span>
                            {isExpanded ? <ChevronDown size={16}/> : <ChevronRightIcon size={16}/>}
                        </div>
                        <Button color={"bd-button-color-white"} onClick={copy}>
                            <Flex align={Flex.Align.CENTER} style={{gap: "6px"}}>
                                {copied ? <Check size={16}/> : <Copy size={16}/>}
                                <span>{copied ? "Copied" : "Copy"}</span>
                            </Flex>
                        </Button>
                    </Flex>

                    {!!pluginInfo && (
                        <div className={"bd-recovery-suspect"}>
                            <span className={"bd-suspected-label"}>{t("Recovery.suspect")}</span>
                            <span className={"bd-suspected-plugin"}>
                            <MessageCircleWarningIcon size={14}/>
                                    {pluginInfo.name}
                                    <span className={"bd-suspected-version"}>v{pluginInfo.version}</span>
                            </span>
                            <div className={"bd-recovery-links"}>
                                {!!pluginInfo.githubUrl && (
                                    <DiscordModules.Tooltip text={t("Recovery.report")}>
                                        {props => (
                                            <GithubIcon {...props} className={"bd-recovery-link"} onClick={openReport} size={24}/>
                                        )}
                                    </DiscordModules.Tooltip>
                                )}
                                {!!pluginInfo.invite && (
                                    <DiscordModules.Tooltip text={t("Recovery.joinSupport")}>
                                        {props => (
                                            <Server
                                                {...props}
                                                className={"bd-recovery-link"}
                                                onClick={() => {
                                                    recover();
                                                    Modals.showGuildJoinModal(pluginInfo.invite as string);
                                                }}
                                                size={24}
                                            />
                                        )}
                                    </DiscordModules.Tooltip>
                                )}
                            </div>
                        </div>
                    )}

                    {isExpanded && <div className={"bd-recovery-details"}>
                        <div className={"bd-recovery-stack bd-scroller-thin"}>{stack}</div>
                    </div>}
                </div>
                {/* This is literally so I can use discords tooltips lmfao */}
                {/* @ts-expect-error true */}
                <DiscordModules.LayerProvider.AppLayerContainer/>
            </DiscordModules.LayerProvider.AppLayerProvider>
        </DiscordModules.AccessibilityContext.Provider>
    );
}


export default new class Recovery extends Builtin {
    initialize() {
        this.patchErrorBoundry();
        return super.initialize();
    }

    patchErrorBoundry() {
        const mod = getByPrototypes<typeof React.PureComponent>(["_handleSubmitReport"], {firstId: 670735, cacheId: "core-recovery-ErrorBoundary"});

        this.after(mod?.prototype, "componentDidCatch", (_instance, [error]) => {
            const stack = error?.stack;
            const match = typeof stack === "string" ? TEST_PLUGIN_REGEX.exec(stack) : null;
            const pluginInfo = match?.[2] ? getPluginInfo(`${match[2]}.plugin.js`) : null;
            if (!pluginInfo) return;

            pluginmanager.disableAddon(pluginInfo.name);

            Notifications.show({
                title: "BetterDiscord Recovery",
                content: `Suspected plugin causing the crashes: ${pluginInfo.name} v${pluginInfo.version}`,
                type: "warning",
                icon: () => <Logo size={16} accent />,
                duration: Infinity,
                actions: [
                    ...(config.isCanary ? [{
                        label: "Re-enable",
                        onClick: () => pluginmanager.enableAddon(pluginInfo.name),
                        dontClose: true,
                    }] : [])
                ]
            });
        });

        this.after(mod?.prototype, "render", (instance, _, retValue) => {
            if (!retValue.props?.action?.props) return;

            purgeChildren(retValue);

            const errorInstance = instance as ErrorBoundary;
            const errorStack = errorInstance.state;
            const parsedError = errorStack ? SimpleMarkdownExt.parseToReact(`\`\`\`${errorStack.error?.stack}\n\n${errorStack.info?.componentStack}\`\`\``) : null;

            const stack = errorStack?.error?.stack;
            const match = typeof stack === "string" ? TEST_PLUGIN_REGEX.exec(stack) : null;
            const pluginInfo = match?.[2] ? getPluginInfo(`${match[2]}.plugin.js`) : null;

            retValue.props.action.props.children.push(
                <ErrorButtons instance={errorInstance}/>
            );

            retValue.props.action = [
                retValue.props.action,
                <ErrorDetails stack={parsedError} pluginInfo={pluginInfo} instance={errorInstance}/>
            ];
        });
    }
};