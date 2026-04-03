import React, { useEffect, useCallback, useState, useMemo } from 'react'; // v2
import { motion } from 'framer-motion';
import dashboardHeroVideo from '@/assets/dashboard-hero-video.mp4.asset.json';
import MotivationalQuote from '@/components/MotivationalQuote';
import { Wallet, TrendingUp, Fuel, DollarSign, ChevronLeft, ChevronRight, Keyboard } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { calculateYearTotals, MONTHS, getTopExpenses } from '@/data/expenseData';
import { StatCard } from '@/components/StatCard';
import { CategoryPieChart, MonthlyBarChart } from '@/components/ExpenseCharts';
import { BudgetProgress } from '@/components/BudgetProgress';
import { Button } from '@/components/ui/button';
import { useSwipe } from '@/hooks/useSwipe';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Dashboard: React.FC = () => {
  const { getFilteredYearData, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, availableYears, expenses } = useExpenses();
  const yearData = getFilteredYearData();
  const totals = calculateYearTotals(yearData);
  
  // State for showing grand totals (all years) vs year totals
  const [showGrandTotal, setShowGrandTotal] = useState(false);
  
  // Calculate grand totals across all years
  const grandTotals = useMemo(() => {
    let totalSelf = 0;
    let totalOther = 0;
    let totalPetrol = 0;
    
    Object.keys(expenses).forEach((year) => {
      const yearTotals = calculateYearTotals(expenses[Number(year)]);
      totalSelf += yearTotals.totalSelf;
      totalOther += yearTotals.totalOther;
      totalPetrol += yearTotals.totalPetrol;
    });
    
    return {
      totalSelf,
      totalOther,
      totalPetrol,
      yearTotal: totalSelf + totalOther + totalPetrol,
    };
  }, [expenses]);
  
  // Get top expenses for each stat card
  const topExpensesAll = getTopExpenses(yearData, 'all', 5);
  const topExpensesSelf = getTopExpenses(yearData, 'self', 5);
  const topExpensesOther = getTopExpenses(yearData, 'other', 5);
  const topExpensesPetrol = getTopExpenses(yearData, 'petrol', 5);

  // Generate years for dropdown (5 years back and forward from current)
  const currentYear = new Date().getFullYear();
  const allYears = Array.from(
    new Set([...availableYears, ...Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)])
  ).sort((a, b) => b - a);

  // Month navigation options: "All" + 12 months
  const monthOptions = ['All', ...MONTHS];
  const currentMonthIndex = monthOptions.indexOf(selectedMonth);

  const handlePrevMonth = useCallback(() => {
    const newIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : monthOptions.length - 1;
    setSelectedMonth(monthOptions[newIndex]);
  }, [currentMonthIndex, monthOptions, setSelectedMonth]);

  const handleNextMonth = useCallback(() => {
    const newIndex = currentMonthIndex < monthOptions.length - 1 ? currentMonthIndex + 1 : 0;
    setSelectedMonth(monthOptions[newIndex]);
  }, [currentMonthIndex, monthOptions, setSelectedMonth]);

  const handlePrevYear = useCallback(() => {
    const currentIndex = allYears.indexOf(selectedYear);
    const newIndex = currentIndex < allYears.length - 1 ? currentIndex + 1 : 0;
    setSelectedYear(allYears[newIndex]);
  }, [allYears, selectedYear, setSelectedYear]);

  const handleNextYear = useCallback(() => {
    const currentIndex = allYears.indexOf(selectedYear);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : allYears.length - 1;
    setSelectedYear(allYears[newIndex]);
  }, [allYears, selectedYear, setSelectedYear]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        handlePrevMonth();
      } else if (e.key === 'ArrowRight') {
        handleNextMonth();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNextYear();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handlePrevYear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevMonth, handleNextMonth, handlePrevYear, handleNextYear]);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNextMonth,
    onSwipeRight: handlePrevMonth,
  });

  return (
    <div className="space-y-8 touch-pan-y" {...swipeHandlers}>
      {/* Hero Section */}
      {/* Hero Section with Video Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 shadow-lg"
      >
        {/* Full video background */}
        <div className="absolute inset-0 pointer-events-none">
          <video
            src={dashboardHeroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/75 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />
        </div>

        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-display text-2xl lg:text-3xl font-bold mb-2"
              >
                Welcome back! 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-muted-foreground max-w-lg"
              >
                Here's an overview of your expenses. Track, analyze, and manage your spending habits effectively.
              </motion.p>
              <MotivationalQuote />
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Month:</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 backdrop-blur-sm bg-background/50"
                          onClick={handlePrevMonth}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="w-16 text-center text-sm font-medium">
                          {selectedMonth === 'All' ? 'All' : selectedMonth.slice(0, 3)}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 backdrop-blur-sm bg-background/50"
                          onClick={handleNextMonth}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <Keyboard className="h-3.5 w-3.5 text-muted-foreground/50 hidden sm:block" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border">←</kbd>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border">→</kbd>
                      <span>Month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border">↓</kbd>
                      <span>Year</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Year:</span>
                <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(Number(val))}>
                  <SelectTrigger className="w-[120px] backdrop-blur-sm bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title={selectedMonth === 'All' ? (showGrandTotal ? 'Grand Total' : 'Year Total') : `${selectedMonth} Total`}
          value={selectedMonth === 'All' && showGrandTotal ? grandTotals.yearTotal : totals.yearTotal}
          icon={DollarSign}
          variant="primary"
          subtitle={selectedMonth === 'All' ? (showGrandTotal ? 'All expenses across all years' : `All expenses in ${selectedYear}`) : `Expenses in ${selectedMonth} ${selectedYear}`}
          delay={0}
          topExpenses={topExpensesAll}
          onIconClick={() => setShowGrandTotal(!showGrandTotal)}
          iconClickable={selectedMonth === 'All'}
        />
        <StatCard
          title={showGrandTotal && selectedMonth === 'All' ? "Self Expenses (All)" : "Self Expenses"}
          value={selectedMonth === 'All' && showGrandTotal ? grandTotals.totalSelf : totals.totalSelf}
          icon={Wallet}
          variant="default"
          subtitle={showGrandTotal && selectedMonth === 'All' ? "All years combined" : "Rent, subscriptions, etc."}
          delay={0.1}
          topExpenses={topExpensesSelf}
          onIconClick={() => setShowGrandTotal(!showGrandTotal)}
          iconClickable={selectedMonth === 'All'}
        />
        <StatCard
          title={showGrandTotal && selectedMonth === 'All' ? "Other Expenses (All)" : "Other Expenses"}
          value={selectedMonth === 'All' && showGrandTotal ? grandTotals.totalOther : totals.totalOther}
          icon={TrendingUp}
          variant="accent"
          subtitle={showGrandTotal && selectedMonth === 'All' ? "All years combined" : "Daily spending"}
          delay={0.2}
          topExpenses={topExpensesOther}
          onIconClick={() => setShowGrandTotal(!showGrandTotal)}
          iconClickable={selectedMonth === 'All'}
        />
        <StatCard
          title={showGrandTotal && selectedMonth === 'All' ? "Petrol (All)" : "Petrol"}
          value={selectedMonth === 'All' && showGrandTotal ? grandTotals.totalPetrol : totals.totalPetrol}
          icon={Fuel}
          variant="default"
          subtitle={showGrandTotal && selectedMonth === 'All' ? "All years combined" : "Fuel expenses"}
          delay={0.3}
          topExpenses={topExpensesPetrol}
          onIconClick={() => setShowGrandTotal(!showGrandTotal)}
          iconClickable={selectedMonth === 'All'}
        />
      </div>

      {/* Charts and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryPieChart />
        <MonthlyBarChart />
        <BudgetProgress />
      </div>
    </div>
  );
};

export default Dashboard;
