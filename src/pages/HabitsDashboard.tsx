import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import {
  Target,
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
  Check,
  Plus,
} from 'lucide-react';
import { useHabits } from '@/contexts/HabitContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Link } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
  const { habits, toggleHabitCompletion, deleteHabit } = useHabits();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Habit Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your daily habits
          </p>
        </div>
        <Link to="/habits/add">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Habit
          </Button>
        </Link>
      </div>

      {/* Main Grid Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Month Header with Navigation */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-border">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex">
            {/* Habits Column (Fixed) */}
            <div className="flex-shrink-0 w-40 border-r border-border bg-muted/30">
              {/* Empty cell for header alignment */}
              <div className="h-12 border-b border-border" />
              
              {/* Habit Names */}
              {habits.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No habits yet
                </div>
              ) : (
                habits.map((habit, index) => {
                  const IconComponent = iconMap[habit.icon] || Target;
                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-12 flex items-center gap-2 px-3 border-b border-border group"
                    >
                      <div
                        className="p-1.5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        <IconComponent
                          className="h-4 w-4"
                          style={{ color: habit.color }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground truncate flex-1">
                        {habit.name}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{habit.name}"?
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
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Calendar Grid (Scrollable) */}
            <ScrollArea className="flex-1">
              <div className="min-w-max">
                {/* Day Numbers Header */}
                <div className="flex h-12 border-b border-border">
                  {daysInMonth.map((day) => {
                    const isToday = isSameDay(day, today);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`w-10 flex-shrink-0 flex flex-col items-center justify-center border-r border-border/50 ${
                          isToday ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {format(day, 'EEE').slice(0, 2)}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isToday ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Habit Rows */}
                {habits.map((habit) => (
                  <div key={habit.id} className="flex h-12 border-b border-border">
                    {daysInMonth.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isCompleted = habit.completedDates.includes(dateStr);
                      const isToday = isSameDay(day, today);

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => toggleHabitCompletion(habit.id, dateStr)}
                          className={`w-10 flex-shrink-0 flex items-center justify-center border-r border-border/50 transition-all duration-200 hover:bg-muted/50 ${
                            isToday ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${
                              isCompleted
                                ? 'scale-100'
                                : 'border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
                            }`}
                            style={{
                              backgroundColor: isCompleted ? habit.color : 'transparent',
                            }}
                          >
                            {isCompleted && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {habits.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">
            No habits yet. Start tracking your daily habits!
          </p>
          <Link to="/habits/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Habit
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default HabitsDashboard;
