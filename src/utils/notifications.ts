// Browser Push Notification utility for habit reminders & budget alerts

export const isNotificationSupported = () => 'Notification' in window;

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

interface NotifyOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

export const sendNotification = ({ title, body, icon, tag, onClick }: NotifyOptions) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    body,
    icon: icon || '/habex-icon-512.png',
    badge: '/habex-icon-512.png',
    tag,
    silent: false,
  });

  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }

  // Auto-close after 8 seconds
  setTimeout(() => notification.close(), 8000);
};

// Schedule habit reminders using setInterval (runs while app is open)
const REMINDER_CHECK_KEY = 'habex-last-reminder-check';

interface HabitReminder {
  habitName: string;
  reminderTime: string; // "HH:MM" format
  habitId: string;
}

export const checkAndSendReminders = (habits: HabitReminder[]) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = now.toISOString().split('T')[0];
  const lastCheck = localStorage.getItem(REMINDER_CHECK_KEY);

  // Only check once per minute
  if (lastCheck === `${today}-${currentTime}`) return;
  localStorage.setItem(REMINDER_CHECK_KEY, `${today}-${currentTime}`);

  habits.forEach((habit) => {
    if (habit.reminderTime === currentTime) {
      const sentKey = `habex-reminder-sent-${habit.habitId}-${today}`;
      if (!localStorage.getItem(sentKey)) {
        sendNotification({
          title: '🎯 Habit Reminder',
          body: `Time to work on "${habit.habitName}"! Keep your streak alive 🔥`,
          tag: `habit-${habit.habitId}`,
        });
        localStorage.setItem(sentKey, 'true');
      }
    }
  });
};

export const sendBudgetAlert = (category: string, percentage: number) => {
  const sentKey = `habex-budget-alert-${category}-${new Date().toISOString().split('T')[0]}`;
  if (localStorage.getItem(sentKey)) return;

  if (percentage >= 100) {
    sendNotification({
      title: '⚠️ Budget Exceeded!',
      body: `Your ${category} budget is at ${Math.round(percentage)}%. Time to cut back!`,
      tag: `budget-${category}`,
    });
  } else if (percentage >= 80) {
    sendNotification({
      title: '💰 Budget Warning',
      body: `You've used ${Math.round(percentage)}% of your ${category} budget.`,
      tag: `budget-${category}`,
    });
  }

  localStorage.setItem(sentKey, 'true');
};
