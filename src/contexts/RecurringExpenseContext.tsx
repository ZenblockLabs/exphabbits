// RecurringExpenseContext - v2 - with user authentication
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type RecurrenceFrequency = 'monthly' | 'weekly' | 'yearly' | 'quarterly';

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: 'otherExpenses' | 'selfExpense';
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastApplied?: string;
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
  isLoading: boolean;
}

const RecurringExpenseContext = createContext<RecurringExpenseContextType | undefined>(undefined);

export const RecurringExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recurring expenses from database when user changes
  useEffect(() => {
    if (!user) {
      setRecurringExpenses([]);
      setIsLoading(false);
      return;
    }

    const fetchRecurringExpenses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('recurring_expenses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        if (data) {
          const expenses: RecurringExpense[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            amount: Number(row.amount),
            category: row.category as 'otherExpenses' | 'selfExpense',
            frequency: row.frequency as RecurrenceFrequency,
            startDate: row.start_date,
            endDate: row.end_date || undefined,
            isActive: row.is_active,
            lastApplied: row.last_applied || undefined,
            icon: row.icon || undefined,
            notes: row.notes || undefined,
          }));
          setRecurringExpenses(expenses);
        }
      } catch (error) {
        console.error('Error fetching recurring expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecurringExpenses();
  }, [user]);

  const addRecurringExpense = async (expense: Omit<RecurringExpense, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .insert({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          frequency: expense.frequency,
          start_date: expense.startDate,
          end_date: expense.endDate || null,
          is_active: expense.isActive,
          last_applied: expense.lastApplied || null,
          icon: expense.icon || null,
          notes: expense.notes || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newExpense: RecurringExpense = {
          id: data.id,
          name: data.name,
          amount: Number(data.amount),
          category: data.category as 'otherExpenses' | 'selfExpense',
          frequency: data.frequency as RecurrenceFrequency,
          startDate: data.start_date,
          endDate: data.end_date || undefined,
          isActive: data.is_active,
          lastApplied: data.last_applied || undefined,
          icon: data.icon || undefined,
          notes: data.notes || undefined,
        };
        setRecurringExpenses(prev => [newExpense, ...prev]);
      }
    } catch (error) {
      console.error('Error adding recurring expense:', error);
    }
  };

  const updateRecurringExpense = async (id: string, updates: Partial<RecurringExpense>) => {
    if (!user) return;

    setRecurringExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.lastApplied !== undefined) dbUpdates.last_applied = updates.lastApplied;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      await supabase
        .from('recurring_expenses')
        .update(dbUpdates)
        .eq('id', id);
    } catch (error) {
      console.error('Error updating recurring expense:', error);
    }
  };

  const deleteRecurringExpense = async (id: string) => {
    if (!user) return;

    setRecurringExpenses(prev => prev.filter(expense => expense.id !== id));

    try {
      await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
    }
  };

  const toggleRecurringExpense = (id: string) => {
    const expense = recurringExpenses.find(e => e.id === id);
    if (expense) {
      updateRecurringExpense(id, { isActive: !expense.isActive });
    }
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
        isLoading,
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
