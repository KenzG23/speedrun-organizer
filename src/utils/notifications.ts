
import { LocalNotifications } from '@capacitor/local-notifications';

export async function scheduleRunReminder(gameTitle: string, categoryName: string, eligibleDate: string): Promise<void> {
  try {
    const eligibleDateTime = new Date(eligibleDate);
    const reminderDate = new Date(eligibleDateTime.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    
    if (reminderDate > new Date()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Speedrun Reminder",
            body: `You're almost eligible to rerun ${gameTitle} - ${categoryName}`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: reminderDate },
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });
    }
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}
