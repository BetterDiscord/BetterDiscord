import React from "react";
import Patcher from "@modules/patcher";
import {Logo} from "@ui/logo";
import {getLazyByPrototypes, getLazyBySource, getWithKey} from "@webpack";
import ReactUtils from "@api/reactutils";
import {findInTree} from "@common/utils";
import type {Webpack} from "../../types/discord";
import {getDefaultKey} from "../../webpack/shared";

import type {RouteComponentProps, RouteProps} from "react-router";

import Unknown from "./routes/unknown";
import Home from "./routes/home";
import TitlebarIcon from "./icon";
import Sidebar from "./sidebar";
import ErrorScreen from "./errorboundary";

const routes = Object.freeze({
    "/betterdiscord/updater": Unknown,
    // TODO: Figure out editor
    "/betterdiscord/custom-css": Unknown,
    // Maybe?
    // "/betterdiscord/editor/custom-css": Unknown,
    // "/betterdiscord/editor/:type(plugin|theme)/:addonId": Unknown,

    // TODO: Come up with a good way to access addon settings.
    // Current idea '/betterdiscord/plugins/cool%20plugin' or '/betterdiscord/plugin/cool%20plugin'
    "/betterdiscord/:type(plugin|theme)/:addonId": Unknown,
    "/betterdiscord/:type(plugins|themes)": Unknown,
    // TODO: Same for stores
    "/betterdiscord/store/:type(plugins|themes)": Unknown,
    // "/betterdiscord/store/:type(plugin|theme)/:addonId": Unknown, // open download modal
    // TODO: How to do collections?
    // Do I just nuke the ability to do multiple? or force update this whenever one gets loaded / removed
    // Or make each collection add to the list
    "/betterdiscord/:collection(settings)": Unknown,

    "/betterdiscord/_debug/crash": (() => ({})) as unknown as React.ComponentType<RouteComponentProps<any>>,

    "/betterdiscord/*": Unknown, // 404
    "/betterdiscord": React.memo(Home)
} satisfies Record<string, React.ComponentType<RouteComponentProps<any>>>);

const routeKeys = Object.keys(routes);

class ComponentPatcher {
    private id = Symbol("ComponentPatcher");
    private cache = new Map();

    patch<P, T extends React.ComponentType<P>>(node: React.ReactElement<P, T>, callback: T extends React.ComponentClass<P> ? ((props: P, res: React.ReactNode, instance: React.Component) => React.ReactNode) : ((props: P, res: React.ReactNode) => React.ReactNode)) {
        const type = node.type;

        if (this.cache.has(type)) {
            node.type = this.cache.get(type);
            return;
        }

        if (this.id in type) {
            node.type = (type as any)[this.id];
            return;
        }

        if (type.prototype?.isReactComponent) {
            class ComponentType extends (type as React.ComponentClass<P>) {
                render() {
                    const res = super.render();

                    return callback(this.props, res, this);
                }
            }

            this.cache.set(type, ComponentType);
            this.cache.set(ComponentType, ComponentType);

            (ComponentType as any)[this.id] = ComponentType;

            node.type = ComponentType as T;

            return;
        }

        const FC = ReactUtils.getType<React.FunctionComponent<P>, P>(type as React.FunctionComponent<P>);

        function FunctionType(props: P) {
            const res = FC(props);

            if (res instanceof Promise) return res;

            return (callback as ((_: P, __: React.ReactNode) => React.ReactNode))(props, res);
        }

        let newType: React.ComponentType<any> = FunctionType;

        if (typeof type === "object") {
            const t = type as any;

            if (t.memo) {
                newType = React.memo(typeof t.type === "object" && t.render ? React.forwardRef(t.render) : t, t.compare);
            }
            else if ((type as any).render) {
                newType = React.forwardRef(t.render);
            }
        }

        this.cache.set(type, newType);
        this.cache.set(newType, newType);

        (newType as any)[this.id] = newType;

        node.type = newType as T;
    }
}

class Dashboard {
    private async patchTitleBar() {
        const [module, key] = getWithKey(m => String(m).includes("leading:"), {
            target: await getLazyBySource([".winButtonsWithDivider"], {searchDefault: false})
        });

        Patcher.before("BetterDiscord~Dashboard", module, key, (_, [props]: any[]) => {
            if (/* !res || */ !props || props.windowkey || !props.trailing) return;

            props.trailing.props.children = [
                // TODO: Make the button glow or something on first install
                <TitlebarIcon />,
                props.trailing.props.children
            ];
        });
    }

    private async patchWindowTitle() {
        const [exports, key] = getWithKey(() => true, {
            target: await getLazyBySource<Webpack.Module>(["fast-travel", "GuildTitle"], {searchDefault: false})
        });

        const fakeNode = ReactUtils.wrapInHooks(exports[key], {useContext: (() => ({location: {pathname: "/channels/@me"}})) as any})({}) as React.ReactElement<any>;

        Patcher.after("BetterDiscord~Dashboard", fakeNode.props, "children", (_, __, res) => {
            res.props.children[0] = <Logo.Discord color="var(--interactive-text-default)" size="xs" />;
            res.props.children[1].props.children = "BetterDiscord";
        });

        Patcher.after("BetterDiscord~Dashboard", exports, key, () => {
            if (location.pathname.startsWith("/betterdiscord")) return fakeNode;
        });
    }

    private async patchReactRouter() {
        // const module = await getLazyBySource([".winButtonsWithDivider"], {searchDefault: false});

        const module = await getLazyByPrototypes<any>(["ensureChannelMatchesGuild"]);

        Patcher.after("BetterDiscord~Dashboard", module.prototype, "render", (component, __, res) => {
            const node = findInTree(res, m => Array.isArray(m?.props?.path) && m.props.path.length > 10, {
                walkable: ["props", "children"]
            });

            if (node && !node.props.path.includes(routeKeys)) {
                node.props.path.push(routeKeys);

                // Magic but it works like an additional 3% of the time
                const r = node.render;
                node.render = () => null;

                (component as React.Component).forceUpdate(() => {
                    node.render = r;
                    (component as React.Component).forceUpdate();
                });
            }
        });

        this.forceUpdateApp();
    }

    private forceUpdateApp() {
        const node = document.querySelector("div[class^=app_] > div[class^=app_");

        if (!node) return;

        const instance = ReactUtils.getOwnerInstance(node, {
            filter: m => m.ensureChannelMatchesGuild
        });

        instance?.forceUpdate();
    }

    private async patchAppView() {
        const module = await getLazyBySource<Webpack.Module>(["\"AppView\""], {searchDefault: false, raw: true});

        const insertRoute = (res: any) => {
            const node = findInTree(res, m => Array.isArray(m?.props?.children) && m.props.children.length > 5, {
                walkable: ["props", "children"]
            });

            node.props.children.push(
                // Todo properly do this
                React.createElement(node.props.children[0].type, {
                    path: routeKeys,
                    render: (props) => {
                        const Component = routes[props.match.path as keyof typeof routes] || Unknown;

                        return (
                            <ErrorScreen key={props.match.url}>
                                <Component {...props} key={props.match.url} />
                            </ErrorScreen>
                        );
                    }
                } satisfies RouteProps)
            );
        };

        const patcher = new ComponentPatcher();

        const replaceSidebar = (res: any) => {
            const node = findInTree(res, m => typeof m?.props?.hasNotice === "boolean" && typeof m.props.isSidebarOpen === "boolean", {
                walkable: ["props", "children"]
            });

            patcher.patch(node, (_: any, ret: any) => {
                return React.cloneElement(ret, {
                    children(...args: unknown[]) {
                        const children = ret.props.children(...args as any);

                        const sidebar = findInTree(children, m => m.type && String(ReactUtils.getType(m.type)).includes("Sidebar"), {
                            walkable: ["props", "children"]
                        });

                        if (sidebar) {
                            patcher.patch(sidebar, (__: any, sidebarRet: any) => {
                                if (location.pathname.startsWith("/betterdiscord")) {
                                    return <Sidebar />;
                                }

                                return sidebarRet;
                            });
                        }

                        return children;
                    }
                });
            });
        };

        Patcher.after("BetterDiscord~Dashboard", module!.exports, getDefaultKey(module!)!, (_, __, res) => {
            insertRoute(res);
            replaceSidebar(res);
        });
    }

    public initialize() {
        this.patchTitleBar();
        this.patchWindowTitle();
        this.patchReactRouter();
        this.patchAppView();
    }
}

export default new Dashboard();