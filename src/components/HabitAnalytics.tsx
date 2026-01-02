import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Habit, HABIT_CATEGORIES, HabitCategory } from '@/contexts/HabitContext';

interface HabitAnalyticsProps {
  habits: Habit[];
}

type TimeRange = 'week' | 'month' | '3months';

const HabitAnalytics: React.FC<HabitAnalyticsProps> = ({ habits }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const chartData = useMemo(() => {
    const today = new Date();
    
    if (timeRange === 'week') {
      // Last 7 days
      const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
      return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const completed = habits.filter((h) => h.completedDates.includes(dateStr)).length;
        const total = habits.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          date: format(day, 'EEE'),
          fullDate: format(day, 'MMM d'),
          completed,
          total,
          rate,
        };
      });
    } else if (timeRange === 'month') {
      // Last 4 weeks
      const weeks = eachWeekOfInterval({
        start: subWeeks(today, 3),
        end: today,
      });
      return weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart);
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
        let totalCompleted = 0;
        let totalPossible = 0;
        
        daysInWeek.forEach((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          habits.forEach((habit) => {
            totalPossible++;
            if (habit.completedDates.includes(dateStr)) {
              totalCompleted++;
            }
          });
        });
        
        const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        return {
          date: `Week of ${format(weekStart, 'MMM d')}`,
          fullDate: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
          completed: totalCompleted,
          total: totalPossible,
          rate,
        };
      });
    } else {
      // Last 3 months
      const months = eachMonthOfInterval({
        start: subMonths(today, 2),
        end: today,
      });
      return months.map((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const daysInMonth = eachDayOfInterval({ start: startOfMonth(monthStart), end: monthEnd });
        let totalCompleted = 0;
        let totalPossible = 0;
        
        daysInMonth.forEach((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          habits.forEach((habit) => {
            totalPossible++;
            if (habit.completedDates.includes(dateStr)) {
              totalCompleted++;
            }
          });
        });
        
        const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        return {
          date: format(monthStart, 'MMM'),
          fullDate: format(monthStart, 'MMMM yyyy'),
          completed: totalCompleted,
          total: totalPossible,
          rate,
        };
      });
    }
  }, [habits, timeRange]);

  const categoryData = useMemo(() => {
    return HABIT_CATEGORIES.map((cat) => {
      const categoryHabits = habits.filter((h) => h.category === cat.value);
      const totalCompletions = categoryHabits.reduce(
        (sum, h) => sum + h.completedDates.length,
        0
      );
      return {
        category: cat.label,
        habits: categoryHabits.length,
        completions: totalCompletions,
        color: cat.color,
      };
    }).filter((c) => c.habits > 0);
  }, [habits]);

  const averageRate = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, d) => acc + d.rate, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b.rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.rate, 0) / secondHalf.length;
    return Math.round(secondAvg - firstAvg);
  }, [chartData]);

  if (habits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Habit Analytics
        </h2>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={timeRange === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('week')}
            className="h-7 px-3 text-xs"
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('month')}
            className="h-7 px-3 text-xs"
          >
            Month
          </Button>
          <Button
            variant={timeRange === '3months' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeRange('3months')}
            className="h-7 px-3 text-xs"
          >
            3 Months
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Completion Rate Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Completion Rate Trend</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{averageRate}%</span>
                {trend !== 0 && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      trend > 0
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-red-500/20 text-red-600'
                    }`}
                  >
                    {trend > 0 ? '+' : ''}{trend}%
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Habits by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="category"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'habits' ? 'Habits' : 'Total Completions',
                    ]}
                  />
                  <Bar dataKey="habits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Completions Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Completions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'completed' ? 'Completed' : 'Total Habits',
                  ]}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                />
                <Bar dataKey="completed" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitAnalytics;
