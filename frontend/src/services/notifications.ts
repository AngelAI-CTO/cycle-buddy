import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("cycle-alerts", {
      name: "Cycle Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleDailyReminder(
  hour: number = 9,
  minute: number = 0
) {
  // Cancel existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Cycle Buddy",
      body: "Проверь, как дела у твоей девушки сегодня",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function sendPhaseChangeNotification(
  partnerName: string,
  phaseName: string,
  tips: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${partnerName}: ${phaseName}`,
      body: tips,
    },
    trigger: null, // Send immediately
  });
}
