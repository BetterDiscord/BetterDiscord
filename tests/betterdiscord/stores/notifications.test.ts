import {afterEach, describe, expect, mock, test} from "bun:test";
import Notifications from "@stores/notifications";

const unsubscribeListeners: Array<() => void> = [];

afterEach(() => {
    for (const unsubscribe of unsubscribeListeners.splice(0)) unsubscribe();
    for (const notification of [...Notifications.notifications]) Notifications.hide(notification);
});

describe("Notifications", () => {
    test("updates subscribed views when a notification handle closes", () => {
        let visibleCount = 0;
        unsubscribeListeners.push(Notifications.addChangeListener(() => {
            visibleCount = Notifications.notifications.length;
        }));

        const handle = Notifications.show({id: "close-notification", content: "Hello"});
        expect(visibleCount).toBe(1);
        expect(handle.isVisible()).toBe(true);

        handle.close();

        expect(visibleCount).toBe(0);
        expect(handle.isVisible()).toBe(false);
    });

    test("notifies subscribers when closing a notification without an id", () => {
        const handle = Notifications.show({content: "Hello"});
        const listener = mock(() => {});
        unsubscribeListeners.push(Notifications.addChangeListener(listener));

        handle.close();

        expect(listener).toHaveBeenCalledTimes(1);
        expect(Notifications.notifications).toHaveLength(0);
    });

    test("does not notify again when the same handle is closed twice", () => {
        const handle = Notifications.show({id: "close-twice"});
        const listener = mock(() => {});
        unsubscribeListeners.push(Notifications.addChangeListener(listener));

        handle.close();
        handle.close();

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("an old handle does not close a replacement with the same id", () => {
        const oldHandle = Notifications.show({id: "reused-id"});
        oldHandle.close();
        const replacement = Notifications.show({id: "reused-id"});
        const listener = mock(() => {});
        unsubscribeListeners.push(Notifications.addChangeListener(listener));

        oldHandle.close();

        expect(replacement.isVisible()).toBe(true);
        expect(listener).not.toHaveBeenCalled();
    });
});
