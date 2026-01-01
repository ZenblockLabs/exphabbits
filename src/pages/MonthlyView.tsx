import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Edit2, TrendingUp } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { MONTHS, calculateMonthTotal } from '@/data/expenseData';
import { CategoryAccordion } from '@/components/CategoryAccordion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generate years for selection
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

const MonthlyView: React.FC = () => {
  const { getYearData, selectedYear, setSelectedYear, searchTerm, availableYears } = useExpenses();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const yearData = getYearData();

  // Filter months based on search
  const filteredMonths = MONTHS.filter((month) =>
    month.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const monthData = selectedMonth ? yearData[selectedMonth] : null;
  const monthTotal = monthData ? calculateMonthTotal(monthData) : 0;

  // Get all years for dropdown
  const allYears = Array.from(
    new Set([...availableYears, ...YEARS])
  ).sort((a, b) => b - a);

  if (selectedMonth && monthData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMonth(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Back to months</span>
          </button>
          <Button
            onClick={() => navigate(`/edit/${selectedYear}/${selectedMonth}`)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        {/* Month Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card stat-card-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Viewing</p>
              <h2 className="font-display text-2xl font-bold">{selectedMonth} {selectedYear}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="font-display text-2xl font-bold text-primary">
                {formatCurrency(monthTotal)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <CategoryAccordion data={monthData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Select */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Select Period</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(Number(val))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {allYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Choose month..." />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMonths.map((month, index) => {
          const total = yearData[month] ? calculateMonthTotal(yearData[month]) : 0;
          const hasData = total > 0;

          return (
            <motion.button
              key={month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedMonth(month)}
              className={cn(
                "group relative text-left p-5 rounded-xl border transition-all duration-300",
                hasData
                  ? "bg-card border-border hover:border-primary/50 hover:shadow-glow"
                  : "bg-muted/30 border-border/50 hover:bg-muted/50"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{hasData ? '📊' : '📅'}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">{month}</h3>
              {hasData ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}

              {hasData && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.button>
          );
        })}
      </div>

      {filteredMonths.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No months found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyView;
