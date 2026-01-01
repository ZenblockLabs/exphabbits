import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Fuel, DollarSign } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { calculateYearTotals } from '@/data/expenseData';
import { StatCard } from '@/components/StatCard';
import { CategoryPieChart, MonthlyBarChart } from '@/components/ExpenseCharts';

const Dashboard: React.FC = () => {
  const { expenses } = useExpenses();
  const totals = calculateYearTotals(expenses);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 lg:p-8 border border-primary/10"
      >
        <div className="relative z-10">
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Here's an overview of your expenses. Track, analyze, and manage your spending habits effectively.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Year Total"
          value={totals.yearTotal}
          icon={DollarSign}
          variant="primary"
          subtitle="All expenses combined"
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart />
        <MonthlyBarChart />
      </div>
    </div>
  );
};

export default Dashboard;
