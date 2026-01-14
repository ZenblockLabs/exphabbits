import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, CalendarDays, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Habit {
  id: string;
  name: string;
  completedDates: string[];
}

interface HabitCalendarHeatmapProps {
  habits: Habit[];
}

const HabitCalendarHeatmap: React.FC<HabitCalendarHeatmapProps> = ({ habits }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  // Generate calendar data for current month
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const totalHabits = habits.length;

    const days: { date: number; dateStr: string; completed: number; rate: number; isFuture: boolean; isEmpty: boolean }[] = [];

    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: 0, dateStr: '', completed: 0, rate: 0, isFuture: false, isEmpty: true });
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const completed = habits.filter(h => h.completedDates.includes(dateStr)).length;
      const rate = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
      const isFuture = day > currentDay;

      days.push({ date: day, dateStr, completed, rate, isFuture, isEmpty: false });
    }

    return days;
  }, [habits, currentMonth, currentYear, currentDay]);

  // Calculate month-over-month comparison
  const monthComparison = useMemo(() => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return { current: 0, previous: 0, change: 0, trend: 'neutral' as const };

    // Current month stats (up to current day)
    let currentCompletions = 0;
    let currentPossible = 0;
    for (let day = 1; day <= currentDay; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      currentCompletions += habits.filter(h => h.completedDates.includes(dateStr)).length;
      currentPossible += totalHabits;
    }
    const currentRate = currentPossible > 0 ? Math.round((currentCompletions / currentPossible) * 100) : 0;

    // Previous month stats (same number of days for fair comparison)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    const compareDays = Math.min(currentDay, daysInPrevMonth);

    let prevCompletions = 0;
    let prevPossible = 0;
    for (let day = 1; day <= compareDays; day++) {
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      prevCompletions += habits.filter(h => h.completedDates.includes(dateStr)).length;
      prevPossible += totalHabits;
    }
    const prevRate = prevPossible > 0 ? Math.round((prevCompletions / prevPossible) * 100) : 0;

    const change = currentRate - prevRate;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    return { current: currentRate, previous: prevRate, change, trend };
  }, [habits, currentMonth, currentYear, currentDay]);

  // Get color based on completion rate
  const getHeatmapColor = (rate: number, isFuture: boolean, isEmpty: boolean) => {
    if (isEmpty) return 'bg-transparent';
    if (isFuture) return 'bg-muted/30';
    if (rate === 0) return 'bg-muted/50';
    if (rate < 25) return 'bg-red-500/30';
    if (rate < 50) return 'bg-orange-500/40';
    if (rate < 75) return 'bg-amber-500/50';
    if (rate < 100) return 'bg-green-500/60';
    return 'bg-green-500';
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  if (habits.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Habit Heatmap</CardTitle>
                <CardDescription>{monthNames[currentMonth]} {currentYear}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map((day, i) => (
                <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <TooltipProvider>
              <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all cursor-default ${
                          getHeatmapColor(day.rate, day.isFuture, day.isEmpty)
                        } ${day.date === currentDay ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''} ${
                          !day.isEmpty && !day.isFuture && day.rate === 100 ? 'text-white' : 'text-foreground/70'
                        }`}
                      >
                        {day.isEmpty ? '' : day.date}
                      </div>
                    </TooltipTrigger>
                    {!day.isEmpty && !day.isFuture && (
                      <TooltipContent>
                        <p className="font-medium">{monthNames[currentMonth]} {day.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {day.completed}/{habits.length} habits ({day.rate}%)
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-muted/50" />
                <div className="w-4 h-4 rounded bg-red-500/30" />
                <div className="w-4 h-4 rounded bg-orange-500/40" />
                <div className="w-4 h-4 rounded bg-amber-500/50" />
                <div className="w-4 h-4 rounded bg-green-500/60" />
                <div className="w-4 h-4 rounded bg-green-500" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Month-over-Month Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                monthComparison.trend === 'up' ? 'bg-green-500/10' :
                monthComparison.trend === 'down' ? 'bg-red-500/10' :
                'bg-muted/50'
              }`}>
                {monthComparison.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : monthComparison.trend === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Month Comparison</CardTitle>
                <CardDescription>vs {shortMonthNames[prevMonth]} (first {currentDay} days)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Big comparison display */}
            <div className="flex items-center justify-center gap-8">
              {/* Previous month */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{shortMonthNames[prevMonth]}</p>
                <p className="text-3xl font-bold text-muted-foreground">{monthComparison.previous}%</p>
              </div>

              {/* Arrow indicator */}
              <div className={`flex flex-col items-center ${
                monthComparison.trend === 'up' ? 'text-green-500' :
                monthComparison.trend === 'down' ? 'text-red-500' :
                'text-muted-foreground'
              }`}>
                {monthComparison.trend === 'up' ? (
                  <ArrowUp className="h-6 w-6" />
                ) : monthComparison.trend === 'down' ? (
                  <ArrowDown className="h-6 w-6" />
                ) : (
                  <Minus className="h-6 w-6" />
                )}
                <span className="text-sm font-medium">
                  {monthComparison.change > 0 ? '+' : ''}{monthComparison.change}%
                </span>
              </div>

              {/* Current month */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{shortMonthNames[currentMonth]}</p>
                <p className="text-3xl font-bold text-primary">{monthComparison.current}%</p>
              </div>
            </div>

            {/* Visual comparison bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-8">{shortMonthNames[prevMonth]}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-muted-foreground/50 rounded-full transition-all"
                    style={{ width: `${monthComparison.previous}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-10 text-right">{monthComparison.previous}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-8">{shortMonthNames[currentMonth]}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      monthComparison.trend === 'up' ? 'bg-green-500' :
                      monthComparison.trend === 'down' ? 'bg-red-500' :
                      'bg-primary'
                    }`}
                    style={{ width: `${monthComparison.current}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-10 text-right">{monthComparison.current}%</span>
              </div>
            </div>

            {/* Insight message */}
            <div className={`p-3 rounded-lg text-sm text-center ${
              monthComparison.trend === 'up' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
              monthComparison.trend === 'down' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
              'bg-muted text-muted-foreground'
            }`}>
              {monthComparison.trend === 'up' ? (
                <>🎉 Great progress! You're {monthComparison.change}% more consistent this month.</>
              ) : monthComparison.trend === 'down' ? (
                <>📈 Keep pushing! You're {Math.abs(monthComparison.change)}% behind last month's pace.</>
              ) : (
                <>⚡ Staying steady! Your consistency matches last month.</>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default HabitCalendarHeatmap;