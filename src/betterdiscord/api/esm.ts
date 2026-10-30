import PluginManager from "@modules/pluginmanager";
import ThemeManager from "@modules/thememanager";
import DiscordModules from "@modules/discordmodules";

import AddonAPI from "./addonapi";
import ReactUtils from "./reactutils";
import UI from "./ui";
import Utils from "./utils";
import Webpack from "./webpack";
import ContextMenu, {type PatchCallback} from "./contextmenu";
import Net from "./net";
import Components from "./components";
import {BoundLogger} from "./logger";
import {BoundCommandAPI} from "./commands";
import {BaseDOM} from "./dom";
import {BoundData} from "./data";
import {BoundPatcher} from "./patcher";
import {BoundHooks} from "./hooks";
import ReactDOM from "@modules/reactdom";
import DOMManager from "@modules/dommanager";

const WebpackInstance = new Webpack();

const PluginAPI = new AddonAPI(PluginManager);
const ThemeAPI = new AddonAPI(ThemeManager);

const baseDOMInstance = new BaseDOM();
const baseMenu = new ContextMenu();

const extendSupplyDefault = <T extends object>(item: T) => Object.freeze(Object.seal(Object.setPrototypeOf({"default": item}, item)));

const unboundedApi = new Map<string, unknown>([
    ["react", extendSupplyDefault(DiscordModules.React)],
    ["react-dom", extendSupplyDefault(ReactDOM)],
    ["react-dom/client", extendSupplyDefault(ReactDOM)],

    ["@betterdiscord/addons", {themes: ThemeAPI, plugins: PluginAPI}],
    ["@betterdiscord/addons/themes", extendSupplyDefault(ThemeAPI)],
    ["@betterdiscord/addons/plugins", extendSupplyDefault(PluginAPI)],

    ["@betterdiscord/utils", extendSupplyDefault(new Utils())],
    ["@betterdiscord/utils/react", extendSupplyDefault(new ReactUtils())],

    ["@betterdiscord/ui", extendSupplyDefault(new UI())],

    ["@betterdiscord/webpack", extendSupplyDefault(WebpackInstance)],
    ["@betterdiscord/webpack/filters", extendSupplyDefault(WebpackInstance.Filters)],
    ["@betterdiscord/webpack/stores", extendSupplyDefault(WebpackInstance.Stores)],

    ["@betterdiscord/components", extendSupplyDefault(new Components())],

    ["@betterdiscord/ContextMenuAPI", extendSupplyDefault(new Components())],

    ["@betterdiscord/net", extendSupplyDefault(new Net())],
]);

const cache = new Map<string, ReturnType<typeof generateRuntime>>();

function generateRuntime(pluginId: string) {
    const patcher = new BoundPatcher(pluginId);
    const data = new BoundData(pluginId);
    const logger = new BoundLogger(pluginId);
    const commands = new BoundCommandAPI(pluginId);
    const hooks = new BoundHooks(pluginId);

    const domUndoIds = new Set<string>();

    const dom = {
        ...baseDOMInstance,

        addStyle(id: string, css?: string) {
            if (typeof css !== "string") {
                css = id;
                id = pluginId;
            }

            DOMManager.injectStyle(id, css);

            domUndoIds.add(id);
        },
        removeStyle(id?: string) {
            DOMManager.removeStyle(id || pluginId);
            domUndoIds.delete(id || pluginId);
        },
        screenWidth: () => baseDOMInstance.screenWidth,
        screenHeight: () => baseDOMInstance.screenHeight
    };

    const menuPatches = new Map<string | RegExp, Set<PatchCallback>>();

    const menu = {
        ...baseMenu,
        patch(navId: string | RegExp, callback: PatchCallback) {
            const callbacks = menuPatches.getOrInsert(navId, new Set());

            callbacks.add(callback);

            baseMenu.patch(navId, callback);

            return menu.unpatch.bind(null, navId, callback);
        },
        unpatch(navId: string | RegExp, callback?: PatchCallback) {
            const callbacks = menuPatches.get(navId);

            if (typeof callback === "function") {
                baseMenu.unpatch(navId, callback);

                if (callbacks) {
                    callbacks.delete(callback);

                    if (callbacks.size === 0) menuPatches.delete(navId);
                }

                return;
            }

            if (!callbacks) return;

            for (const cb of callbacks) {
                baseMenu.unpatch(navId, cb);
            }

            callbacks.clear();
            menuPatches.delete(navId);
        }
    };

    return {
        undo() {
            patcher.unpatchAll();
            dom.removeStyle();

            for (const id of domUndoIds) {
                DOMManager.removeScript(id);
            }

            domUndoIds.clear();

            for (const [navId, patches] of menuPatches) {
                for (const patch of patches) {
                    baseMenu.unpatch(navId, patch);
                }

                patches.clear();
            }

            menuPatches.clear();

            commands.unregisterAll();
        },
        binds: {
            patcher,
            data,
            dom,
            logger,
            commands,
            hooks,
            menu
        },
        modules: new Map([
            ...unboundedApi,

            ["@betterdiscord/patcher", extendSupplyDefault(patcher)],
            ["@betterdiscord/storage", extendSupplyDefault(data)],
            ["@betterdiscord/dom", extendSupplyDefault(dom)],
            ["@betterdiscord/logger", extendSupplyDefault(logger)],
            ["@betterdiscord/commands", extendSupplyDefault(commands)],
            ["@betterdiscord/hooks", extendSupplyDefault(hooks)],
            ["@betterdiscord/context-menu", extendSupplyDefault(menu)],
        ])
    };
}

export function createModuleRuntime(id: string) {
    return cache.getOrInsertComputed(id, generateRuntime);
}