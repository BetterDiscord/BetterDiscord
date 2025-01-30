import NotificationUI from "@ui/notifications/notification";

class NotificationAPI {
  static show(notificationObj) {
    const id = notificationObj.id || `notification-${Date.now()}`;

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