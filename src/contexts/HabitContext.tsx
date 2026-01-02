import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  color: string;
  icon: string;
  createdAt: Date;
  completedDates: string[]; // ISO date strings
}

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  getCompletionRate: (habitId: string, days: number) => number;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const sampleHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    description: '30 minutes of workout',
    frequency: 'daily',
    color: 'hsl(142, 76%, 36%)',
    icon: 'Dumbbell',
    createdAt: new Date('2024-01-01'),
    completedDates: [
      '2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31',
      '2025-01-01', '2025-01-02'
    ],
  },
  {
    id: '2',
    name: 'Read 20 Pages',
    description: 'Read at least 20 pages of a book',
    frequency: 'daily',
    color: 'hsl(221, 83%, 53%)',
    icon: 'BookOpen',
    createdAt: new Date('2024-01-15'),
    completedDates: [
      '2024-12-27', '2024-12-29', '2024-12-31', '2025-01-01'
    ],
  },
  {
    id: '3',
    name: 'Meditation',
    description: '10 minutes of mindfulness',
    frequency: 'daily',
    color: 'hsl(270, 76%, 53%)',
    icon: 'Brain',
    createdAt: new Date('2024-02-01'),
    completedDates: [
      '2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31',
      '2025-01-01', '2025-01-02'
    ],
  },
  {
    id: '4',
    name: 'Weekly Review',
    description: 'Plan and review the week',
    frequency: 'weekly',
    color: 'hsl(25, 95%, 53%)',
    icon: 'Calendar',
    createdAt: new Date('2024-01-01'),
    completedDates: ['2024-12-29', '2025-01-05'],
  },
];

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date(),
      completedDates: [],
    };
    setHabits((prev) => [...prev, newHabit]);
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
      value={{ habits, addHabit, deleteHabit, toggleHabitCompletion, getCompletionRate }}
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
