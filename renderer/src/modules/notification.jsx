import Webpack from "@modules/api/webpack";
import Patcher from "@modules/patcher";
import React, {ReactDOM} from "@modules/react";
import Button from "@ui/base/button";
import Settings from "@modules/settingsmanager";
import Text from "@ui/base/text";

const Icon = ({type}) => {
    switch (type) {
        case "warning":
            return (
                <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" role="img">
                    <path
                        d="M11 13C11 13.5523 11.4477 14 12 14C12.5523 14 13 13.5523 13 13V10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10V13ZM13 15.9888C13 15.4365 12.5523 14.9888 12 14.9888C11.4477 14.9888 11 15.4365 11 15.9888V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V15.9888ZM9.37735 4.66136C10.5204 2.60393 13.4793 2.60393 14.6223 4.66136L21.2233 16.5431C22.3341 18.5427 20.8882 21 18.6008 21H5.39885C3.11139 21 1.66549 18.5427 2.77637 16.5431L9.37735 4.66136Z"
                        fill="var(--status-warning)"
                    />
                    <circle cx="12" cy="17" r="18px" />
                </svg>
            );

        case "error":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 1200 1200" fill="none">
                    <path fill="var(--status-danger)" d="M600,0C268.629,0,0,268.629,0,600s268.629,600,600,600s600-268.629,600-600  S931.371,0,600,0z M197.314,439.453h805.371v321.094H197.314V439.453z"/>
                </svg>
            );

        case "info":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 18.5C12.5523 18.5 13 18.0523 13 17.5L13 10.5C13 9.94772 12.5523 9.5 12 9.5C11.4477 9.5 11 9.94772 11 10.5L11 17.5C11 18.0523 11.4477 18.5 12 18.5Z"
                        fill="#3B82F6"/>
                    <path
                        d="M12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z"
                        fill="#3B82F6"/>
                    <path
                        d="M1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12ZM12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z"
                        fill="#3B82F6"/>
                </svg>
            );
        case "success":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="none"
                     stroke="var(--status-positive)" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            );

        default:
            return null;
    }
};

class NotificationUI {
    static notifications = [];
    static setNotifications = null;
    static root = null;

    static initialize() {
        const rootId = "bd-notifications-root";
        let root = document.getElementById(rootId);
        if (!root) {
            root = document.createElement("div");
            root.id = rootId;
            document.body.appendChild(root);
        }
        this.root = root;

        ReactDOM.createRoot(root).render(<PersistentNotificationContainer />);
    }

    static show(notificationObj) {
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
    const [notifications, setNotifications] = React.useState([]);
    const [position, setPosition] = React.useState("top-right");

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
        };
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

const spring = Webpack.getModule(x => x?.animated?.div);

const NotificationItem = ({notification, position}) => {
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

    const progressProps = spring.useSpring({
        width: "0%",
        from: {width: "100%"},
        config: {duration},
        pause: isPaused,
        onChange: ({width}) => {
            if (width === "0%") {
                NotificationUI.hide(id);
            }
        },
        reset: isPaused
    });

    React.useEffect(() => {
        setExiting(notification.exiting);
    }, [notification.exiting]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(() => NotificationUI.hide(id), 500);
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
            className={`bd-notification ${
                exiting ? "bd-notification-exit" : "bd-notification-enter"
            } bd-notification-${type}`}
        >
            <div className="bd-notification-topbar">
                <div className="bd-notification-title">
                    {notification.icon ? <notification.icon /> : <Icon type={type} />}
                    {title}
                </div>
                <Text
                    onClick={(e) => {
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