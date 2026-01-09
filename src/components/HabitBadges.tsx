import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Zap, 
  Star, 
  Trophy, 
  Crown, 
  Rocket, 
  Sparkles,
  Target,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Habit } from '@/contexts/HabitContext';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bgClass: string;
  requirement: (habit: Habit, currentStreak: number) => boolean;
  unlocked: boolean;
}

interface HabitBadgesProps {
  habits: Habit[];
  getCurrentStreak: (habit: Habit) => number;
}

const HabitBadges: React.FC<HabitBadgesProps> = ({ habits, getCurrentStreak }) => {
  const getBadges = (): Badge[] => {
    // Calculate max current streak and max best streak
    const maxCurrentStreak = Math.max(...habits.map(h => getCurrentStreak(h)), 0);
    const maxBestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    const activeHabits = habits.filter(h => getCurrentStreak(h) > 0).length;

    return [
      {
        id: 'first-flame',
        name: 'First Flame',
        description: 'Complete a habit for 3 consecutive days',
        icon: <Flame className="h-5 w-5" />,
        bgClass: 'from-orange-400 to-red-500',
        requirement: () => maxCurrentStreak >= 3 || maxBestStreak >= 3,
        unlocked: maxCurrentStreak >= 3 || maxBestStreak >= 3,
      },
      {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: <Zap className="h-5 w-5" />,
        bgClass: 'from-blue-400 to-cyan-500',
        requirement: () => maxCurrentStreak >= 7 || maxBestStreak >= 7,
        unlocked: maxCurrentStreak >= 7 || maxBestStreak >= 7,
      },
      {
        id: 'habit-master',
        name: 'Habit Master',
        description: 'Achieve a 21-day streak (habit formed!)',
        icon: <Star className="h-5 w-5" />,
        bgClass: 'from-yellow-400 to-orange-500',
        requirement: () => maxCurrentStreak >= 21 || maxBestStreak >= 21,
        unlocked: maxCurrentStreak >= 21 || maxBestStreak >= 21,
      },
      {
        id: 'monthly-champion',
        name: 'Monthly Champion',
        description: 'Complete 30 days in a row',
        icon: <Trophy className="h-5 w-5" />,
        bgClass: 'from-amber-400 to-yellow-500',
        requirement: () => maxCurrentStreak >= 30 || maxBestStreak >= 30,
        unlocked: maxCurrentStreak >= 30 || maxBestStreak >= 30,
      },
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 100-day streak',
        icon: <Rocket className="h-5 w-5" />,
        bgClass: 'from-purple-500 to-pink-500',
        requirement: () => maxCurrentStreak >= 100 || maxBestStreak >= 100,
        unlocked: maxCurrentStreak >= 100 || maxBestStreak >= 100,
      },
      {
        id: 'legend',
        name: 'Legend',
        description: 'Achieve a 365-day streak',
        icon: <Crown className="h-5 w-5" />,
        bgClass: 'from-violet-600 to-purple-700',
        requirement: () => maxCurrentStreak >= 365 || maxBestStreak >= 365,
        unlocked: maxCurrentStreak >= 365 || maxBestStreak >= 365,
      },
      {
        id: 'multi-tasker',
        name: 'Multi-Tasker',
        description: 'Have 3+ active habits with streaks',
        icon: <Target className="h-5 w-5" />,
        bgClass: 'from-emerald-400 to-teal-500',
        requirement: () => activeHabits >= 3,
        unlocked: activeHabits >= 3,
      },
      {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Complete 50 total habit entries',
        icon: <Sparkles className="h-5 w-5" />,
        bgClass: 'from-indigo-400 to-blue-500',
        requirement: () => totalCompletions >= 50,
        unlocked: totalCompletions >= 50,
      },
      {
        id: 'centurion',
        name: 'Centurion',
        description: 'Complete 100 total habit entries',
        icon: <Award className="h-5 w-5" />,
        bgClass: 'from-rose-400 to-pink-500',
        requirement: () => totalCompletions >= 100,
        unlocked: totalCompletions >= 100,
      },
    ];
  };

  const badges = getBadges();
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  if (habits.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Achievements
          <span className="text-sm font-normal text-muted-foreground">
            ({unlockedBadges.length}/{badges.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-3">
            {/* Unlocked badges */}
            {unlockedBadges.map((badge, index) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: index * 0.1, 
                      type: 'spring', 
                      stiffness: 200 
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`relative p-3 rounded-xl bg-gradient-to-br ${badge.bgClass} text-white shadow-lg cursor-pointer`}
                  >
                    {badge.icon}
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            
            {/* Locked badges */}
            {lockedBadges.map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-xl bg-muted/50 text-muted-foreground/40 border border-dashed border-border cursor-help">
                    {badge.icon}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="font-semibold text-muted-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  <p className="text-xs text-primary mt-1">🔒 Locked</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        
        {unlockedBadges.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Start building streaks to unlock badges!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default HabitBadges;
