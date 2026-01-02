import React from 'react';
import { Flame, Trophy, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useHabits, Habit } from '@/contexts/HabitContext';

// Calculate current streak for a habit
const calculateStreak = (habit: Habit): number => {
  if (habit.completedDates.length === 0) return 0;
  
  const sortedDates = [...habit.completedDates].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < 21; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (sortedDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
};

const Challenge21Days: React.FC = () => {
  const { habits } = useHabits();

  // Calculate challenge stats
  const habitsWithStreaks = habits.map(h => ({ ...h, streak: calculateStreak(h) }));
  const completedChallenges = habitsWithStreaks.filter(h => h.streak >= 21);
  const inProgressChallenges = habitsWithStreaks.filter(h => h.streak > 0 && h.streak < 21);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Flame className="w-7 h-7 text-orange-500" />
          21 Days Challenge
        </h1>
        <p className="text-muted-foreground">
          Build lasting habits with the 21-day commitment
        </p>
      </div>

      {/* Challenge Info */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            The Science Behind 21 Days
          </CardTitle>
          <CardDescription>
            Research suggests it takes about 21 days to form a new habit. Complete your habits for 21 consecutive days to make them automatic!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedChallenges.length}</p>
                <p className="text-sm text-muted-foreground">Challenges Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressChallenges.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{habits.length}</p>
                <p className="text-sm text-muted-foreground">Active Habits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your 21-Day Progress
          </CardTitle>
          <CardDescription>
            Track your journey to building lasting habits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {habits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flame className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active habits yet.</p>
              <p className="text-sm">Start by adding a habit to begin your 21-day challenge!</p>
            </div>
          ) : (
            habitsWithStreaks.map((habit) => {
              const progress = Math.min((habit.streak / 21) * 100, 100);
              const isCompleted = habit.streak >= 21;
              
              return (
                <div key={habit.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{habit.icon}</span>
                      <span className="font-medium">{habit.name}</span>
                      {isCompleted && (
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {habit.streak}/21 days
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-orange-500'}
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Success</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Start with small, achievable habits</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Stack new habits with existing routines</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Track your progress daily</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Don't break the chain - consistency is key!</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Challenge21Days;
