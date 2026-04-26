import ipc from "@modules/ipc";

import Modals from "@ui/modals";
import Toasts, {type ToastOptions} from "@stores/toasts";
import Notices, {type NoticeOptions} from "@ui/notices";
import Tooltip, {type TooltipOptions} from "@ui/tooltip";
import Group, {buildSetting, type ButtonSetting, type CustomSetting, type GroupOnChange} from "@ui/settings/group";
import React from "@modules/react";
import ErrorBoundary from "@ui/errorboundary";
import Settings from "@stores/settings";
import NotificationUI, {type Notification} from "@ui/notifications";
import type {ReactElement} from "react";
import type {ChangelogProps} from "@ui/modals/changelog";
import type {DialogOptions} from "@common/types/ipc";
import type {Setting, SettingsCategory} from "@data/settings";
import type {ConfirmationModalOptions} from "@ui/modals/confirmation";

export interface SettingsPanelProps {
    /** An array of settings to show */
    settings: Array<Setting | SettingsCategory>;
    /** A function to call on every change */
    onChange?: (categoryId: string | null, settingId: string, value: any) => void;
    /** Optionally used to recall drawer states */
    getDrawerState?: (categoryId: string, defaultShown: boolean) => boolean;
    /** Optionally used to save drawer states */
    onDrawerToggle?: (categoryId: string, shown: boolean) => void;
}

/**
 * `UI` is a utility class for creating user interfaces. Instance is accessible through the {@link BdApi}.
 * @summary {@link UI} is a utility class for creating user interfaces.
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

    /**
     * Shows a customizable notification to the user.
     * @returns An object with `isVisible` and `close` methods
     */
    showNotification(options: Notification) {
        if (!Settings.get("settings", "general", "notificationEnabled")) return;

        const defaultObj = {
            title: "",
            content: "",
            type: "info" as const,
            duration: 5000,
            actions: []
        };

        const finalNotification = {...defaultObj, ...options};

        return NotificationUI.show(finalNotification);
    },

    /**
     * Creates a tooltip to automatically show on hover.
     *
     * @param node DOM node to monitor and show the tooltip on
     * @param content String to show in the tooltip
     * @param options Additional options for the tooltip
     * @returns The tooltip that was generated
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
     */
    showConfirmationModal(title: string, content: string | ReactElement | Array<string | ReactElement>, options: ConfirmationModalOptions = {}) {
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
     * @returns The key used for this modal
     */
    showChangelogModal(options: ChangelogProps) {
        return Modals.showChangelogModal(options);
    },

    /**
     * Shows a modal for joining a guild like you would natively through Discord.
     * @param inviteCode The invite code
     */
    showInviteModal(inviteCode: string) {
        return Modals.showGuildJoinModal(inviteCode);
    },

    /**
     * Shows a toast similar to android towards the bottom of the screen.
     *
     * @param content The string to show in the toast
     * @param options Options for the toast
     */
    showToast(content: string, options: ToastOptions = {}) {
        Toasts.show(content, options);
    },

    /**
     * Shows a notice above Discord's chat layer.
     *
     * @param content Content of the notice
     * @param options Options for the notice
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
     * @returns The result of the dialog
     */
    async openDialog(options: Partial<DialogOptions>) {
        const data = await ipc.openDialog(options);
        if (data.error) throw new Error(data.error);

        return data;
    },

    /**
     * Creates a single setting wrapped in a setting item that has a name and note.
     * The shape of the object should match the props of the component you want to render, check the
     * `BdApi.Components` section for details.
     * @returns A SettingItem with a an input as the child
     */
    buildSettingItem(setting: Setting | CustomSetting | ButtonSetting) {
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
     * @returns React element usable for a settings panel
     */
    buildSettingsPanel({settings, onChange, onDrawerToggle, getDrawerState}: SettingsPanelProps) {
        if (!settings?.length) throw new Error("No settings provided!");

        return React.createElement(ErrorBoundary, {
            id: "buildSettingsPanel",
            name: "BdApi.UI"
        }, settings.map((setting) => {
            if (!setting.id || !setting.type) throw new Error(`Setting item missing id or type`);

            if (setting.type === "category") {
                const shownByDefault = setting.hasOwnProperty("shown") ? setting.shown : true;

                return React.createElement(Group, {
                    ...setting,
                    onChange: onChange as GroupOnChange,
                    onDrawerToggle: (state: any) => onDrawerToggle?.(setting.id, state),
                    shown: getDrawerState?.(setting.id, shownByDefault) ?? shownByDefault
                });
            }

            return buildSetting({
                ...setting,
                onChange: (value: any) => {
                    setting?.onChange?.(value);
                    onChange?.(null, setting.id, value);
                }
            });
        }));
    }
};

Object.freeze(UI);

export default UI;