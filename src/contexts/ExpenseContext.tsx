// ExpenseContext - v7 - with user authentication
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExpenseData, YearData, MonthData, createEmptyYear, CATEGORIES } from '@/data/expenseData';

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
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  getYearData: (year?: number) => YearData;
  getFilteredYearData: (year?: number) => YearData;
  updateMonth: (year: number, month: string, data: MonthData) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  availableYears: number[];
  budgets: BudgetData;
  updateBudget: (year: number, category: CategoryKey, amount: number) => void;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseData>({});
  const [budgets, setBudgets] = useState<BudgetData>({});
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch expenses from database when user changes
  useEffect(() => {
    if (!user) {
      setExpenses({ [currentYear]: createEmptyYear() });
      setIsLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*');
        
        if (error) throw error;

        const expenseData: ExpenseData = {};
        
        if (data && data.length > 0) {
          data.forEach((row) => {
            const year = row.year;
            const month = row.month;
            const category = row.category as keyof MonthData;
            const items = row.items as number[] | { desc: string; amount: number }[];

            if (!expenseData[year]) {
              expenseData[year] = createEmptyYear();
            }

            const monthData = expenseData[year][month];
            if (monthData) {
              (monthData as unknown as Record<string, typeof items>)[category] = items;
            }
          });
        }

        if (!expenseData[currentYear]) {
          expenseData[currentYear] = createEmptyYear();
        }

        setExpenses(expenseData);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setExpenses({ [currentYear]: createEmptyYear() });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  // Fetch budgets from database when user changes
  useEffect(() => {
    if (!user) {
      setBudgets({});
      return;
    }

    const fetchBudgets = async () => {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*');
        
        if (error) throw error;

        const budgetData: BudgetData = {};
        
        if (data) {
          data.forEach((row) => {
            if (!budgetData[row.year]) {
              budgetData[row.year] = {};
            }
            budgetData[row.year][row.category] = Number(row.amount);
          });
        }

        setBudgets(budgetData);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    };

    fetchBudgets();
  }, [user]);

  const getYearData = (year?: number): YearData => {
    const targetYear = year ?? selectedYear;
    return expenses[targetYear] || createEmptyYear();
  };

  const getFilteredYearData = (year?: number): YearData => {
    const targetYear = year ?? selectedYear;
    const yearData = expenses[targetYear] || createEmptyYear();
    
    if (selectedMonth === 'All') {
      return yearData;
    }
    
    const filteredData: YearData = {};
    filteredData[selectedMonth] = yearData[selectedMonth] || createEmptyYear()[selectedMonth];
    return filteredData;
  };

  const updateMonth = async (year: number, month: string, data: MonthData) => {
    if (!user) return;

    // Update local state immediately
    setExpenses((prev) => ({
      ...prev,
      [year]: {
        ...(prev[year] || createEmptyYear()),
        [month]: data,
      },
    }));

    // Sync to database
    try {
      const categories = Object.keys(CATEGORIES) as CategoryKey[];
      
      for (const category of categories) {
        const items = data[category];
        
        const { data: existing } = await supabase
          .from('expenses')
          .select('id')
          .eq('year', year)
          .eq('month', month)
          .eq('category', category)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('expenses')
            .update({ items: items as unknown as null })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('expenses')
            .insert({ 
              year, 
              month, 
              category, 
              items: items as unknown as null,
              user_id: user.id 
            });
        }
      }
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const updateBudget = async (year: number, category: CategoryKey, amount: number) => {
    if (!user) return;

    // Update local state immediately
    setBudgets((prev) => ({
      ...prev,
      [year]: {
        ...(prev[year] || {}),
        [category]: amount,
      },
    }));

    // Sync to database
    try {
      const { data: existing } = await supabase
        .from('budgets')
        .select('id')
        .eq('year', year)
        .eq('category', category)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('budgets')
          .update({ amount })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('budgets')
          .insert({ year, category, amount, user_id: user.id });
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const availableYears = Object.keys(expenses).length > 0 
    ? Object.keys(expenses).map(Number).sort((a, b) => b - a)
    : [currentYear];

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      selectedYear, 
      setSelectedYear,
      selectedMonth,
      setSelectedMonth,
      getYearData,
      getFilteredYearData,
      updateMonth, 
      searchTerm, 
      setSearchTerm,
      availableYears,
      budgets,
      updateBudget,
      isLoading,
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
