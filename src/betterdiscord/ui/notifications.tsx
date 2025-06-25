import React, {ReactDOM} from "@modules/react";
import Button from "@ui/base/button";
import Settings from "@stores/settings";
import Notifications from "@stores/notifications";
import Text from "@ui/base/text";
import {CircleAlertIcon, InfoIcon, TriangleAlertIcon, CircleCheckIcon} from "lucide-react";
import DOMManager from "@modules/dommanager";
import DiscordModules from "@modules/discordmodules";
import type {MouseEvent} from "react";
import type {Position} from "./settings/components/position";
import {useInternalStore} from "@ui/hooks.ts";
import {shallowEqual} from "fast-equals";

const spring = DiscordModules.ReactSpring;

// TODO: let arven fix this
export type NotificationType = "warning" | "error" | "info" | "success";

export interface NotificationAction {
    label: string;

    onClick?(): void;
}

export interface Notification {
    id: string;
    title?: string;
    content?: string | React.FC;
    type?: NotificationType;
    duration?: number;
    actions: NotificationAction[];

    onClose?(): void;

    onClick?(): void;

    icon?: React.FC;
}

const positions: {
    [x: string]: { top?: number, right?: number, bottom?: number, left?: number, flexDirection: string }
} = {
    "top-right": {top: 16, right: 16, flexDirection: "column"},
    "top-left": {top: 16, left: 16, flexDirection: "column"},
    "bottom-right": {bottom: 16, right: 16, flexDirection: "column-reverse"},
    "bottom-left": {bottom: 16, left: 16, flexDirection: "column-reverse"}
} as const;

const Icon = ({type}: { type: NotificationType; }) => {
    switch (type) {
        case "warning":
            return <TriangleAlertIcon color="var(--status-warning)" size="18px"/>;
        case "error":
            return <CircleAlertIcon color="var(--status-danger)" size="18px"/>;
        case "info":
            return <InfoIcon color="#3B82F6" size="18px"/>;
        case "success":
            return <CircleCheckIcon color="var(--status-positive)" size="18px"/>;
        default:
            return null;
    }
};

class NotificationUI {
    static root: HTMLDivElement | null = null;

    constructor() {
        const rootId = "bd-notifications-root";
        let root = document.getElementById(rootId) as HTMLDivElement;
        if (!root) {
            root = document.createElement("div");
            root.id = rootId;
            DOMManager.bdBody.appendChild(root);
        }
        NotificationUI.root = root;

        ReactDOM.createRoot(root).render(<PersistentNotificationContainer/>);
    }

    show(notificationData: Notification) {
        this.upsertNotification(notificationData);
        return () => this.hide(notificationData.id);
    }

    upsertNotification(notificationData: Notification) {
        const currentNotifications = Notifications.notifications;
        const filteredNotifications = currentNotifications.filter(
            (notification: Notification) => notification.id !== notificationData.id
        );

        Notifications.setNotifications([...filteredNotifications, notificationData]);
    }

    hide(id: string) {
        const currentNotifications = Notifications.notifications;
        const exists = currentNotifications.some((n: Notification) => n.id === id);

        if (exists) {
            const filtered = currentNotifications.filter((n: Notification) => n.id !== id);
            Notifications.setNotifications(filtered);
        }
    }
}

const PersistentNotificationContainer = () => {
    const notifications = useInternalStore<Notification[]>(Notifications, () => Notifications.notifications.concat(), [], shallowEqual);
    const position: string = useInternalStore(Settings, () => Settings.get("settings", "general", "notificationPosition"));

    return (
        <div
            id="bd-notifications-root"
            style={{
                display: "flex",
                gap: "8px",
                padding: "16px",
                pointerEvents: "none",
                ...positions[position]
            }}
        >
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    position={position}
                />
            ))}
        </div>
    );
};

const NotificationUIInstance = new NotificationUI();

const NotificationItem = ({notification, position}: { notification: Notification; position: Position; }) => {
    const {
        id,
        title = "",
        content = "",
        type = "info",
        duration = 5000,
        actions = [],
    } = notification;

    const [exiting, setExiting] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);

    const getSlideAnimation = () => {
        const baseSlide = {
            opacity: exiting ? 0 : 1,
            config: {tension: 280, friction: 20}
        };

        if (position.includes("right")) {
            return {
                ...baseSlide,
                transform: exiting ? "translateX(100%)" : "translateX(0%)"
            };
        }
        return {
            ...baseSlide,
            transform: exiting ? "translateX(-100%)" : "translateX(0%)"
        };

    };

    const slideProps = spring.useSpring(getSlideAnimation());

    // TODO: arven, fix this
    // fix what? :(.
    const progressProps = spring.useSpring({
        width: "0%",
        from: {width: "100%"},
        config: {duration},
        pause: isPaused,
        onChange: ({width}: { width: string; }) => {
            if (width === "0%") {
                handleClose();
            }
        },
    });

    const handleClose = () => {
        setExiting(true);
        notification.onClose?.();
        setTimeout(() => {
            NotificationUIInstance.hide(id);
        }, 500);
    };

    return (
        <spring.animated.div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
                ...slideProps,
                pointerEvents: "auto"
            }}
            className={`bd-notification ${exiting ? "bd-notification-exit" : "bd-notification-enter"
            } bd-notification-${type}`}
        >
            <div className="bd-notification-topbar">
                <div className="bd-notification-title">
                    {notification.icon ? <notification.icon/> : <Icon type={type}/>}
                    {title}
                </div>
                <Text
                    onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="bd-notification-close"
                >
                    ✕
                </Text>
            </div>
            <span className="bd-notification-body">{content}</span>
            {actions.length > 0 && (
                <div className="bd-notification-footer">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            color={Button.Colors.PRIMARY}
                            size={Button.Sizes.SMALL}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick?.();
                                handleClose();
                            }}
                            className="bd-notification-action"
                        >
                            {action?.label}
                        </Button>
                    ))}
                </div>
            )}
            <spring.animated.div
                className="bd-notification-progress"
                style={{
                    ...progressProps,
                    backgroundColor: {
                        success: "var(--status-positive)",
                        error: "var(--status-danger)",
                        warning: "var(--status-warning)",
                        info: "#3E82E5"
                    }[type]
                }}
            />
        </spring.animated.div>
    );
};

export default NotificationUIInstance;
