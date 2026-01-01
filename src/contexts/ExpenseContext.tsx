import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExpenseData, MonthData, initialExpenseData } from '@/data/expenseData';

interface ExpenseContextType {
  expenses: ExpenseData;
  updateMonth: (month: string, data: MonthData) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = 'expense-tracker-data';

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<ExpenseData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialExpenseData;
      }
    }
    return initialExpenseData;
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const updateMonth = (month: string, data: MonthData) => {
    setExpenses((prev) => ({
      ...prev,
      [month]: data,
    }));
  };

  return (
    <ExpenseContext.Provider value={{ expenses, updateMonth, searchTerm, setSearchTerm }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
