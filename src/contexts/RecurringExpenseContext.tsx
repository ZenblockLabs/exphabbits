// RecurringExpenseContext - manages recurring/subscription expenses
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type RecurrenceFrequency = 'monthly' | 'weekly' | 'yearly' | 'quarterly';

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: 'otherExpenses' | 'selfExpense';
  frequency: RecurrenceFrequency;
  startDate: string; // ISO date string
  endDate?: string; // Optional end date
  isActive: boolean;
  lastApplied?: string; // Last month/year applied (e.g., "January-2025")
  icon?: string;
  notes?: string;
}

interface RecurringExpenseContextType {
  recurringExpenses: RecurringExpense[];
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
  updateRecurringExpense: (id: string, expense: Partial<RecurringExpense>) => void;
  deleteRecurringExpense: (id: string) => void;
  toggleRecurringExpense: (id: string) => void;
  getActiveRecurringExpenses: () => RecurringExpense[];
  getMonthlyTotal: () => number;
}

const RecurringExpenseContext = createContext<RecurringExpenseContextType | undefined>(undefined);

const STORAGE_KEY = 'recurring-expenses-data';

// Default recurring expenses as examples
const DEFAULT_RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: '1',
    name: 'PG Rent',
    amount: 6000,
    category: 'selfExpense',
    frequency: 'monthly',
    startDate: '2024-01-01',
    isActive: true,
    icon: '🏠',
  },
  {
    id: '2',
    name: 'Spotify Premium',
    amount: 119,
    category: 'selfExpense',
    frequency: 'monthly',
    startDate: '2024-01-01',
    isActive: true,
    icon: '🎵',
  },
  {
    id: '3',
    name: 'Jio Hotstar',
    amount: 299,
    category: 'otherExpenses',
    frequency: 'monthly',
    startDate: '2024-01-01',
    isActive: true,
    icon: '📺',
  },
];

export const RecurringExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_RECURRING_EXPENSES;
      }
    }
    return DEFAULT_RECURRING_EXPENSES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  const addRecurringExpense = (expense: Omit<RecurringExpense, 'id'>) => {
    const newExpense: RecurringExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    setRecurringExpenses(prev => [...prev, newExpense]);
  };

  const updateRecurringExpense = (id: string, updates: Partial<RecurringExpense>) => {
    setRecurringExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );
  };

  const deleteRecurringExpense = (id: string) => {
    setRecurringExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const toggleRecurringExpense = (id: string) => {
    setRecurringExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, isActive: !expense.isActive } : expense
      )
    );
  };

  const getActiveRecurringExpenses = () => {
    return recurringExpenses.filter(expense => expense.isActive);
  };

  const getMonthlyTotal = () => {
    return recurringExpenses
      .filter(e => e.isActive)
      .reduce((total, expense) => {
        switch (expense.frequency) {
          case 'monthly':
            return total + expense.amount;
          case 'weekly':
            return total + expense.amount * 4;
          case 'yearly':
            return total + expense.amount / 12;
          case 'quarterly':
            return total + expense.amount / 3;
          default:
            return total;
        }
      }, 0);
  };

  return (
    <RecurringExpenseContext.Provider
      value={{
        recurringExpenses,
        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        toggleRecurringExpense,
        getActiveRecurringExpenses,
        getMonthlyTotal,
      }}
    >
      {children}
    </RecurringExpenseContext.Provider>
  );
};

export const useRecurringExpenses = () => {
  const context = useContext(RecurringExpenseContext);
  if (!context) {
    throw new Error('useRecurringExpenses must be used within a RecurringExpenseProvider');
  }
  return context;
};
