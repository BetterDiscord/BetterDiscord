import ipc from "@modules/ipc";

import Modals from "@ui/modals";
import Toasts from "@ui/toasts";
import Notices from "@ui/notices";
import Tooltip from "@ui/tooltip";
import Group, {buildSetting} from "@ui/settings/group";
import React from "@modules/react";
import ErrorBoundary from "@ui/errorboundary";
import Settings from "@stores/settings";
import NotificationUI from "@modules/notification";


/**
 * `UI` is a utility class for creating user interfaces. Instance is accessible through the {@link BdApi}.
 * @type UI
 * @summary {@link UI} is a utility class for creating user interfaces.
 * @name UI
 */
let cntr = 0;

const UI = {
    /**
     * Shows a generic but very customizable modal.
     *
     * @param {string} title Title of the modal
     * @param {(string|ReactElement|Array<string|ReactElement>)} content A string of text to display in the modal
     */
    alert(title, content) {
        Modals.alert(title, content);
    },

    showNotification(notificationObj) {
        if (!Settings.get("settings", "general", "notificationEnabled")) return;
        cntr++;
        const id = notificationObj.id || `notification-${cntr}`;

        const defaultObj = {
            id,
            title: "",
            content: "",
            type: "info",
            duration: 5000,
            icon: null
        };

        const finalNotification = {...defaultObj, ...notificationObj, id};

        NotificationUI.show(finalNotification);
        return () => NotificationUI.hide(id);
    },

/**
     * Creates a tooltip to automatically show on hover.
     *
     * @param {HTMLElement} node DOM node to monitor and show the tooltip on
     * @param {string|HTMLElement} content String to show in the tooltip
     * @param {object} options Additional options for the tooltip
     * @param {"primary"|"info"|"success"|"warn"|"danger"} [options.style="primary"] Correlates to the Discord styling/colors
     * @param {"top"|"right"|"bottom"|"left"} [options.side="top"] Can be any of top, right, bottom, left
     * @param {boolean} [options.preventFlip=false] Prevents moving the tooltip to the opposite side if it is too big or goes offscreen
     * @param {boolean} [options.disabled=false] Whether the tooltip should be disabled from showing on hover
     * @returns {Tooltip} The tooltip that was generated.
     */
    createTooltip(node, content, options = {}) {
        return Tooltip.create(node, content, options);
    },

    /**
     * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
     *
     * @param {string} title Title of the modal.
     * @param {(string|ReactElement|Array<string|ReactElement>)} children Single or mixed array of React elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
     * @param {object} [options] Options to modify the modal
     * @param {boolean} [options.danger=false] Whether the main button should be red or not
     * @param {string} [options.confirmText=Okay] Text for the confirmation/submit button
     * @param {string} [options.cancelText=Cancel] Text for the cancel button
     * @param {callable} [options.onConfirm=NOOP] Callback to occur when clicking the submit button
     * @param {callable} [options.onCancel=NOOP] Callback to occur when clicking the cancel button
     * @param {callable} [options.onClose=NOOP] Callback to occur when exiting the modal
     * @returns {string} The key used for this modal.
     */
    showConfirmationModal(title, content, options = {}) {
        return Modals.showConfirmationModal(title, content, options);
    },

    /**
     * Shows a changelog modal in a similar style to Discord's. Customizable with images, videos, colored sections and supports markdown.
     *
     * The changes option is a array of objects that have this typing:
     * ```ts
     * interface Changes {
     *     title: string;
     *     type: "fixed" | "added" | "progress" | "changed";
     *     items: Array<string>;
     *     blurb?: string;
     * }
     * ```
     *
     * @param {object} options Information to display in the modal
     * @param {string} options.title Title to show in the modal header
     * @param {string} options.subtitle Title to show below the main header
     * @param {string} [options.blurb] Text to show in the body of the modal before the list of changes
     * @param {string} [options.banner] URL to an image to display as the banner of the modal
     * @param {string} [options.video] Youtube link or url of a video file to use as the banner
     * @param {string} [options.poster] URL to use for the video freeze-frame poster
     * @param {string|ReactElement|Array<string|ReactElement>} [options.footer] What to show in the modal footer
     * @param {Array<Changes>} [options.changes] List of changes to show (see description for details)
     * @returns {string} The key used for this modal.
     */
    showChangelogModal(options) {
        return Modals.showChangelogModal(options);
    },

    /**
     * Shows a modal for joining a guild like you would natively through Discord.
     * @param {string} inviteCode the invite code
     */
    showInviteModal(inviteCode) {
        return Modals.showGuildJoinModal(inviteCode);
    },

    /**
     * This shows a toast similar to android towards the bottom of the screen.
     *
     * @param {string} content The string to show in the toast
     * @param {object} options Options for the toast
     * @param {string} [options.type=""] Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: "".
     * @param {boolean} [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: `true`.
     * @param {number} [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: `3000`.
     * @param {boolean} [options.forceShow=false] Whether to force showing the toast and ignore the BD setting
     */
    showToast(content, options = {}) {
        Toasts.show(content, options);
    },

    /**
     * Shows a notice above Discord's chat layer.
     *
     * @param {string|Node} content Content of the notice
     * @param {object} options Options for the notice
     * @param {string} [options.type="info" | "error" | "warning" | "success"] Type for the notice. Will affect the color.
     * @param {Array<{label: string, onClick: function}>} [options.buttons] Buttons that should be added next to the notice text
     * @param {number} [options.timeout=10000] Timeout until the notice is closed. Will not fire when set to `0`.
     * @returns {function} A callback for closing the notice. Passing `true` as first parameter closes immediately without transitioning out.
     */
    showNotice(content, options = {}) {
        return Notices.show(content, options);
    },

    /**
     * Gives access to the [Electron Dialog](https://www.electronjs.org/docs/latest/api/dialog/) api.
     * Returns a `Promise` that resolves to an `object` that has a `boolean` cancelled and a `filePath` string for saving and a `filePaths` string array for opening.
     *
     * @param {object} options Options object to configure the dialog
     * @param {"open"|"save"} [options.mode="open"] Determines whether the dialog should open or save files
     * @param {string} [options.defaultPath=~] Path the dialog should show on launch
     * @param {Array<object<string, string[]>>} [options.filters=[]] An array of [file filters](https://www.electronjs.org/docs/latest/api/structures/file-filter)
     * @param {string} [options.title] Title for the titlebar
     * @param {string} [options.message] Message for the dialog
     * @param {boolean} [options.showOverwriteConfirmation=false] Whether the user should be prompted when overwriting a file
     * @param {boolean} [options.showHiddenFiles=false] Whether hidden files should be shown in the dialog
     * @param {boolean} [options.promptToCreate=false] Whether the user should be prompted to create non-existent folders
     * @param {boolean} [options.openDirectory=false] Whether the user should be able to select a directory as a target
     * @param {boolean} [options.openFile=true] Whether the user should be able to select a file as a target
     * @param {boolean} [options.multiSelections=false] Whether the user should be able to select multiple targets
     * @param {boolean} [options.modal=false] Whether the dialog should act as a modal to the main window
     * @returns {Promise<object>} Result of the dialog
     */
    async openDialog(options) {
        const data = await ipc.openDialog(options);
        if (data.error) throw new Error(data.error);

        return data;
    },

    /**
     * Creates a single setting wrapped in a setting item that has a name and note.
     * The shape of the object should match the props of the component you want to render, check the
     * `BdApi.Components` section for details. Shown below are ones common to all setting types.
     * @param {object} setting
     * @param {string} setting.type One of: dropdown, number, switch, text, slider, radio, keybind, color, custom
     * @param {string} setting.id Identifier to used for callbacks
     * @param {string} setting.name Visual name to display
     * @param {string} setting.note Visual description to display
     * @param {any} setting.value Current value of the setting
     * @param {ReactElement} [setting.children] Only used for "custom" type
     * @param {CallableFunction} [setting.onChange] Callback when the value changes (only argument is new value)
     * @param {boolean} [setting.disabled=false] Whether this setting is disabled
     * @param {boolean} [setting.inline=true] Whether the input should render inline with the name (this is false by default for radio type)
     * @returns A SettingItem with a an input as the child
     */
    buildSettingItem(setting) {
        return buildSetting(setting);
    },

    /**
     * Creates a settings panel (react element) based on json-like data.
     *
     * The `settings` array here is an array of the same settings types described in `buildSetting` above.
     * However, this API allows one additional setting "type" called `category`. This has the same properties
     * as the Group React Component found under the `Components` API.
     *
     * `onChange` will always be given 3 arguments: category id, setting id, and setting value. In the case
     * that you have settings on the "root" of the panel, the category id is `null`. Any `onChange`
     * listeners attached to individual settings will fire before the panel-level change listener.
     *
     * `onDrawerToggle` is given 2 arguments: category id, and the current shown state. You can use this to
     * save drawer states.
     *
     * `getDrawerState` is given 2 arguments: category id, and the default shown state. You can use this to
     * recall a saved drawer state.
     *
     * @param {object} props
     * @param {Array<object>} props.settings Array of settings to show
     * @param {CallableFunction} props.onChange Function called on every change
     * @param {CallableFunction} [props.onDrawerToggle] Optionally used to save drawer states
     * @param {CallableFunction} [props.getDrawerState] Optionially used to recall drawer states
     * @returns React element usable for a settings panel
     */
    buildSettingsPanel({settings, onChange, onDrawerToggle, getDrawerState}) {
        if (!settings?.length) throw new Error("No settings provided!");

        return React.createElement(ErrorBoundary, {id: "buildSettingsPanel", name: "BdApi.UI"}, settings.map(setting => {
            if (!setting.id || !setting.type) throw new Error(`Setting item missing id or type`);

            if (setting.type === "category") {
                const shownByDefault = setting.hasOwnProperty("shown") ? setting.shown : true;

                return React.createElement(Group, {
                    ...setting,
                    onChange: onChange,
                    onDrawerToggle: state => onDrawerToggle?.(setting.id, state),
                    shown: getDrawerState?.(setting.id, shownByDefault) ?? shownByDefault
                });
            }

            return buildSetting({
                ...setting,
                onChange: value => {
                    setting?.onChange?.(value);
                    onChange(null, setting.id, value);
                }
            });
        }));
    }

};

Object.freeze(UI);

export default UI;