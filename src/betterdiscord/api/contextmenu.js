import {Filters, getByKeys, getModule, modules, webpackRequire} from "@webpack";
import Patcher from "@modules/patcher";
import Logger from "@common/logger";
import React from "@modules/react";


let startupComplete = false;

const ModulesBundle = getByKeys(["MenuItem", "Menu"]);
const MenuComponents = {
    Separator: ModulesBundle?.MenuSeparator,
    CheckboxItem: ModulesBundle?.MenuCheckboxItem,
    RadioItem: ModulesBundle?.MenuRadioItem,
    ControlItem: ModulesBundle?.MenuControlItem,
    Group: ModulesBundle?.MenuGroup,
    Item: ModulesBundle?.MenuItem,
    Menu: ModulesBundle?.Menu,
};

startupComplete = Object.values(MenuComponents).every(v => v);

if (!startupComplete) {
    const REGEX = /(function .{1,3}\(.{1,3}\){return null}){5}/;
    const EXTRACT_REGEX = /\.type===.{1,3}\.(.{1,3})\)return .{1,3}\.push\((?:null!=.{1,3}\.props\..+?)?{type:"(.+?)",/g;
    const EXTRACT_GROUP_REGEX = /\.type===.{1,3}\.(.{1,3})\){.+{type:"groupstart"/;

    let menuItemsId;
    let menuParser = "";

    for (const key in modules) {
        if (Object.prototype.hasOwnProperty.call(modules, key)) {
            if (REGEX.test(modules[key].toString())) {
                menuItemsId = key;
                break;
            }
        }
    }

    for (const key in modules) {
        if (Object.prototype.hasOwnProperty.call(modules, key)) {
            const string = modules[key].toString();

            if (string.includes(menuItemsId) && string.includes("separator")) {
                menuParser = string;
                break;
            }
        }
    }

    const contextMenuComponents = webpackRequire(menuItemsId);

    for (const [, key, type] of menuParser.matchAll(EXTRACT_REGEX)) {
        switch (type) {
            case "separator": MenuComponents.Separator ??= contextMenuComponents[key]; break;
            case "radio": MenuComponents.RadioItem ??= contextMenuComponents[key]; break;
            case "checkbox": MenuComponents.CheckboxItem ??= contextMenuComponents[key]; break;
            case "item":
            case "customitem": MenuComponents.Item ??= contextMenuComponents[key]; break;
            case "compositecontrol":
            case "control": MenuComponents.ControlItem ??= contextMenuComponents[key]; break;
        }
    }

    const match = menuParser.match(EXTRACT_GROUP_REGEX);
    if (match) {
        MenuComponents.Group ??= contextMenuComponents[match[1]];
    }

    MenuComponents.Menu ??= getModule(Filters.byStrings("getContainerProps()", ".keyboardModeEnabled&&null!="), {searchExports: true});
}

startupComplete = Object.values(MenuComponents).every(v => v);

const ContextMenuActions = (() => {
    const out = {};

    try {
        const ActionsModule = getModule((mod, target, id) => modules[id]?.toString().includes(`type:"CONTEXT_MENU_OPEN"`), {searchExports: false});

        for (const key of Object.keys(ActionsModule)) {
            if (ActionsModule[key].toString().includes("CONTEXT_MENU_CLOSE")) {
                out.closeContextMenu = ActionsModule[key];
            }
            else if (ActionsModule[key].toString().includes("renderLazy")) {
                out.openContextMenu = ActionsModule[key];
            }
        }

        startupComplete &&= typeof (out.closeContextMenu) === "function" && typeof (out.openContextMenu) === "function";
    }
    catch (error) {
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
            const foundModule = getModule(m => Object.values(m).some(v => typeof v === "function" && v.toString().includes(`type:"CONTEXT_MENU_CLOSE"`)), {searchExports: false});
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
     * @param {string} navId Discord's internal `navId` used to identify context menus
     * @param {function} callback Callback function that accepts the React render tree
     * @returns {function} A function that automatically unpatches
     */
    patch(navId, callback) {
        MenuPatcher.patch(navId, callback);

        return () => MenuPatcher.unpatch(navId, callback);
    }

    /**
     * Allows you to remove the patch added to a given context menu.
     *
     * @param {string} navId The original `navId` from patching
     * @param {function} callback The original callback from patching
     */
    unpatch(navId, callback) {
        MenuPatcher.unpatch(navId, callback);
    }

    /**
     * Builds a single menu item. The only prop shown here is the type, the rest should
     * match the actual component being built. View those to see what options exist
     * for each, they often have less in common than you might think.
     *
     * @param {object} props Props used to build the item
     * @param {string} [props.type="text"] Type of the item, options: text, submenu, toggle, radio, custom, separator
     * @returns {object} The created component
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
            // eslint-disable-next-line react-hooks/rules-of-hooks
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
     *
     * @param {Array<object>} setup Array of item props used to build items. See {@link ContextMenu.buildItem}.
     * @returns {Array<object>} Array of the created component
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
     *
     * @param {Array<object>} setup Array of item props used to build items. See {@link ContextMenu.buildMenuChildren}.
     * @returns {function} The unique context menu component
     */
    buildMenu(setup) {
        return (props) => {return React.createElement(MenuComponents.Menu, props, this.buildMenuChildren(setup));};
    }

    /**
     * Function that allows you to open an entire context menu. Recommended to build the menu with this module.
     *
     * @param {MouseEvent} event The context menu event. This can be emulated, requires target, and all X, Y locations.
     * @param {function} menuComponent Component to render. This can be any React component or output of {@link ContextMenu.buildMenu}.
     * @param {object} config Configuration/props for the context menu
     * @param {string} [config.position="right"] Default position for the menu, options: "left", "right"
     * @param {string} [config.align="top"] Default alignment for the menu, options: "bottom", "top"
     * @param {function} [config.onClose] Function to run when the menu is closed
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
}
catch (error) {
    Logger.error("ContextMenu~Patcher", "Fatal error:", error);
}

export default ContextMenu;
