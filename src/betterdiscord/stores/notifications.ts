import Store from "@stores/base.ts";
import type {Notification} from "@ui/notifications.tsx";

export default new class Notifications extends Store {
    static stores = new Set<Store>();

    static getStore<T extends Store = Store>(name: string) {
        for (const store of Store.stores) {
            if (Store.prototype.getName.call(store) === name) return store as T;
        }
    }

    constructor() {
        super();
        Store.stores.add(this);
    }

    private notificationsArray = <any>[];

    setNotifications(notifications: Notification[]) {
        this.notificationsArray = notifications;
        this.emit();
    }

    get notifications(): Notification[] {
        return this.notificationsArray;
    }

    initialize(): void {
    }

    displayName?: string;

    getName() {
        if (this.displayName) return this.displayName;
        return this.constructor.name;
    }

    #listeners = new Set<() => void>();

    addChangeListener(callback: () => void) {
        this.#listeners.add(callback);
        return () => this.removeChangeListener(callback);
    }

    removeChangeListener(callback: () => void) {
        this.#listeners.delete(callback);
    }

    emit() {
        for (const listener of this.#listeners) {
            listener();
        }
    }
}