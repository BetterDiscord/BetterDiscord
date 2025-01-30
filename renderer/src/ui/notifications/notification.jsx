import Webpack from "@modules/api/webpack";
import Patcher from "@modules/patcher";
import React from "@modules/react";
import Button from "@ui/base/button";

const Icon = ({type}) => {
    switch (type) {
        case "warning":
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-labelledby="icon-title">
                    <title id="icon-title">Warning</title>
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                        fill="#FBBF24"
                    />
                    <circle cx="12" cy="17" r="1" fill="#FBBF24" />
                </svg>
            );

        case "error":
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-labelledby="icon-title">
                    <title id="icon-title">Error</title>
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                        fill="#EF4444"
                    />
                    <path
                        d="M12 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                        fill="#EF4444"
                    />
                </svg>
            );

        case "info":
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-labelledby="icon-title">
                    <title id="icon-title">Information</title>
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        fill="#3B82F6"
                    />
                    <circle cx="12" cy="17" r="1" fill="#3B82F6" />
                </svg>
            );
        case "success":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="green" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            );

        default:
            return null;
    }
};

class NotificationUI {
    static notifications = [];
    static setNotifications = null;

    static initialize() {
        Patcher.after("NotificationPatch", Webpack.getBySource("\"Shakeable is shaken when not mounted\"").Z, "type", (_, __, res) => {
            if (!res.props.children) res.props.children = [];
            res.props.children.push(
                <PersistentNotificationContainer />
            );
        });
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

const PersistentNotificationContainer = () => {
    const [notifications, setNotifications] = React.useState([]);

    React.useEffect(() => {
        NotificationUI.setNotifications = setNotifications;
        return () => {NotificationUI.setNotifications = null;};
    }, []);

    return (
        <div className="discord-notification-container">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                />
            ))}
        </div>
    );
};
const spring = Webpack.getModule(x => x?.animated?.div);

const NotificationItem = ({notification}) => {
    const {
        id,
        title = "",
        content = "",
        type = "info",
        duration = 5000,
        actions = [],
        onClick = () => null,
    } = notification;

    const [progress, setProgress] = React.useState(100);
    const [exiting, setExiting] = React.useState(false);
    const [continueProgress, setContinueProgress] = React.useState(true);

    const props = spring.useSpring({
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateX(100%)" : "translateX(0%)",
        config: {tension: 280, friction: 20}
    });

    React.useEffect(() => {
        if (!continueProgress) return;
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remainingPercentage = Math.max(0, 100 - (elapsed / duration) * 100);

            setProgress(remainingPercentage);

            if (remainingPercentage <= 0) {
                clearInterval(timer);
                NotificationUI.hide(id);
            }
        }, 10);

        return () => clearInterval(timer);
    }, [duration, id, continueProgress]);

    React.useEffect(() => {
        setExiting(notification.exiting);
    }, [notification.exiting]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(() => NotificationUI.hide(id), 500);
    };

    return (
        <spring.animated.div
            onMouseOver={() => {setContinueProgress(false);}}
            onMouseLeave={() => {setProgress(100); setContinueProgress(true);}}
            onClick
            style={props}
            className={`discord-notification ${exiting ? "discord-notification-exit" : "discord-notification-enter"
                } discord-notification-${type}`}
        >
            <div className="discord-notification-topbar">
                <div className="discord-notification-title">
                    {notification.icon ? <notification.icon /> : <Icon type={type} />}
                    {title}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="discord-notification-close"
                >
                    ✕
                </button>
            </div>
            <span className="discord-notification-body">{content}</span>
            {actions.length > 0 && (
                <div className="discord-notification-footer">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            color={Button.Colors.PRIMARY}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                                handleClose();
                            }}
                            className="discord-notification-action"
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
            <div
                className="discord-notification-progress"
                style={{
                    width: `${progress}%`,
                    backgroundColor: {
                        success: "green",
                        error: "red",
                        warning: "orange",
                        info: "#3E82E5"
                    }[type]
                }}
            />
        </spring.animated.div>
    );
};

export default NotificationUI;
