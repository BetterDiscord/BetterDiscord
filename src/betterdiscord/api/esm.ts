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
import ErrorBoundary from "@ui/errorboundary";
import Spinner from "@ui/spinner";
import Button from "@ui/base/button";
import Text from "@ui/base/text";
import Flex from "@ui/base/flex";
import Modal from "@ui/modals/modal";
import SettingItem from "@ui/settings/components/item";
import CheckBox from "@ui/settings/components/checkbox";
import Switch from "@ui/settings/components/switch";
import Slider from "@ui/settings/components/slider";
import ColorPicker from "@ui/settings/components/color";
import Search from "@ui/settings/components/search";
import Dropdown from "@ui/settings/components/dropdown";
import TextInput from "@ui/settings/components/textbox";
import Group from "@ui/settings/group";

const WebpackInstance = new Webpack();

const PluginAPI = new AddonAPI(PluginManager);
const ThemeAPI = new AddonAPI(ThemeManager);

const baseDOMInstance = new BaseDOM();
const baseMenu = new ContextMenu();

const components = {
    Tooltip: DiscordModules.Tooltip,
    ErrorBoundary,
    Spinner,
    Button,
    Text,
    Flex,
    Modal,

    SettingItem,
    Group,

    inputs: {
        CheckBox,
        Switch,
        Text: TextInput,
        Slider,
        ColorPicker,
        Dropdown,
        Search,
    }
};

const unboundedApi = new Map<string, unknown>([
    ["react", DiscordModules.React],
    ["react-dom", ReactDOM],
    ["react-dom/client", ReactDOM],

    ["@betterdiscord/addons", {themes: ThemeAPI, plugins: PluginAPI}],
    ["@betterdiscord/addons/themes", ThemeAPI],
    ["@betterdiscord/addons/plugins", PluginAPI],

    ["@betterdiscord/utils", new Utils()],
    ["@betterdiscord/utils/react", new ReactUtils()],

    ["@betterdiscord/ui", new UI()],

    ["@betterdiscord/webpack", WebpackInstance],
    ["@betterdiscord/webpack/filters", WebpackInstance.Filters],
    ["@betterdiscord/webpack/stores", WebpackInstance.Stores],

    ["@betterdiscord/components", components],
    ["@betterdiscord/components/inputs", components.inputs],

    ["@betterdiscord/net", new Net()],
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

            ["@betterdiscord/patcher", patcher],
            ["@betterdiscord/storage", data],
            ["@betterdiscord/dom", dom],
            ["@betterdiscord/logger", logger],
            ["@betterdiscord/commands", commands],
            ["@betterdiscord/hooks", hooks],
            ["@betterdiscord/context-menu", menu],
        ])
    };
}

export function createModuleRuntime(id: string) {
    return cache.getOrInsertComputed(id, generateRuntime);
}