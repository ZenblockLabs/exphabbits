import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useExpenses } from '@/contexts/ExpenseContext';
import { CATEGORIES, getCategoryBreakdown } from '@/data/expenseData';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type CategoryKey = keyof typeof CATEGORIES;

export const BudgetProgress: React.FC = () => {
  const { getYearData, selectedYear, budgets, updateBudget } = useExpenses();
  const [editingCategory, setEditingCategory] = useState<CategoryKey | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const yearData = getYearData();
  const breakdown = getCategoryBreakdown(yearData);

  const handleEdit = (category: CategoryKey) => {
    setEditingCategory(category);
    setEditValue(budgets[selectedYear]?.[category]?.toString() || '');
  };

  const handleSave = (category: CategoryKey) => {
    const value = Math.max(0, Math.min(999999999, parseInt(editValue) || 0));
    updateBudget(selectedYear, category, value);
    setEditingCategory(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <Card className="expense-card">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryKeys.map((key, index) => {
          const category = CATEGORIES[key];
          const spent = breakdown[key];
          const budget = budgets[selectedYear]?.[key] || 0;
          const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const isOverBudget = budget > 0 && spent > budget;
          const isEditing = editingCategory === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                </div>
                
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 h-7 text-xs"
                      placeholder="Budget"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleSave(key)}
                    >
                      <Check className="w-3 h-3 text-green-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={handleCancel}
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs",
                      isOverBudget ? "text-destructive font-semibold" : "text-muted-foreground"
                    )}>
                      ₹{spent.toLocaleString('en-IN')} 
                      {budget > 0 && ` / ₹${budget.toLocaleString('en-IN')}`}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleEdit(key)}
                    >
                      <Settings2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Progress 
                  value={budget > 0 ? percentage : 0} 
                  className={cn(
                    "h-2",
                    isOverBudget && "[&>div]:bg-destructive"
                  )}
                />
                {budget === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">Click gear to set budget</span>
                  </div>
                )}
              </div>
              
              {budget > 0 && (
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{percentage.toFixed(0)}% used</span>
                  {isOverBudget ? (
                    <span className="text-destructive font-medium">
                      Over by ₹{(spent - budget).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-green-600">
                      ₹{(budget - spent).toLocaleString('en-IN')} remaining
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};
