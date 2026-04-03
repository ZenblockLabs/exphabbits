import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { TopExpenseItem } from '@/data/expenseData';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'primary' | 'accent' | 'default';
  subtitle?: string;
  delay?: number;
  topExpenses?: TopExpenseItem[];
  onIconClick?: () => void;
  iconClickable?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
  subtitle,
  delay = 0,
  topExpenses,
  onIconClick,
  iconClickable = false,
}) => {
  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "stat-card cursor-pointer",
        variant === 'primary' && "stat-card-primary",
        variant === 'accent' && "stat-card-accent"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <AnimatedCurrency value={value} delay={delay} />
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl transition-all",
            variant === 'primary' && "bg-primary/10 text-primary",
            variant === 'accent' && "bg-accent/10 text-accent",
            variant === 'default' && "bg-muted text-muted-foreground",
            iconClickable && "cursor-pointer hover:scale-110 hover:ring-2 hover:ring-primary/50 active:scale-95"
          )}
          onClick={(e) => {
            if (onIconClick) {
              e.stopPropagation();
              onIconClick();
            }
          }}
          title={iconClickable ? "Click to toggle Grand Total" : undefined}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );

  if (!topExpenses || topExpenses.length === 0) {
    return cardContent;
  }

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {cardContent}
      </HoverCardTrigger>
      <HoverCardContent className="w-72" side="bottom" align="start">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Top Expenses</h4>
          <div className="space-y-2">
            {topExpenses.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-4">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-foreground truncate max-w-[120px]">
                    {item.desc}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
