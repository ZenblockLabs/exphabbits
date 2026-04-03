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

const AnimatedCurrency: React.FC<{ value: number; delay: number }> = ({ value, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), delay * 1000 + 200);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;
    
    const duration = 1200;
    const startValue = prevValue.current !== value ? prevValue.current : 0;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * eased);
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value, hasStarted]);

  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: delay + 0.2 }}
      className="text-2xl lg:text-3xl font-display font-bold tracking-tight"
    >
      {formatCurrency(hasStarted ? displayValue : 0)}
    </motion.p>
  );
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
