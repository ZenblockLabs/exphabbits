import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MonthData, ExpenseItem, CATEGORIES, calculateCategoryTotal } from '@/data/expenseData';
import { cn } from '@/lib/utils';

interface CategoryAccordionProps {
  data: MonthData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const CategoryBadge: React.FC<{ category: string; total: number }> = ({ category, total }) => {
  const config = CATEGORIES[category as keyof typeof CATEGORIES];
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <span className="text-xl">{config.icon}</span>
        <span className="font-medium">{config.label}</span>
      </div>
      <span className={cn(
        "expense-badge",
        `category-${config.color}`
      )}>
        {formatCurrency(total)}
      </span>
    </div>
  );
};

const ExpenseList: React.FC<{ items: number[] | ExpenseItem[]; isDetailed?: boolean }> = ({
  items,
  isDetailed = false,
}) => {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">No expenses recorded</p>
    );
  }

  if (isDetailed) {
    return (
      <div className="space-y-2">
        {(items as ExpenseItem[]).map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="text-sm text-foreground/80 capitalize">{item.desc}</span>
            <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(items as number[]).map((amount, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground"
        >
          {formatCurrency(amount)}
        </motion.span>
      ))}
    </div>
  );
};

export const CategoryAccordion: React.FC<CategoryAccordionProps> = ({ data }) => {
  const categories = [
    { key: 'snacks', items: data.snacks, isDetailed: false },
    { key: 'food', items: data.food, isDetailed: false },
    { key: 'travellingCharge', items: data.travellingCharge, isDetailed: false },
    { key: 'otherExpenses', items: data.otherExpenses, isDetailed: true },
    { key: 'selfExpense', items: data.selfExpense, isDetailed: true },
    { key: 'petrol', items: data.petrol, isDetailed: false },
  ];

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {categories.map(({ key, items, isDetailed }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AccordionItem
            value={key}
            className="border border-border rounded-xl overflow-hidden bg-card"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
              <CategoryBadge
                category={key}
                total={calculateCategoryTotal(items as number[] | ExpenseItem[])}
              />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ExpenseList items={items} isDetailed={isDetailed} />
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  );
};
