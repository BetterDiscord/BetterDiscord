import ipc from "@modules/ipc";

import Modals from "@ui/modals";
import Toasts, {type ToastOptions} from "@stores/toasts";
import Notices, {type NoticeOptions} from "@ui/notices";
import Tooltip, {type TooltipOptions} from "@ui/tooltip";
import Group, {buildSetting} from "@ui/settings/group";
import React from "@modules/react";
import ErrorBoundary from "@ui/errorboundary";
import Settings from "@stores/settings";
import NotificationUI, {type Notification} from "@ui/notifications";
import type {ReactElement} from "react";
import type {ChangelogProps} from "@ui/modals/changelog";


/**
 * `UI` is a utility class for creating user interfaces. Instance is accessible through the {@link BdApi}.
 * @summary {@link UI} is a utility class for creating user interfaces.
 * @name UI
 */

// TODO: merge types after converting ui folder
const UI = {
    /**
     * Shows a generic but very customizable modal.
     *
     * @param title Title of the modal
     * @param content A string of text to display in the modal
     */
    alert(title: string, content: string | ReactElement | Array<string | ReactElement>) {
        Modals.alert(title, content);
    },

    showNotification(notificationObj: Notification) {
        if (!Settings.get("settings", "general", "notificationEnabled")) return;

        const defaultObj = {
            title: "",
            content: "",
            type: "info" as const,
            duration: 5000,
            actions: []
        };

        const finalNotification = {...defaultObj, ...notificationObj};

        return NotificationUI.show(finalNotification);
    },

    /**
     * Creates a tooltip to automatically show on hover.
     *
     * @param node DOM node to monitor and show the tooltip on
     * @param content String to show in the tooltip
     * @param options Additional options for the tooltip
     * @param [options.style="primary"] Correlates to the Discord styling/colors
     * @param [options.side="top"] Can be any of top, right, bottom, left
     * @param [options.preventFlip=false] Prevents moving the tooltip to the opposite side if it is too big or goes offscreen
     * @param [options.disabled=false] Whether the tooltip should be disabled from showing on hover
     * @returns The tooltip that was generated.
     */
    createTooltip(node: HTMLElement, content: string | HTMLElement, options: TooltipOptions = {}) {
        return Tooltip.create(node, content, options);
    },

    /**
     * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
     *
     * @param title Title of the modal.
     * @param children Single or mixed array of React elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
     * @param [options] Options to modify the modal
     * @param [options.danger=false] Whether the main button should be red or not
     * @param [options.confirmText=Okay] Text for the confirmation/submit button
     * @param [options.cancelText=Cancel] Text for the cancel button
     * @param [options.onConfirm=NOOP] Callback to occur when clicking the submit button
     * @param [options.onCancel=NOOP] Callback to occur when clicking the cancel button
     * @param [options.onClose=NOOP] Callback to occur when exiting the modal
     * @returns The key used for this modal.
     */
    showConfirmationModal(title: string, content: string | ReactElement | Array<string | ReactElement>, options: {
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
        onClose?: () => void;
    } = {}) {
        return Modals.showConfirmationModal(title, content, options);
    },

    /**
     * Shows a changelog modal in a similar style to Discord's. Customizable with images, videos, colored sections and supports markdown.
     *
     * The changes option is a array of objects that have this typing:
     * ```ts
     * interface Changes {
     *     title: string;
     *     type: "fixed" | "added" | "progress" | "improved";
     *     items: Array<string>;
     *     blurb?: string;
     * }
     * ```
     *
     * @param options Information to display in the modal
     * @param options.title Title to show in the modal header
     * @param options.subtitle Title to show below the main header
     * @param [options.blurb] Text to show in the body of the modal before the list of changes
     * @param [options.banner] URL to an image to display as the banner of the modal
     * @param [options.video] Youtube link or url of a video file to use as the banner
     * @param [options.poster] URL to use for the video freeze-frame poster
     * @param [options.footer] What to show in the modal footer
     * @param [options.changes] List of changes to show (see description for details)
     * @returns The key used for this modal.
     */
    showChangelogModal(options: ChangelogProps) {
        return Modals.showChangelogModal(options);
    },

    /**
     * Shows a modal for joining a guild like you would natively through Discord.
     * @param inviteCode the invite code
     */
    showInviteModal(inviteCode: string) {
        return Modals.showGuildJoinModal(inviteCode);
    },

    /**
     * This shows a toast similar to android towards the bottom of the screen.
     *
     * @param content The string to show in the toast
     * @param options Options for the toast
     * @param [options.type=""] Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: "".
     * @param [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: `true`.
     * @param [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: `3000`.
     * @param [options.forceShow=false] Whether to force showing the toast and ignore the BD setting
     */
    showToast(content: string, options: ToastOptions = {}) {
        Toasts.show(content, options);
    },

    /**
     * Shows a notice above Discord's chat layer.
     *
     * @param content Content of the notice
     * @param options Options for the notice
     * @param [options.type="info" | "error" | "warning" | "success"] Type for the notice. Will affect the color.
     * @param>} [options.buttons] Buttons that should be added next to the notice text
     * @param [options.timeout=10000] Timeout until the notice is closed. Will not fire when set to `0`.
     * @returns A callback for closing the notice. Passing `true` as first parameter closes immediately without transitioning out.
     */
    showNotice(content: string, options: NoticeOptions = {}) {
        return Notices.show(content, options);
    },

    /**
     * Gives access to the [Electron Dialog](https://www.electronjs.org/docs/latest/api/dialog/) api.
     * Returns a `Promise` that resolves to an `object` that has a `boolean` cancelled and a `filePath` string for saving and a `filePaths` string array for opening.
     *
     * @param options Options object to configure the dialog
     * @param [options.mode="open"] Determines whether the dialog should open or save files
     * @param [options.defaultPath=~] Path the dialog should show on launch
     * @param [options.filters=[]] An array of [file filters](https://www.electronjs.org/docs/latest/api/structures/file-filter)
     * @param [options.title] Title for the titlebar
     * @param [options.message] Message for the dialog
     * @param [options.showOverwriteConfirmation=false] Whether the user should be prompted when overwriting a file
     * @param [options.showHiddenFiles=false] Whether hidden files should be shown in the dialog
     * @param [options.promptToCreate=false] Whether the user should be prompted to create non-existent folders
     * @param [options.openDirectory=false] Whether the user should be able to select a directory as a target
     * @param [options.openFile=true] Whether the user should be able to select a file as a target
     * @param [options.multiSelections=false] Whether the user should be able to select multiple targets
     * @param [options.modal=false] Whether the dialog should act as a modal to the main window
     * @returns Result of the dialog
     */
    // TODO: merge types with other 2 processes
    async openDialog(options: any) {
        const data = await ipc.openDialog(options);
        if (data.error) throw new Error(data.error);

        return data;
    },

    /**
     * Creates a single setting wrapped in a setting item that has a name and note.
     * The shape of the object should match the props of the component you want to render, check the
     * `BdApi.Components` section for details. Shown below are ones common to all setting types.
     * @param setting
     * @param setting.type One of: dropdown, number, switch, text, slider, radio, keybind, color, custom
     * @param setting.id Identifier to used for callbacks
     * @param setting.name Visual name to display
     * @param setting.note Visual description to display
     * @param setting.value Current value of the setting
     * @param [setting.children] Only used for "custom" type
     * @param [setting.onChange] Callback when the value changes (only argument is new value)
     * @param [setting.disabled=false] Whether this setting is disabled
     * @param [setting.inline=true] Whether the input should render inline with the name (this is false by default for radio type)
     * @returns A SettingItem with a an input as the child
     */
    buildSettingItem(setting: any) {
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
     * @param props
     * @param props.settings Array of settings to show
     * @param props.onChange Function called on every change
     * @param [props.onDrawerToggle] Optionally used to save drawer states
     * @param [props.getDrawerState] Optionially used to recall drawer states
     * @returns React element usable for a settings panel
     */
    // TODO: remove any
    buildSettingsPanel({settings, onChange, onDrawerToggle, getDrawerState}: any) {
        if (!settings?.length) throw new Error("No settings provided!");

        return React.createElement(ErrorBoundary, {
            id: "buildSettingsPanel",
            name: "BdApi.UI"
        }, settings.map((setting: any) => {
            if (!setting.id || !setting.type) throw new Error(`Setting item missing id or type`);

            if (setting.type === "category") {
                const shownByDefault = setting.hasOwnProperty("shown") ? setting.shown : true;

                return React.createElement(Group, {
                    ...setting,
                    onChange: onChange,
                    onDrawerToggle: (state: any) => onDrawerToggle?.(setting.id, state),
                    shown: getDrawerState?.(setting.id, shownByDefault) ?? shownByDefault
                });
            }

            return buildSetting({
                ...setting,
                onChange: (value: any) => {
                    setting?.onChange?.(value);
                    onChange(null, setting.id, value);
                }
            });
        }));
    }

};

Object.freeze(UI);

export default UI;