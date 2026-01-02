import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type HabitCategory = 'health' | 'productivity' | 'learning' | 'mindfulness' | 'fitness' | 'other';

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; color: string }[] = [
  { value: 'health', label: 'Health', color: 'hsl(142, 76%, 36%)' },
  { value: 'productivity', label: 'Productivity', color: 'hsl(221, 83%, 53%)' },
  { value: 'learning', label: 'Learning', color: 'hsl(270, 76%, 53%)' },
  { value: 'mindfulness', label: 'Mindfulness', color: 'hsl(173, 80%, 40%)' },
  { value: 'fitness', label: 'Fitness', color: 'hsl(25, 95%, 53%)' },
  { value: 'other', label: 'Other', color: 'hsl(0, 0%, 50%)' },
];

export interface HabitReminder {
  enabled: boolean;
  time: string; // HH:mm format
  days: number[]; // 0-6, Sunday-Saturday
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: HabitCategory;
  color: string;
  icon: string;
  createdAt: Date;
  completedDates: string[]; // ISO date strings
  reminder?: HabitReminder;
}

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  getCompletionRate: (habitId: string, days: number) => number;
  categoryFilter: HabitCategory | 'all';
  setCategoryFilter: (category: HabitCategory | 'all') => void;
  requestNotificationPermission: () => Promise<boolean>;
  notificationPermission: NotificationPermission | null;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const sampleHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    description: '30 minutes of workout',
    frequency: 'daily',
    category: 'fitness',
    color: 'hsl(142, 76%, 36%)',
    icon: 'Dumbbell',
    createdAt: new Date('2024-01-01'),
    completedDates: [
      '2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31',
      '2025-01-01', '2025-01-02'
    ],
    reminder: { enabled: true, time: '07:00', days: [1, 2, 3, 4, 5] },
  },
  {
    id: '2',
    name: 'Read 20 Pages',
    description: 'Read at least 20 pages of a book',
    frequency: 'daily',
    category: 'learning',
    color: 'hsl(221, 83%, 53%)',
    icon: 'BookOpen',
    createdAt: new Date('2024-01-15'),
    completedDates: [
      '2024-12-27', '2024-12-29', '2024-12-31', '2025-01-01'
    ],
    reminder: { enabled: true, time: '21:00', days: [0, 1, 2, 3, 4, 5, 6] },
  },
  {
    id: '3',
    name: 'Meditation',
    description: '10 minutes of mindfulness',
    frequency: 'daily',
    category: 'mindfulness',
    color: 'hsl(270, 76%, 53%)',
    icon: 'Brain',
    createdAt: new Date('2024-02-01'),
    completedDates: [
      '2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31',
      '2025-01-01', '2025-01-02'
    ],
    reminder: { enabled: true, time: '06:30', days: [0, 1, 2, 3, 4, 5, 6] },
  },
  {
    id: '4',
    name: 'Weekly Review',
    description: 'Plan and review the week',
    frequency: 'weekly',
    category: 'productivity',
    color: 'hsl(25, 95%, 53%)',
    icon: 'Calendar',
    createdAt: new Date('2024-01-01'),
    completedDates: ['2024-12-29', '2025-01-05'],
  },
];

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);
  const [categoryFilter, setCategoryFilter] = useState<HabitCategory | 'all'>('all');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Check and send notifications
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();
      const today = now.toISOString().split('T')[0];

      habits.forEach((habit) => {
        if (
          habit.reminder?.enabled &&
          habit.reminder.time === currentTime &&
          habit.reminder.days.includes(currentDay) &&
          !habit.completedDates.includes(today)
        ) {
          new Notification(`⏰ Habit Reminder: ${habit.name}`, {
            body: habit.description || 'Time to work on your habit!',
            icon: '/favicon.ico',
            tag: habit.id,
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [habits, notificationPermission]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission === 'granted';
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date(),
      completedDates: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      )
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const isCompleted = habit.completedDates.includes(date);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter((d) => d !== date)
            : [...habit.completedDates, date],
        };
      })
    );
  };

  const getCompletionRate = (habitId: string, days: number): number => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return 0;
    
    const today = new Date();
    let completedCount = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (habit.completedDates.includes(dateStr)) {
        completedCount++;
      }
    }
    
    return Math.round((completedCount / days) * 100);
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        getCompletionRate,
        categoryFilter,
        setCategoryFilter,
        requestNotificationPermission,
        notificationPermission,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
