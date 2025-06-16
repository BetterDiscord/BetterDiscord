import React, {ReactDOM} from "@modules/react";
import Button from "@ui/base/button";
import Settings from "@stores/settings";
import Text from "@ui/base/text";
import {CircleAlertIcon, InfoIcon, TriangleAlertIcon, CircleCheckIcon} from "lucide-react";
import DOMManager from "@modules/dommanager";
import DiscordModules from "@modules/discordmodules";
import type {MouseEvent} from "react";
import type {Position} from "./settings/components/position";


// TODO: let arven fix this
export type NotificationType = "warning" | "error" | "info" | "success";
export interface NotificationAction {
    label: string;
    onClick?(): void;
}
export interface Notification {
    id: string;
    title?: string;
    content?: string;
    type?: NotificationType;
    duration?: number;
    actions: NotificationAction[];
    onDurationDone?(): void;
    onClick?(): void;
    exiting?: boolean;
    icon?: React.FC;
}

const Icon = ({type}: {type: NotificationType;}) => {
    switch (type) {
        case "warning":
            return <TriangleAlertIcon color="var(--status-warning)" size="18px" />;

        case "error":
            return <CircleAlertIcon color="var(--status-danger)" size="18px" />;

        case "info":
            return <InfoIcon color="#3B82F6" size="18px" />;
        case "success":
            return <CircleCheckIcon color="var(--status-positive)" size="18px" />;

        default:
            return null;
    }
};

class NotificationUI {
    static notifications = [];
    static setNotifications = null;
    static root: HTMLDivElement | null = null;

    static initialize() {
        const rootId = "bd-notifications-root";
        let root = document.getElementById(rootId) as HTMLDivElement;
        if (!root) {
            root = document.createElement("div");
            root.id = rootId;
            DOMManager.bdBody.appendChild(root);
        }
        this.root = root;

        ReactDOM.createRoot(root).render(<PersistentNotificationContainer />);
    }

    static show(notificationObj) {
        if (!this.root) this.initialize();

        const notification = {
            exiting: false,
            ...notificationObj
        };

        this.notifications.push(notification);
        if (NotificationUI.setNotifications) {
            NotificationUI.setNotifications([...this.notifications]);
        }

        return () => this.hide(notification.id);
    }

    static has(id) {
        return this.notifications.some(n => n.id === id);
    }

    static hide(id) {
        const notificationIndex = this.notifications.findIndex(n => n.id === id);
        if (notificationIndex !== -1) {
            this.notifications[notificationIndex].exiting = true;

            if (NotificationUI.setNotifications) {
                NotificationUI.setNotifications([...this.notifications]);
            }

            setTimeout(() => {
                this.notifications = this.notifications.filter(n => n.id !== id);

                if (NotificationUI.setNotifications) {
                    NotificationUI.setNotifications([...this.notifications]);
                }
            }, 500);
        }
    }
}

const PersistentNotificationContainer = React.memo(() => {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [position, setPosition] = React.useState<Position>("top-right");

    React.useEffect(() => {
        NotificationUI.setNotifications = setNotifications;
        const updatePosition = () => {
            const notificationPosition = Settings.get("settings", "general", "notificationPosition");
            setPosition(notificationPosition);
        };
        updatePosition();
        Settings.on("settings", "general", "notificationPosition", updatePosition);
        return () => {
            NotificationUI.setNotifications = null;
        };
    }, []);

    const getPositionStyles = () => {
        const positions = {
            "top-right": {top: 16, right: 16, flexDirection: "column"},
            "top-left": {top: 16, left: 16, flexDirection: "column"},
            "bottom-right": {bottom: 16, right: 16, flexDirection: "column-reverse"},
            "bottom-left": {bottom: 16, left: 16, flexDirection: "column-reverse"}
        } as const;
        return positions[position];
    };

    return (
        <div
            id="bd-notifications-root"
            style={{
                display: "flex",
                gap: "8px",
                padding: "16px",
                pointerEvents: "none",
                ...getPositionStyles()
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
});

const spring = DiscordModules.ReactSpring;

const NotificationItem = ({notification, position}: {notification: Notification; position: Position;}) => {
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
    const progressProps = spring.useSpring({
        width: "0%",
        from: {width: "100%"},
        config: {duration},
        pause: isPaused,
        onChange: ({width}: {width: string;}) => {
            if (width === "0%") {
                NotificationUI.hide(id);
                notification.onDurationDone?.();
            }
        },
        reset: isPaused
    });

    React.useEffect(() => {
        setExiting(notification.exiting ?? false);
    }, [notification.exiting]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(() => {
            NotificationUI.hide(id);
        }, 500);
    };

    return (
        <spring.animated.div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={(e) => {
                e.stopPropagation();
                notification.onClick?.();
                handleClose();
            }}
            style={{
                ...slideProps,
                pointerEvents: "auto"
            }}
            className={`bd-notification ${exiting ? "bd-notification-exit" : "bd-notification-enter"
                } bd-notification-${type}`}
        >
            <div className="bd-notification-topbar">
                <div className="bd-notification-title">
                    {notification.icon ? <notification.icon /> : <Icon type={type} />}
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

export default NotificationUI;