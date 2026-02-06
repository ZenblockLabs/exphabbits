// HabitContext - v2 - with user authentication
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  time: string;
  days: number[];
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
  completedDates: string[];
  bestStreak: number;
  reminder?: HabitReminder;
}

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'bestStreak'>) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  getCompletionRate: (habitId: string, days: number) => number;
  categoryFilter: HabitCategory | 'all';
  setCategoryFilter: (category: HabitCategory | 'all') => void;
  requestNotificationPermission: () => Promise<boolean>;
  notificationPermission: NotificationPermission | null;
  isLoading: boolean;
  weeklyGoals: Record<string, number>;
  updateWeeklyGoal: (category: string, goal: number) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<HabitCategory | 'all'>('all');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyGoals, setWeeklyGoals] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('weeklyGoals');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Fetch habits and completions from database when user changes
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    const fetchHabits = async () => {
      setIsLoading(true);
      try {
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (habitsError) throw habitsError;

        const { data: completionsData, error: completionsError } = await supabase
          .from('habit_completions')
          .select('*');
        
        if (completionsError) throw completionsError;

        const completionsByHabit: Record<string, string[]> = {};
        if (completionsData) {
          completionsData.forEach((completion) => {
            if (!completionsByHabit[completion.habit_id]) {
              completionsByHabit[completion.habit_id] = [];
            }
            completionsByHabit[completion.habit_id].push(completion.completed_date);
          });
        }

        if (habitsData) {
          const habits: Habit[] = habitsData.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description || '',
            frequency: 'daily' as const,
            category: row.category as HabitCategory,
            color: row.color,
            icon: row.icon,
            createdAt: new Date(row.created_at),
            completedDates: completionsByHabit[row.id] || [],
            bestStreak: row.best_streak || 0,
            reminder: row.reminder_enabled ? {
              enabled: row.reminder_enabled,
              time: row.reminder_time || '09:00',
              days: [0, 1, 2, 3, 4, 5, 6],
            } : undefined,
          }));
          setHabits(habits);
        }
      } catch (error) {
        console.error('Error fetching habits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, [user]);

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

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          name: habitData.name,
          description: habitData.description,
          category: habitData.category,
          icon: habitData.icon,
          color: habitData.color,
          reminder_enabled: habitData.reminder?.enabled || false,
          reminder_time: habitData.reminder?.time || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newHabit: Habit = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          frequency: 'daily',
          category: data.category as HabitCategory,
          color: data.color,
          icon: data.icon,
          createdAt: new Date(data.created_at),
          completedDates: [],
          bestStreak: data.best_streak || 0,
          reminder: data.reminder_enabled ? {
            enabled: data.reminder_enabled,
            time: data.reminder_time || '09:00',
            days: [0, 1, 2, 3, 4, 5, 6],
          } : undefined,
        };
        setHabits(prev => [newHabit, ...prev]);
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const updateHabit = async (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    if (!user) return;

    setHabits(prev =>
      prev.map(habit =>
        habit.id === id ? { ...habit, ...updates } : habit
      )
    );

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.reminder !== undefined) {
        dbUpdates.reminder_enabled = updates.reminder.enabled;
        dbUpdates.reminder_time = updates.reminder.time;
      }

      await supabase
        .from('habits')
        .update(dbUpdates)
        .eq('id', id);
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;

    setHabits(prev => prev.filter(h => h.id !== id));

    try {
      await supabase
        .from('habits')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(date);

    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          completedDates: isCompleted
            ? h.completedDates.filter(d => d !== date)
            : [...h.completedDates, date],
        };
      })
    );

    try {
      if (isCompleted) {
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_date', date);
      } else {
        await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            completed_date: date,
          });
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    }
  };

  const getCompletionRate = (habitId: string, days: number): number => {
    const habit = habits.find(h => h.id === habitId);
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

  const updateWeeklyGoal = (category: string, goal: number) => {
    setWeeklyGoals(prev => {
      const updated = { ...prev, [category]: goal };
      localStorage.setItem('weeklyGoals', JSON.stringify(updated));
      return updated;
    });
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
        isLoading,
        weeklyGoals,
        updateWeeklyGoal,
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
