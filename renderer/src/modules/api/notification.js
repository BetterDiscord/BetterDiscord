import NotificationUI from "@modules/notification";
import Settings from "@modules/settingsmanager";

let cntr = 0;

class NotificationAPI {
  static show(notificationObj) {
    if (!Settings.get("settings", "general", "notificationEnabled")) return;
    cntr++;
    const id = notificationObj.id || `notification-${cntr}`;

    const defaultObj = {
      id,
      title: "",
      content: "",
      type: "info",
      duration: 5000,
      icon: null
    };

    const finalNotification = {...defaultObj, ...notificationObj, id};

    NotificationUI.show(finalNotification);
    return () => NotificationUI.hide(id);
  }
}

export default NotificationAPI;