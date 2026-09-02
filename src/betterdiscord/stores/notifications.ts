import Store from "@stores/base";
import type {Notification} from "@ui/notifications";

const notificationMetaData = new WeakMap<Notification, symbol>();

class Notifications extends Store {
    private notificationsArray: Notification[] = [];

    show(notification: Notification) {
        let notificationData = typeof notification.id === "string" ? this.notificationsArray.find(notif => notif.id === notification.id) : undefined;

        if (!notificationData) {
            notificationData = notification;

            this.notificationsArray = [
                ...this.notificationsArray,
                notification
            ];

            this.emitChange();
        }

        const unique = notificationMetaData.getOrInsertComputed(notificationData!, () => Symbol());

        return {
            id: notificationData!.id,
            isVisible: () => {
                return this.notifications.findIndex(notif => notificationMetaData.get(notif!)! === unique) !== -1;
            },
            close: () => {
                const index = this.notifications.findIndex(notif => notificationMetaData.get(notif!)! === unique);

                if (index !== -1) {
                    this.notificationsArray = this.notificationsArray.toSpliced(index, 1);
                }
            }
        };
    }

    hide(notification: Notification | string) {
        let notificationData: Notification | undefined;
        if (typeof notification === "string") {
            notificationData = this.notificationsArray.find(notif => notif.id === notification);
        }
        else {
            notificationData = notification;
        }

        if (!notificationData) return;

        const unique = notificationMetaData.get(notificationData);

        const index = this.notifications.findIndex(notif => notificationMetaData.get(notif!)! === unique);

        if (index !== -1) {
            this.notificationsArray = this.notificationsArray.toSpliced(index, 1);
            this.emitChange();

        }
    }

    get notifications(): Notification[] {
        return this.notificationsArray;
    }
};

export default new Notifications();