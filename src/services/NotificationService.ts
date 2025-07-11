import PushNotification from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
    this.requestPermissions();
  }

  configure() {
    PushNotification.configure({
      onRegister: function (token: any) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification: any) {
        console.log('NOTIFICATION:', notification);
      },

      onAction: function (notification: any) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function (err: any) {
        console.error(err.message, err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create a default channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'timer-channel',
          channelName: 'Timer Notifications',
          channelDescription: 'Notifications for timer completion and alerts',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created: boolean) => console.log(`Channel created: ${created}`),
      );
    }
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Timer App Notification Permission',
            message:
              'Timer App needs access to show notifications when timers complete.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }

  scheduleTimerCompletionNotification(
    timerId: string,
    timerName: string,
    seconds: number,
  ) {
    const notificationId =
      parseInt(timerId.replace(/[^0-9]/g, '').slice(-6)) ||
      Math.floor(Math.random() * 1000000);

    PushNotification.localNotificationSchedule({
      id: notificationId,
      channelId: 'timer-channel',
      title: '🎉 Timer Completed!',
      message: `"${timerName}" has finished!`,
      date: new Date(Date.now() + seconds * 1000),
      soundName: 'default',
      playSound: true,
      vibrate: true,
      vibration: 1000,
      actions: ['View'],
      userInfo: {
        timerId,
        type: 'completion',
      },
    });

    console.log(
      `Scheduled completion notification for "${timerName}" in ${seconds} seconds`,
    );
    return notificationId;
  }

  scheduleHalfwayNotification(
    timerId: string,
    timerName: string,
    seconds: number,
  ) {
    const notificationId =
      parseInt(timerId.replace(/[^0-9]/g, '').slice(-6)) ||
      Math.floor(Math.random() * 1000000);
    const halfwaySeconds = Math.floor(seconds / 2);

    PushNotification.localNotificationSchedule({
      id: notificationId + 1, // Different ID for halfway notification
      channelId: 'timer-channel',
      title: '⏰ Halfway Alert',
      message: `"${timerName}" is 50% complete!`,
      date: new Date(Date.now() + halfwaySeconds * 1000),
      soundName: 'default',
      playSound: true,
      vibrate: true,
      vibration: 500,
      actions: ['View'],
      userInfo: {
        timerId,
        type: 'halfway',
      },
    });

    console.log(
      `Scheduled halfway notification for "${timerName}" in ${halfwaySeconds} seconds`,
    );
    return notificationId + 1;
  }

  cancelNotification(notificationId: number) {
    PushNotification.cancelLocalNotifications({
      id: notificationId.toString(),
    });
    console.log(`Cancelled notification with ID: ${notificationId}`);
  }

  cancelAllNotificationsForTimer(timerId: string) {
    const notificationId =
      parseInt(timerId.replace(/[^0-9]/g, '').slice(-6)) ||
      Math.floor(Math.random() * 1000000);

    // Cancel both completion and halfway notifications
    this.cancelNotification(notificationId);
    this.cancelNotification(notificationId + 1);
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
    console.log('Cancelled all notifications');
  }

  showImmediateNotification(title: string, message: string) {
    PushNotification.localNotification({
      channelId: 'timer-channel',
      title,
      message,
      soundName: 'default',
      playSound: true,
      vibrate: true,
      vibration: 1000,
    });
  }

  checkPermissions(callback: (permissions: any) => void) {
    PushNotification.checkPermissions(callback);
  }

  requestPermissionsIOS() {
    return PushNotification.requestPermissions();
  }
}

const notificationService = new NotificationService();
export default notificationService;
