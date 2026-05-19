import {Filters, getByKeys, getLazyByKeys, getMangled, getModule, webpackRequire} from "@webpack";
import Logger from "@common/logger";
import React from "@modules/react";
import DiscordModules from "@modules/discordmodules";
import NodePatcher from "@modules/nodepatcher";
import DOMManager from "@modules/dommanager";
import type {DiscordIconProps} from "@utils/icon";


let startupComplete = false;

// https://github.com/doggybootsy/vx/blob/main/packages/mod/src/api/menu/components.ts
type MenuItemColor = "default" | "danger" | "premium-gradient";

export interface BaseMenuItemProps extends Record<string, any> {
    id: string,
    disabled?: boolean,
    action?(event: React.MouseEvent): void,
    children?: React.ReactNode,
    icon?: React.FunctionComponent<DiscordIconProps>,
    color?: MenuItemColor,
    subtext?: string,
    focusedClassName?: string,
    className?: string,
    keepItemStyles?: boolean,
    dontCloseOnActionIfHoldingShiftKey?: boolean,
    imageUrl?(props: unknown): string;
};

export interface MenuCheckboxItemProps {
    id: string,
    label: string,
    disabled?: boolean,
    subtext?: React.ReactNode,
    action?(event: React.MouseEvent): void,
    checked: boolean;
};

export interface MenuControlProps {
    disabled?: boolean,
    isFocused: boolean,
    onClose(): void;
};

export interface MenuRadioItemProps extends MenuCheckboxItemProps {
    group: string;
};

export interface MenuControlRef {
    activate(): void,
    blur(): void,
    focus(): void;
};

export interface MenuControlItemProps {
    id: string,
    label?: string,
    disabled?: boolean,
    control(props: MenuControlProps, ref: {ref: null | void | MenuControlRef;}): React.ReactElement;
};

// https://github.com/doggybootsy/vx/blob/main/packages/mod/src/betterdiscord/context-menu.tsx
interface MenuItemSeparator {
    type: "separator";
}

interface MenuItemSubmenu extends BaseMenuItemProps {
    type: "submenu",
    render?: MenuItem[],
    items?: MenuItem[],
    danger?: boolean,
    onClick?(event: React.MouseEvent): void,
}

interface MenuItemDefault extends BaseMenuItemProps {
    type?: "item",
    danger?: boolean,
    onClick?(event: React.MouseEvent): void,
}

interface MenuItemRadio extends MenuRadioItemProps {
    type: "radio",
    danger?: boolean,
    onClick?(event: React.MouseEvent): void,
    active?: boolean;
}

interface MenuItemCheckbox extends MenuCheckboxItemProps {
    type: "toggle",
    danger?: boolean,
    onClick?(event: React.MouseEvent): void,
    active?: boolean;
}

interface MenuItemControl extends MenuControlItemProps {
    type: "control";
}

interface MenuItemGroup {
    type: "group",
    items: MenuItem[];
}

type MenuItem = MenuItemSeparator | MenuItemSubmenu | MenuItemDefault | MenuItemRadio | MenuItemCheckbox | MenuItemControl;

interface ContextMenuComponents {
    MenuSeparator: React.FC;
    MenuCheckboxItem: React.FC<React.PropsWithChildren<MenuCheckboxItemProps>>;
    MenuRadioItem: React.FC<React.PropsWithChildren<MenuRadioItemProps>>;
    MenuControlItem: React.FC<React.PropsWithChildren<MenuControlItemProps>>;
    MenuGroup: React.FC<React.PropsWithChildren>;
    MenuItem: React.FC<React.PropsWithChildren<BaseMenuItemProps>>;
    Menu: React.FC<React.PropsWithChildren<MenuRenderProps>>;
}

const ModulesBundle = getByKeys<ContextMenuComponents>(["MenuItem", "Menu"], {cacheId: "core-contextmenu-ModulesBundle"})!;
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
    const EXTRACT_GROUP_ITEM_REGEX = /\.type===.{1,3}\.(.{1,3})\){.+{type:"(groupstart|customitem)".+\.type===.{1,3}\.(.{1,3})\){.+?{type:"(groupstart|customitem)"/;
    let menuItemsId;
    let menuParser = "";

    for (const key in webpackRequire.m) {
        if (Object.prototype.hasOwnProperty.call(webpackRequire.m, key)) {
            if (REGEX.test(webpackRequire.m[key].toString())) {
                menuItemsId = key;
                break;
            }
        }
    }

    for (const key in webpackRequire.m) {
        if (Object.prototype.hasOwnProperty.call(webpackRequire.m, key)) {
            const string = webpackRequire.m[key].toString();

            if (string.includes(menuItemsId!) && string.includes("Menu API only allows Items and groups of Items as children")) {
                menuParser = string;
                break;
            }
        }
    }

    const contextMenuComponents = webpackRequire(menuItemsId!);

    for (const [, key, type] of menuParser.matchAll(EXTRACT_REGEX)) {
        switch (type) {
            case "separator": MenuComponents.Separator ??= contextMenuComponents[key]; break;
            case "radio": MenuComponents.RadioItem ??= contextMenuComponents[key]; break;
            case "checkbox": MenuComponents.CheckboxItem ??= contextMenuComponents[key]; break;
            case "compositecontrol":
            case "control": MenuComponents.ControlItem ??= contextMenuComponents[key]; break;
            case "customitem":
            case "item": MenuComponents.Item ??= contextMenuComponents[key]; break;
        }
    }

    const matchA = menuParser.match(EXTRACT_GROUP_REGEX);
    if (matchA) {
        MenuComponents.Group ??= contextMenuComponents[matchA[1]];
    }

    const matchB = menuParser.match(EXTRACT_GROUP_ITEM_REGEX);
    if (matchB) {
        MenuComponents.Group ??= contextMenuComponents[matchB[matchB[2] === "groupstart" ? 1 : 3]];
        MenuComponents.Item ??= contextMenuComponents[matchB[matchB[2] === "customitem" ? 1 : 3]];
    }

    MenuComponents.Menu ??= getModule(Filters.byStrings("getContainerProps()", ".keyboardModeEnabled&&null!="), {
        searchExports: true,
        firstId: 397927,
        cacheId: "core-contextmenu-menu"
    })!;
}

startupComplete = Object.values(MenuComponents).every(v => v);

const ContextMenuActions = (() => {
    const out: any = {};

    try {
        Object.assign(out, getMangled(Filters.bySource("new DOMRect", "CONTEXT_MENU_CLOSE"), {
            closeContextMenu: Filters.byStrings("CONTEXT_MENU_CLOSE"),
            openContextMenu: Filters.byStrings("renderLazy")
        }, {searchDefault: false, cacheId: "core-contextmenu-Actions"}));

        startupComplete &&= typeof (out.closeContextMenu) === "function" && typeof (out.openContextMenu) === "function";
    }
    catch (error) {
        startupComplete = false;
        Logger.stacktrace("ContextMenu~Components", "Fatal startup error:", error as Error);

        Object.assign(out, {
            closeContextMenu: () => {},
            openContextMenu: () => {}
        });
    }

    return out;
})();

interface MenuRenderProps {
    config: MenuConfig & {context: "APP";},
    context: "APP",
    onHeightUpdate: () => void,
    position: "right" | "left",
    target: Element,
    theme: string;
}

interface MenuConfig {
    /** Default position for the menu */
    position?: "right" | "left",
    /** Default alignment for the menu */
    align?: "top" | "bottom",
    /** Function to run when the menu is closed */
    onClose?(): void;
}

interface ContextMenuObject {
    config: MenuConfig;
    rect: DOMRect;
    render?: React.ComponentType<MenuRenderProps>;
    renderLazy?(): Promise<React.ComponentType<MenuRenderProps>>;
    target: Element;
}

type MenuRenderNode = React.ReactElement<MenuRenderProps, React.ComponentType<MenuRenderProps>>;

type PatchCallback = (res: React.ReactElement<React.PropsWithChildren<MenuRenderProps>, React.ComponentType<React.PropsWithChildren<MenuRenderProps>>>, props: MenuRenderProps, instance?: React.Component<MenuRenderProps>) => void;

function globToRegExp(glob: string) {
    let out = "^";

    for (let i = 0; i < glob.length; i++) {
        const c = glob[i];

        if (c === "*") {
            out += ".*";
            continue;
        }

        // escape regex metacharacters
        if ("\\^$+?.()|{}[]".includes(c)) {
            out += "\\";
        }

        out += c;
    }

    out += "$";
    return new RegExp(out);
}

const nodePatcher = new NodePatcher();

class MenuPatcher {
    private static async contextMenuFixForLucide() {
        // Hopefully this will be faster than using css class selectors
        const menuClasses = await getLazyByKeys<Record<string, string>>(["colorDefault", "focused"], {
            cacheId: "core-contextmenu-classes"
        });

        // Discord manually sets the fill here, so we are reverting it back to the HTML tag
        // .colorDefault.focused:not(.checkboxContainer) path {fill: var(--interactive-text-active)}
        // .colorDanger.focused:not(.checkboxContainer) path {fill: var(--text-feedback-critical)}

        DOMManager.injectStyle("bd-lucide-context-menu-fix", `
            :where(.${menuClasses!.colorDefault}, ${menuClasses!.colorDanger}).${menuClasses!.focused}:not(.${menuClasses!.checkboxContainer}) .lucide:not(.lucide-betterdiscord) path {
                fill: revert;
            }
        `);
    }

    static MAX_PATCH_ITERATIONS = 10;

    static patches: {
        named: Record<string, Set<PatchCallback>>,
        regex: Array<{regex: RegExp, patches: Set<PatchCallback>;}>;
    } = {
            named: {},
            regex: []
        };

    static handleRender<T extends React.ComponentType<MenuRenderProps>>(Component: T): T {
        const fNode = {type: Component} as MenuRenderNode;

        nodePatcher.patch(fNode, (props, node, instance) => {
            if (React.isValidElement(node)) {
                if ((node.props as any).navId) {
                    MenuPatcher.runPatches((node.props as any).navId, node as MenuRenderNode, props, instance);
                }
                else if (node.type && typeof node.type !== "string") {
                    MenuPatcher.patchRecursive(node as MenuRenderNode);
                }
            }

            return node;
        });

        return fNode.type as T;
    }

    static initialize() {
        if (!startupComplete) return Logger.warn("ContextMenu~Patcher", "Startup wasn't successful, aborting initialization.");

        this.contextMenuFixForLucide();

        DiscordModules.Dispatcher.addInterceptor<{type: "CONTEXT_MENU_OPEN", contextMenu: ContextMenuObject;}>((event) => {
            if (event.type === "CONTEXT_MENU_OPEN") {
                if (event.contextMenu.renderLazy) {
                    const renderLazy = event.contextMenu.renderLazy;
                    event.contextMenu.renderLazy = async () => {
                        const render = await renderLazy();
                        return this.handleRender(render);
                    };
                }
                else {
                    event.contextMenu.render = this.handleRender(event.contextMenu.render!);
                }
            }
        });
    }

    static patchRecursive(target: MenuRenderNode, iteration = 0) {
        if (iteration >= this.MAX_PATCH_ITERATIONS) return;
        const depth = ++iteration;

        nodePatcher.patch(target, (props, res, instance) => {
            if (React.isValidElement(res)) {
                const nodeProps = res.props as any;

                if (nodeProps?.navId ?? nodeProps?.children?.props?.navId) {
                    MenuPatcher.runPatches(nodeProps.navId ?? nodeProps?.children?.props?.navId, res as any, props, instance);
                }
                else {
                    const layer = nodeProps?.children ? nodeProps.children : res;

                    if (layer?.type && typeof layer.type !== "string") {
                        MenuPatcher.patchRecursive(layer, depth);
                    }
                }
            }

            return res;
        });
    }

    static runPatches(id: string, res: MenuRenderNode, props: MenuRenderProps, instance?: React.Component<MenuRenderProps>) {
        if (this.patches.named[id]) {
            for (const patch of this.patches.named[id]) {
                try {
                    patch(res, props, instance);
                }
                catch (error) {
                    Logger.error("ContextMenu~runPatches", `Could not run ${id} patch for`, patch, error);
                }
            }
        }

        for (const element of this.patches.regex) {
            if (!element.regex.test(id)) continue;

            for (const patch of element.patches) {
                try {
                    patch(res, props, instance);
                }
                catch (error) {
                    Logger.error("ContextMenu~runPatches", `Could not run ${id} patch for`, patch, error);
                }
            }
        }
    }

    static patch(id: string | RegExp, callback: PatchCallback) {
        if (typeof id === "string" && id.includes("*")) {
            id = globToRegExp(id);
        }

        if (typeof id === "object") {
            const index = this.patches.regex.findIndex(patch => patch.regex.flags === id.flags && patch.regex.source === id.source);

            if (index !== -1) {
                this.patches.regex[index].patches.add(callback);
            }
            else {
                this.patches.regex.push({
                    regex: id,
                    patches: new Set([callback])
                });
            }

            return;
        }

        this.patches.named[id] ??= new Set();
        this.patches.named[id].add(callback);
    }

    static unpatch(id: string | RegExp, callback: PatchCallback) {
        if (typeof id === "string" && id.includes("*")) {
            id = globToRegExp(id);
        }

        if (typeof id === "object") {
            const index = this.patches.regex.findIndex(patch => patch.regex.flags === id.flags && patch.regex.source === id.source);

            if (index !== -1) {
                this.patches.regex[index].patches.delete(callback);

                if (this.patches.regex[index].patches.size === 0) {
                    this.patches.regex.splice(index, 1);
                }
            }

            return;
        }

        this.patches.named[id]?.delete(callback);
        if (this.patches.named[id]?.size === 0) {
            delete this.patches.named[id];
        }
    }
}


/**
 * `ContextMenu` is a module to help patch and create context menus. An instance is available on {@link BdApi}.
 */
class ContextMenu {
    /** @ignore */
    constructor() {};

    /**
     * Allows you to patch a given context menu. Acts as a wrapper around the `Patcher`.
     *
     * @param navId Discord's internal `navId` used to identify context menus
     * @param callback Callback function that accepts the React render tree
     * @returns A function that automatically unpatches
     */
    patch(navId: string | RegExp, callback: PatchCallback) {
        MenuPatcher.patch(navId, callback);

        return () => MenuPatcher.unpatch(navId, callback);
    }

    /**
     * Allows you to remove the patch added to a given context menu.
     *
     * @param navId The original `navId` from patching
     * @param callback The original callback from patching
     */
    unpatch(navId: string | RegExp, callback: PatchCallback) {
        MenuPatcher.unpatch(navId, callback);
    }

    /**
     * Builds a single menu item. The only prop shown here is the type, the rest should
     * match the actual component being built. View those to see what options exist
     * for each, they often have less in common than you might think.
     *
     * @param props Props used to build the item
     * @returns The created component
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
    buildItem(props: MenuItem) {
        const {type} = props;
        if (type === "separator") return React.createElement(MenuComponents.Separator!);

        let Component = MenuComponents.Item as React.FC<any>;
        if (type === "submenu") {
            if (!props.children) {
                const children = props.render || props.items;
                if (children) props.children = this.buildMenuChildren(children);
            }
        }
        else if (type === "toggle" || type === "radio") {
            Component = type === "toggle" ? MenuComponents.CheckboxItem : MenuComponents.RadioItem;
            if (props.active) props.checked = props.active;
        }
        else if (type === "control") {
            Component = MenuComponents.ControlItem;
        }
        if (!props.id) props.id = `${props.label.replace(/^[^a-z]+|[^\w-]+/gi, "-")}`;

        if (props.type !== "control") {
            if (props.danger) (props as BaseMenuItemProps).color = "danger";
            if (props.onClick && !props.action) props.action = props.onClick;
            (props as BaseMenuItemProps).extended = true;
        }

        // This is done to make sure the UI actually displays the on/off correctly
        if (type === "toggle") {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [active, doToggle] = React.useState(props.checked || false);
            const originalAction = props.action;
            props.checked = active;
            props.action = function (ev: React.MouseEvent) {
                originalAction?.(ev);
                if (!ev.defaultPrevented) doToggle(!active);
            };
        }

        return React.createElement(Component, props);
    }

    /**
     * Creates the all the items **and groups** of a context menu recursively.
     * There is no hard limit to the number of groups within groups or number
     * of items in a menu.
     *
     * @param setup Array of item props used to build items. See {@link ContextMenu.buildItem}.
     * @returns Array of the created component
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
    buildMenuChildren(setup: ReadonlyArray<MenuItem | MenuItemGroup>) {
        const mapper = (s: MenuItem | MenuItemGroup) => {
            if (s.type === "group") return buildGroup(s);
            return this.buildItem(s);
        };
        const buildGroup = function (group: MenuItemGroup): React.ReactElement {
            const items = group.items.map(mapper).filter(i => i);
            return React.createElement(MenuComponents.Group!, null, items);
        };
        return setup.map(mapper).filter(i => i);
    }

    /**
     * Creates the menu *component* including the wrapping `ContextMenu`.
     * Calls {@link ContextMenu.buildMenuChildren} under the covers.
     * Used to call in combination with {@link ContextMenu.open}.
     *
     * @param setup Array of item props used to build items. See {@link ContextMenu.buildMenuChildren}.
     * @returns The unique context menu component
     */
    buildMenu(setup: ReadonlyArray<MenuItem | MenuItemGroup>) {
        return (props: MenuRenderProps) => {return React.createElement(MenuComponents.Menu!, props, this.buildMenuChildren(setup));};
    }

    /**
     * Function that allows you to open an entire context menu. Recommended to build the menu with this module.
     *
     * @param event The context menu event. This can be emulated, requires target, and all X, Y locations.
     * @param menuComponent Component to render. This can be any React component or output of {@link ContextMenu.buildMenu}.
     * @param config Configuration/props for the context menu
     */
    open(event: MouseEvent, menuComponent: React.ComponentType<MenuRenderProps>, config?: MenuConfig) {
        return ContextMenuActions.openContextMenu(event, function (props: MenuRenderProps) {
            return React.createElement(menuComponent, Object.assign({}, props, {onClose: ContextMenuActions.closeContextMenu}));
        }, config);
    }

    /**
     * Closes the current opened context menu immediately.
     */
    close() {ContextMenuActions.closeContextMenu();}

    Separator = MenuComponents.Separator;
    CheckboxItem = MenuComponents.CheckboxItem;
    RadioItem = MenuComponents.RadioItem;
    ControlItem = MenuComponents.ControlItem;
    Group = MenuComponents.Group;
    Item = MenuComponents.Item;
    Menu = MenuComponents.Menu;
}

Object.freeze(ContextMenu);
Object.freeze(ContextMenu.prototype);

try {
    MenuPatcher.initialize();
}
catch (error) {
    Logger.error("ContextMenu~Patcher", "Fatal error:", error);
}

try {
    // Remove that annoying console warn spam
    Object.defineProperty(document, "ownerDocument", {
        value: document
    });
}
// eslint-disable-next-line no-empty
catch {}

export default ContextMenu;
