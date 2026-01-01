import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExpenseData, YearData, MonthData, initialExpenseData, createEmptyYear } from '@/data/expenseData';

const currentYear = new Date().getFullYear();

interface ExpenseContextType {
  expenses: ExpenseData;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  getYearData: (year?: number) => YearData;
  updateMonth: (year: number, month: string, data: MonthData) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  availableYears: number[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = 'expense-tracker-data';

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<ExpenseData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migration: Check if old format (month-based) and convert to year-based
        if (parsed && typeof parsed === 'object' && !parsed[currentYear] && parsed['January']) {
          return { [currentYear]: parsed };
        }
        return parsed;
      } catch {
        return initialExpenseData;
      }
    }
    return initialExpenseData;
  });
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const getYearData = (year?: number): YearData => {
    const targetYear = year ?? selectedYear;
    return expenses[targetYear] || createEmptyYear();
  };

  const updateMonth = (year: number, month: string, data: MonthData) => {
    setExpenses((prev) => ({
      ...prev,
      [year]: {
        ...(prev[year] || createEmptyYear()),
        [month]: data,
      },
    }));
  };

  // Get all years that have data
  const availableYears = Object.keys(expenses).map(Number).sort((a, b) => b - a);

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      selectedYear, 
      setSelectedYear,
      getYearData,
      updateMonth, 
      searchTerm, 
      setSearchTerm,
      availableYears,
    }}>
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
