import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configura cómo se comportan las notificaciones cuando la app está abierta
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions() {
  if (isExpoGo) {
    console.warn('Notificaciones deshabilitadas en Expo Go para evitar crash. Usa npx expo run:android para probarlas en un Development Build.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleReminderNotification(title: string, description: string, days: number): Promise<string> {
  if (isExpoGo) {
    console.warn('Simulando programación de notificación local debido a que corre en Expo Go.');
    return `simulated-id-${Date.now()}`;
  }

  // const seconds = days; // ¡MODIFICADO TEMPORALMENTE PARA PRUEBAS! (1 = 1 segundo)
  const seconds = days * 24 * 60 * 60; // Versión original para producción

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: description,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: seconds,
      repeats: true,
    },
  });

  return id;
}

export async function cancelNotification(notificationId: string) {
  if (isExpoGo) return;

  try {
    if (notificationId.startsWith('simulated')) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Error cancelling notification:", error);
  }
}
