import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wallet, Target, TrendingUp, Fuel, DollarSign, Flame, CheckCircle2, Calendar } from 'lucide-react';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useHabits } from '@/contexts/HabitContext';
import { calculateYearTotals } from '@/data/expenseData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const CombinedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getFilteredYearData, selectedYear } = useExpenses();
  const { habits, getCompletionRate } = useHabits();
  
  const yearData = getFilteredYearData();
  const totals = calculateYearTotals(yearData);
  
  // Get today's date string
  const today = new Date().toISOString().split('T')[0];
  
  // Habit stats - all habits are considered active
  const activeHabits = habits;
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalActiveHabits = activeHabits.length;
  const completionPercentage = totalActiveHabits > 0 ? (completedToday / totalActiveHabits) * 100 : 0;
  
  // Calculate current streak for each habit
  const getCurrentStreak = (habit: typeof habits[0]): number => {
    let streak = 0;
    const now = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        // Allow today to be incomplete
        break;
      }
    }
    return streak;
  };
  
  // Best streaks
  const topStreaks = [...activeHabits]
    .map(h => ({ ...h, streak: getCurrentStreak(h) }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 lg:p-8 border border-primary/10"
      >
        <div className="relative z-10">
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
            Dashboard Overview 📊
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Your combined view of expenses and habits. Stay on top of your finances and build better habits.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      {/* Two-column layout for Expenses and Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Expenses</CardTitle>
                    <CardDescription>{selectedYear} Overview</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Expense Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Year Total</span>
                  </div>
                  <p className="text-xl font-bold">₹{totals.yearTotal.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Self</span>
                  </div>
                  <p className="text-xl font-bold">₹{totals.totalSelf.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-muted-foreground">Other</span>
                  </div>
                  <p className="text-xl font-bold">₹{totals.totalOther.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Fuel className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Petrol</span>
                  </div>
                  <p className="text-xl font-bold">₹{totals.totalPetrol.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Habits Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Target className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Habits</CardTitle>
                    <CardDescription>Today's Progress</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/habits')}>
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Today's completion */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Today's Completion</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {completedToday}/{totalActiveHabits} habits
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              {/* Top Streaks */}
              {topStreaks.length > 0 && topStreaks.some(h => h.streak > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Top Streaks
                  </div>
                  <div className="space-y-2">
                    {topStreaks.filter(h => h.streak > 0).map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                      >
                        <span className="text-sm truncate flex-1">{habit.name}</span>
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="h-3 w-3" />
                          <span className="text-sm font-medium">{habit.streak}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalActiveHabits === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No habits yet</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1"
                    onClick={() => navigate('/habits/add')}
                  >
                    Add your first habit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/add')}
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">Add Expense</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/habits/add')}
              >
                <Target className="h-5 w-5" />
                <span className="text-xs">Add Habit</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/months')}
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Monthly View</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/habits/challenge')}
              >
                <Flame className="h-5 w-5" />
                <span className="text-xs">21 Day Challenge</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CombinedDashboard;
