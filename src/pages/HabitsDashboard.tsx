import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import {
  Target,
  Flame,
  TrendingUp,
  CheckCircle2,
  Circle,
  Trash2,
  Dumbbell,
  BookOpen,
  Brain,
  Calendar,
  Star,
  Heart,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useHabits } from '@/contexts/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const iconMap: Record<string, React.ElementType> = {
  Dumbbell,
  BookOpen,
  Brain,
  Calendar,
  Star,
  Heart,
  Zap,
  Target,
};

const HabitsDashboard: React.FC = () => {
  const { habits, toggleHabitCompletion, deleteHabit, getCompletionRate } = useHabits();

  const today = format(new Date(), 'yyyy-MM-dd');
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE'),
      dayNum: format(date, 'd'),
    };
  });

  const completedToday = habits.filter((h) =>
    h.completedDates.includes(today)
  ).length;
  const totalHabits = habits.length;
  const overallProgress = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Calculate current streak (simplified)
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date();
    
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const allCompleted = habits.every((h) => h.completedDates.includes(dateStr));
      if (allCompleted && habits.length > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Habit Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Build better habits, one day at a time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalHabits}</p>
                  <p className="text-xs text-muted-foreground">Active Habits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {completedToday}/{totalHabits}
                  </p>
                  <p className="text-xs text-muted-foreground">Done Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{overallProgress}%</p>
                  <p className="text-xs text-muted-foreground">Today's Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedToday} of {totalHabits} habits completed
          </p>
        </CardContent>
      </Card>

      {/* Habits Calendar Grid */}
      <HabitsCalendarGrid 
        habits={habits}
        toggleHabitCompletion={toggleHabitCompletion}
        deleteHabit={deleteHabit}
        iconMap={iconMap}
      />
    </div>
  );
};

interface HabitsCalendarGridProps {
  habits: any[];
  toggleHabitCompletion: (habitId: string, date: string) => void;
  deleteHabit: (id: string) => void;
  iconMap: Record<string, React.ElementType>;
}

const HabitsCalendarGrid: React.FC<HabitsCalendarGridProps> = ({
  habits,
  toggleHabitCompletion,
  deleteHabit,
  iconMap,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Weekly view: last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

  const displayDays = viewMode === 'monthly' ? daysInMonth : last7Days;

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Your Habits</h2>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'weekly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('weekly')}
            className="h-7 px-3 text-xs"
          >
            Weekly
          </Button>
          <Button
            variant={viewMode === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('monthly')}
            className="h-7 px-3 text-xs"
          >
            Monthly
          </Button>
        </div>
      </div>

      {habits.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No habits yet. Start by adding one!</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Navigation Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              {viewMode === 'monthly' ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousMonth}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-base font-semibold text-foreground">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextMonth}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <h3 className="text-base font-semibold text-foreground w-full text-center">
                  Last 7 Days
                </h3>
              )}
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
              <table className={`w-full ${viewMode === 'monthly' ? 'min-w-[800px]' : ''}`}>
                <thead>
                  <tr className="border-b border-border">
                    <th className="sticky left-0 bg-background z-10 min-w-[160px] px-3 py-2 text-left">
                      <span className="sr-only">Habit</span>
                    </th>
                    {displayDays.map((day) => {
                      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      return (
                        <th
                          key={day.toISOString()}
                          className={`px-1 py-2 text-center min-w-[36px] ${
                            isToday ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="text-[10px] uppercase text-muted-foreground font-medium">
                            {format(day, 'EEE').slice(0, 2)}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              isToday ? 'text-primary' : 'text-foreground'
                            }`}
                          >
                            {format(day, 'd')}
                          </div>
                        </th>
                      );
                    })}
                    <th className="sticky right-0 bg-background z-10 px-3 py-2 text-center min-w-[60px] border-l border-border">
                      <div className="text-[10px] uppercase text-muted-foreground font-medium">Rate</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => {
                    const IconComponent = iconMap[habit.icon] || Target;
                    const completedInPeriod = displayDays.filter((day) =>
                      habit.completedDates.includes(format(day, 'yyyy-MM-dd'))
                    ).length;
                    const periodRate = Math.round((completedInPeriod / displayDays.length) * 100);
                    
                    // Calculate current streak
                    const calculateHabitStreak = () => {
                      let streak = 0;
                      const checkDate = new Date();
                      while (true) {
                        const dateStr = format(checkDate, 'yyyy-MM-dd');
                        if (habit.completedDates.includes(dateStr)) {
                          streak++;
                          checkDate.setDate(checkDate.getDate() - 1);
                        } else {
                          break;
                        }
                      }
                      return streak;
                    };
                    const habitStreak = calculateHabitStreak();
                    
                    return (
                      <tr key={habit.id} className="border-b border-border last:border-b-0 group">
                        <td className="sticky left-0 bg-background z-10 px-3 py-3 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <div
                              className="p-1.5 rounded-md flex-shrink-0"
                              style={{ backgroundColor: `${habit.color}20` }}
                            >
                              <IconComponent
                                className="h-4 w-4"
                                style={{ color: habit.color }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground whitespace-nowrap">
                              {habit.name}
                            </span>
                            {habitStreak > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                                      habitStreak >= 100 
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-500 ring-1 ring-purple-500/30' 
                                        : habitStreak >= 30 
                                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 ring-1 ring-yellow-500/30' 
                                          : habitStreak >= 7 
                                            ? 'bg-blue-500/10 text-blue-500' 
                                            : 'bg-orange-500/10 text-orange-500'
                                    }`}>
                                      {habitStreak >= 100 ? (
                                        <Star className="h-3 w-3" />
                                      ) : habitStreak >= 30 ? (
                                        <Zap className="h-3 w-3" />
                                      ) : (
                                        <Flame className="h-3 w-3" />
                                      )}
                                      <span className="text-xs font-semibold">{habitStreak}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-medium">
                                      {habitStreak >= 100 
                                        ? `🏆 Legendary! ${habitStreak} day streak` 
                                        : habitStreak >= 30 
                                          ? `⚡ On fire! ${habitStreak} day streak` 
                                          : habitStreak >= 7 
                                            ? `🔥 Great! ${habitStreak} day streak` 
                                            : `${habitStreak} day streak`}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-auto"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{habit.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteHabit(habit.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                        {displayDays.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isCompleted = habit.completedDates.includes(dateStr);
                          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

                          return (
                            <td
                              key={day.toISOString()}
                              className={`px-1 py-2 text-center ${isToday ? 'bg-primary/5' : ''}`}
                            >
                              <button
                                onClick={() => toggleHabitCompletion(habit.id, dateStr)}
                                className="mx-auto flex items-center justify-center h-6 w-6 rounded-full transition-all hover:scale-110"
                              >
                                {isCompleted ? (
                                  <CheckCircle2
                                    className="h-5 w-5"
                                    style={{ color: habit.color }}
                                  />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground/30 hover:text-muted-foreground/50" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                        <td className="sticky right-0 bg-background z-10 px-3 py-2 text-center border-l border-border">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="text-sm font-semibold cursor-default"
                                  style={{ color: periodRate >= 50 ? habit.color : undefined }}
                                >
                                  {periodRate}%
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{completedInPeriod} of {displayDays.length} days completed</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HabitsDashboard;
