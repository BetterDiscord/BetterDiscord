import WebpackModules from "../webpackmodules";
import Patcher from "../patcher";
import Logger from "common/logger";
import {React} from "../modules";

let startupComplete = false;

const MenuComponents = (() => {
    const out = {};
    const componentMap = {
        separator: "Separator",
        checkbox: "CheckboxItem",
        radio: "RadioItem",
        control: "ControlItem",
        groupstart: "Group",
        customitem: "Item"
    };

    // exportKey:()=>identifier
    const getExportIdentifier = (string, id) => new RegExp(`(\\w+):\\(\\)=>${id}`).exec(string)?.[1];

    try {
        let contextMenuId = Object.keys(WebpackModules.require.m).find(e => WebpackModules.require.m[e]?.toString().includes("menuitemcheckbox"));
        const ContextMenuModule = WebpackModules.getModule((m, t, id) => id === contextMenuId);
        const rawMatches = WebpackModules.require.m[contextMenuId].toString().matchAll(/if\(\w+\.type===(\w+)\)[\s\S]+?type:"(.+?)"/g);
        const moduleString = WebpackModules.require.m[contextMenuId].toString();
        out.Menu = Object.values(ContextMenuModule).find(v => v.toString().includes(".isUsingKeyboardNavigation"));
        
        for (const [, identifier, type] of rawMatches) {
            out[componentMap[type]] = ContextMenuModule[getExportIdentifier(moduleString, identifier)];
        }

        startupComplete = Object.values(componentMap).every(k => out[k]) && !!out.Menu;
    } catch (error) {
        startupComplete = false;
        Logger.stacktrace("ContextMenu~Components", "Fatal startup error:", error);

        Object.assign(out, Object.fromEntries(
            Object.values(componentMap).map(k => [k, () => null])
        ));
    }

    return out;
})();

const ContextMenuActions = (() => {
    const out = {};

    try {
        const ActionsModule = WebpackModules.getModule(m => Object.values(m).some(v => typeof v === "function" && v.toString().includes("CONTEXT_MENU_CLOSE")), {searchExports: false});

        for (const key of Object.keys(ActionsModule)) {
            if (ActionsModule[key].toString().includes("CONTEXT_MENU_CLOSE")) {
                out.closeContextMenu = ActionsModule[key];
            }
            else if (ActionsModule[key].toString().includes("renderLazy")) {
                out.openContextMenu = ActionsModule[key];
            }
        }

        startupComplete &&= typeof(out.closeContextMenu) === "function" && typeof(out.openContextMenu) === "function";
    } catch (error) {
        startupComplete = false;
        Logger.stacktrace("ContextMenu~Components", "Fatal startup error:", error);
        
        Object.assign(out, {
            closeContextMenu: () => {},
            openContextMenu: () => {}
        });
    }

    return out;
})();

class MenuPatcher {
    static MAX_PATCH_ITERATIONS = 10;
    static patches = {};
    static subPatches = new WeakMap();

    static initialize() {
        if (!startupComplete) return Logger.warn("ContextMenu~Patcher", "Startup wasn't successfully, aborting initialization.");

        const {module, key} = (() => {
            const foundModule = WebpackModules.getModule(m => Object.values(m).some(v => typeof v === "function" && v.toString().includes("CONTEXT_MENU_CLOSE")), {searchExports: false});
            const foundKey = Object.keys(foundModule).find(k => foundModule[k].length === 3);

            return {module: foundModule, key: foundKey};
        })();

        Patcher.before("ContextMenuPatcher", module, key, (_, methodArguments) => {
            const promise = methodArguments[1];
            methodArguments[1] = async function () {
                const render = await promise.apply(this, arguments);

                return props => {
                    const res = render(props);

                    if (res?.props.navId) {
                        MenuPatcher.runPatches(res.props.navId, res, props);
                    }
                    else if (typeof res?.type === "function") {
                        MenuPatcher.patchRecursive(res, "type");
                    }

                    return res;
                };
            };
        });
    }

    static patchRecursive(target, method, iteration = 0) {
        if (iteration >= this.MAX_PATCH_ITERATIONS) return;

        const proxyFunction = this.subPatches.get(target[method]) ?? (() => {
            const originalFunction = target[method];
            const depth = ++iteration;
            function patch() {
                const res = originalFunction.apply(this, arguments);

                if (!res) return res;

                if (res.props?.navId ?? res.props?.children?.props?.navId) {
                    MenuPatcher.runPatches(res.props.navId ?? res.props?.children?.props?.navId, res, arguments[0]);
                }
                else {
                    const layer = res.props.children ? res.props.children : res;

                    if (typeof layer?.type == "function") {
                        MenuPatcher.patchRecursive(layer, "type", depth);
                    }
                }

                return res;
            }

            patch._originalFunction = originalFunction;
            Object.assign(patch, originalFunction);
            this.subPatches.set(originalFunction, patch);

            return patch;
        })();

        target[method] = proxyFunction;
    }

    static runPatches(id, res, props) {
        if (!this.patches[id]) return;

        for (const patch of this.patches[id]) {
            try {
                patch(res, props);
            }
            catch (error) {
                Logger.error("ContextMenu~runPatches", `Could not run ${id} patch for`, patch, error);
            }
        }
    }

    static patch(id, callback) {
        this.patches[id] ??= new Set();
        this.patches[id].add(callback);
    }

    static unpatch(id, callback) {
        this.patches[id]?.delete(callback);
    }
}


/**
 * `ContextMenu` is a module to help patch and create context menus. Instance is accessible through the {@link BdApi}.
 * @type ContextMenu
 * @summary {@link ContextMenu} is a utility class for interacting with React internals.
 * @name ContextMenu
 */
class ContextMenu {

    /**
     * Allows you to patch a given context menu. Acts as a wrapper around the `Patcher`.
     * 
     * @param {string} navId Discord's internal navId used to identify context menus
     * @param {function} callback callback function that accepts the react render tree
     * @returns {function} a function that automatically unpatches
     */
    patch(navId, callback) {
        MenuPatcher.patch(navId, callback);

        return () => MenuPatcher.unpatch(navId, callback);
    }

    /**
     * Allows you to remove the patch added to a given context menu.
     * 
     * @param {string} navId the original navId from patching
     * @param {function} callback the original callback from patching
     */
    unpatch(navId, callback) {
        MenuPatcher.unpatch(navId, callback);
    }

    /**
     * Builds a single menu item. The only prop shown here is the type, the rest should
     * match the actual component being built. View those to see what options exist
     * for each, they often have less in common than you might think.
     * 
     * @param {object} props - props used to build the item
     * @param {string} [props.type="text"] - type of the item, options: text, submenu, toggle, radio, custom, separator
     * @returns {object} the created component
     * 
     * @example
     * // Creates a single menu item that prints "MENU ITEM" on click
     * ContextMenu.buildItem({
     *      label: "Menu Item",
     *      action: () => {console.log("MENU ITEM");}
     * });
     * 
     * @example
     * // Creates a single toggle item that starts unchecked
     * // and print the new value on every toggle
     * ContextMenu.buildItem({
     *      type: "toggle",
     *      label: "Item Toggle",
     *      checked: false,
     *      action: (newValue) => {console.log(newValue);}
     * });
     */
     buildItem(props) {
        const {type} = props;
        if (type === "separator") return React.createElement(MenuComponents.Separator);

        let Component = MenuComponents.Item;
        if (type === "submenu") {
            if (!props.children) props.children = this.buildMenuChildren(props.render || props.items);
        }
        else if (type === "toggle" || type === "radio") {
            Component = type === "toggle" ? MenuComponents.CheckboxItem : MenuComponents.RadioItem;
            if (props.active) props.checked = props.active;
        }
        else if (type === "control") {
            Component = MenuComponents.ControlItem;
        }
        if (!props.id) props.id = `${props.label.replace(/^[^a-z]+|[^\w-]+/gi, "-")}`;
        if (props.danger) props.color = "danger";
        if (props.onClick && !props.action) props.action = props.onClick;
        props.extended = true;

        // This is done to make sure the UI actually displays the on/off correctly
        if (type === "toggle") {
            const [active, doToggle] = React.useState(props.checked || false);
            const originalAction = props.action;
            props.checked = active;
            props.action = function(ev) {
                originalAction(ev);
                doToggle(!active);
            };
        }
        
        return React.createElement(Component, props);
    }

    /**
     * Creates the all the items **and groups** of a context menu recursively.
     * There is no hard limit to the number of groups within groups or number
     * of items in a menu.
     * @param {Array<object>} setup - array of item props used to build items. See {@link ContextMenu.buildItem}
     * @returns {Array<object>} array of the created component
     * 
     * @example
     * // Creates a single item group item with a toggle item
     * ContextMenu.buildMenuChildren([{
     *      type: "group",
     *      items: [{
     *          type: "toggle",
     *          label: "Item Toggle",
     *          active: false,
     *          action: (newValue) => {console.log(newValue);}
     *      }]
     * }]);
     * 
     * @example
     * // Creates two item groups with a single toggle item each
     * ContextMenu.buildMenuChildren([{
     *     type: "group",
     *     items: [{
     *         type: "toggle",
     *         label: "Item Toggle",
     *         active: false,
     *         action: (newValue) => {
     *             console.log(newValue);
     *         }
     *     }]
     * }, {
     *     type: "group",
     *     items: [{
     *         type: "toggle",
     *         label: "Item Toggle",
     *         active: false,
     *         action: (newValue) => {
     *             console.log(newValue);
     *         }
     *     }]
     * }]);
     */
    buildMenuChildren(setup) {
        const mapper = s => {
            if (s.type === "group") return buildGroup(s);
            return this.buildItem(s);
        };
        const buildGroup = function(group) {
            const items = group.items.map(mapper).filter(i => i);
            return React.createElement(MenuComponents.Group, null, items);
        };
        return setup.map(mapper).filter(i => i);
    }

    /**
     * Creates the menu *component* including the wrapping `ContextMenu`.
     * Calls {@link ContextMenu.buildMenuChildren} under the covers.
     * Used to call in combination with {@link ContextMenu.open}.
     * @param {Array<object>} setup - array of item props used to build items. See {@link ContextMenu.buildMenuChildren}
     * @returns {function} the unique context menu component
     */
    buildMenu(setup) {
        return (props) => {return React.createElement(MenuComponents.Menu, props, this.buildMenuChildren(setup));};
    }

    /**
     * Function that allows you to open an entire context menu. Recommended to build the menu with this module.
     * 
     * @param {MouseEvent} event - The context menu event. This can be emulated, requires target, and all X, Y locations.
     * @param {function} menuComponent - Component to render. This can be any react component or output of {@link ContextMenu.buildMenu}
     * @param {object} config - configuration/props for the context menu
     * @param {string} [config.position="right"] - default position for the menu, options: "left", "right"
     * @param {string} [config.align="top"] - default alignment for the menu, options: "bottom", "top"
     * @param {function} [config.onClose] - function to run when the menu is closed
     * @param {boolean} [config.noBlurEvent=false] - No clue
     */
    open(event, menuComponent, config) {
        return ContextMenuActions.openContextMenu(event, function(e) {
            return React.createElement(menuComponent, Object.assign({}, e, {onClose: ContextMenuActions.closeContextMenu}));
        }, config);
    }

    /**
     * Closes the current opened context menu immediately.
     */
    close() {ContextMenuActions.closeContextMenu();}
}

Object.assign(ContextMenu.prototype, MenuComponents);
Object.freeze(ContextMenu);
Object.freeze(ContextMenu.prototype);

try {
    MenuPatcher.initialize();
} catch (error) {
    Logger.error("ContextMenu~Patcher", "Fatal error:", error);
}

export default ContextMenu;
