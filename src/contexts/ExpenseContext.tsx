// ExpenseContext - provides expense data and budget management
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExpenseData, YearData, MonthData, initialExpenseData, createEmptyYear, CATEGORIES } from '@/data/expenseData';

const currentYear = new Date().getFullYear();

type CategoryKey = keyof typeof CATEGORIES;

export interface YearBudgets {
  [category: string]: number;
}

export interface BudgetData {
  [year: number]: YearBudgets;
}

interface ExpenseContextType {
  expenses: ExpenseData;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  getYearData: (year?: number) => YearData;
  updateMonth: (year: number, month: string, data: MonthData) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  availableYears: number[];
  budgets: BudgetData;
  updateBudget: (year: number, category: CategoryKey, amount: number) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = 'expense-tracker-data';
const BUDGET_STORAGE_KEY = 'expense-tracker-budgets';

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<ExpenseData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          // Merge with initial data to ensure all years are present
          const merged = { ...initialExpenseData, ...parsed };
          // Also ensure 2025 and 2026 have their sample data if empty
          if (!parsed[2025] || Object.values(parsed[2025]).every((m: any) => 
            m.snacks?.length === 0 && m.food?.length === 0 && m.petrol?.length === 0
          )) {
            merged[2025] = initialExpenseData[2025];
          }
          if (!parsed[2026]) {
            merged[2026] = initialExpenseData[2026];
          }
          return merged;
        }
        return initialExpenseData;
      } catch {
        return initialExpenseData;
      }
    }
    return initialExpenseData;
  });

  const [budgets, setBudgets] = useState<BudgetData>(() => {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  });
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

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

  const updateBudget = (year: number, category: CategoryKey, amount: number) => {
    setBudgets((prev) => ({
      ...prev,
      [year]: {
        ...(prev[year] || {}),
        [category]: amount,
      },
    }));
  };

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
      budgets,
      updateBudget,
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
