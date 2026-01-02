import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Fuel, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { calculateYearTotals, MONTHS } from '@/data/expenseData';
import { StatCard } from '@/components/StatCard';
import { CategoryPieChart, MonthlyBarChart } from '@/components/ExpenseCharts';
import { BudgetProgress } from '@/components/BudgetProgress';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Dashboard: React.FC = () => {
  const { getFilteredYearData, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, availableYears } = useExpenses();
  const yearData = getFilteredYearData();
  const totals = calculateYearTotals(yearData);

  // Generate years for dropdown (5 years back and forward from current)
  const currentYear = new Date().getFullYear();
  const allYears = Array.from(
    new Set([...availableYears, ...Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)])
  ).sort((a, b) => b - a);

  // Month navigation options: "All" + 12 months
  const monthOptions = ['All', ...MONTHS];
  const currentMonthIndex = monthOptions.indexOf(selectedMonth);

  const handlePrevMonth = () => {
    const newIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : monthOptions.length - 1;
    setSelectedMonth(monthOptions[newIndex]);
  };

  const handleNextMonth = () => {
    const newIndex = currentMonthIndex < monthOptions.length - 1 ? currentMonthIndex + 1 : 0;
    setSelectedMonth(monthOptions[newIndex]);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 lg:p-8 border border-primary/10"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Here's an overview of your expenses. Track, analyze, and manage your spending habits effectively.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Month:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
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
                  className="h-8 w-8"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Year:</span>
              <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(Number(val))}>
                <SelectTrigger className="w-[120px]">
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
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title={selectedMonth === 'All' ? 'Year Total' : `${selectedMonth} Total`}
          value={totals.yearTotal}
          icon={DollarSign}
          variant="primary"
          subtitle={selectedMonth === 'All' ? `All expenses in ${selectedYear}` : `Expenses in ${selectedMonth} ${selectedYear}`}
          delay={0}
        />
        <StatCard
          title="Self Expenses"
          value={totals.totalSelf}
          icon={Wallet}
          variant="default"
          subtitle="Rent, subscriptions, etc."
          delay={0.1}
        />
        <StatCard
          title="Other Expenses"
          value={totals.totalOther}
          icon={TrendingUp}
          variant="accent"
          subtitle="Daily spending"
          delay={0.2}
        />
        <StatCard
          title="Petrol"
          value={totals.totalPetrol}
          icon={Fuel}
          variant="default"
          subtitle="Fuel expenses"
          delay={0.3}
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
