import React from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
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
} from 'lucide-react';
import { useHabits } from '@/contexts/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

      {/* Habits List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Your Habits</h2>
        
        {habits.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No habits yet. Start by adding one!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {habits.map((habit, index) => {
              const IconComponent = iconMap[habit.icon] || Target;
              const completionRate = getCompletionRate(habit.id, 7);
              const isCompletedToday = habit.completedDates.includes(today);

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon & Toggle */}
                        <button
                          onClick={() => toggleHabitCompletion(habit.id, today)}
                          className="flex-shrink-0 mt-1"
                        >
                          <div
                            className="p-2 rounded-lg transition-all duration-200"
                            style={{
                              backgroundColor: isCompletedToday
                                ? habit.color
                                : `${habit.color}20`,
                            }}
                          >
                            {isCompletedToday ? (
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            ) : (
                              <IconComponent
                                className="h-5 w-5"
                                style={{ color: habit.color }}
                              />
                            )}
                          </div>
                        </button>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-medium ${
                                isCompletedToday
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {habit.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {habit.frequency}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {habit.description}
                          </p>

                          {/* Weekly Progress */}
                          <div className="flex items-center gap-1">
                            {last7Days.map((day) => {
                              const isCompleted = habit.completedDates.includes(day.date);
                              return (
                                <button
                                  key={day.date}
                                  onClick={() =>
                                    toggleHabitCompletion(habit.id, day.date)
                                  }
                                  className="flex flex-col items-center gap-1 p-1 rounded hover:bg-muted/50 transition-colors"
                                >
                                  <span className="text-[10px] text-muted-foreground">
                                    {day.label}
                                  </span>
                                  {isCompleted ? (
                                    <CheckCircle2
                                      className="h-5 w-5"
                                      style={{ color: habit.color }}
                                    />
                                  ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                                  )}
                                </button>
                              );
                            })}
                            <div className="ml-2 pl-2 border-l border-border">
                              <span className="text-sm font-medium text-foreground">
                                {completionRate}%
                              </span>
                              <p className="text-[10px] text-muted-foreground">7-day</p>
                            </div>
                          </div>
                        </div>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{habit.name}"? This
                                action cannot be undone.
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
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitsDashboard;
