import Store from "@stores/base.ts";
import type {Notification} from "@ui/notifications.tsx";

export default new class Notifications extends Store {
    private notificationsArray = <any>[];

    setNotifications(notifications: Notification[]) {
        this.notificationsArray = notifications;
        this.emit();
    }

    removeNotification(id: string) {
        this.notificationsArray = this.notificationsArray.filter((n: Notification) => n.id !== id);
        this.emit();
    }

    addNotification(notification: Notification) {
        this.notificationsArray.push(notification);
        this.emit();
    }

    get notifications(): Notification[] {
        return this.notificationsArray;
    }
}