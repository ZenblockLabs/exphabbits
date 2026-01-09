import React, { useEffect, useRef, useState } from 'react';
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
import confetti from 'canvas-confetti';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  bgClass: string;
  unlocked: boolean;
}

interface HabitBadgesProps {
  habits: Habit[];
  getCurrentStreak: (habit: Habit) => number;
}

const UNLOCKED_BADGES_KEY = 'habex-unlocked-badges';

const HabitBadges: React.FC<HabitBadgesProps> = ({ habits, getCurrentStreak }) => {
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const hasTriggeredConfetti = useRef(false);

  const getBadges = (): Badge[] => {
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
        unlocked: maxCurrentStreak >= 3 || maxBestStreak >= 3,
      },
      {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: <Zap className="h-5 w-5" />,
        bgClass: 'from-blue-400 to-cyan-500',
        unlocked: maxCurrentStreak >= 7 || maxBestStreak >= 7,
      },
      {
        id: 'habit-master',
        name: 'Habit Master',
        description: 'Achieve a 21-day streak (habit formed!)',
        icon: <Star className="h-5 w-5" />,
        bgClass: 'from-yellow-400 to-orange-500',
        unlocked: maxCurrentStreak >= 21 || maxBestStreak >= 21,
      },
      {
        id: 'monthly-champion',
        name: 'Monthly Champion',
        description: 'Complete 30 days in a row',
        icon: <Trophy className="h-5 w-5" />,
        bgClass: 'from-amber-400 to-yellow-500',
        unlocked: maxCurrentStreak >= 30 || maxBestStreak >= 30,
      },
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 100-day streak',
        icon: <Rocket className="h-5 w-5" />,
        bgClass: 'from-purple-500 to-pink-500',
        unlocked: maxCurrentStreak >= 100 || maxBestStreak >= 100,
      },
      {
        id: 'legend',
        name: 'Legend',
        description: 'Achieve a 365-day streak',
        icon: <Crown className="h-5 w-5" />,
        bgClass: 'from-violet-600 to-purple-700',
        unlocked: maxCurrentStreak >= 365 || maxBestStreak >= 365,
      },
      {
        id: 'multi-tasker',
        name: 'Multi-Tasker',
        description: 'Have 3+ active habits with streaks',
        icon: <Target className="h-5 w-5" />,
        bgClass: 'from-emerald-400 to-teal-500',
        unlocked: activeHabits >= 3,
      },
      {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Complete 50 total habit entries',
        icon: <Sparkles className="h-5 w-5" />,
        bgClass: 'from-indigo-400 to-blue-500',
        unlocked: totalCompletions >= 50,
      },
      {
        id: 'centurion',
        name: 'Centurion',
        description: 'Complete 100 total habit entries',
        icon: <Award className="h-5 w-5" />,
        bgClass: 'from-rose-400 to-pink-500',
        unlocked: totalCompletions >= 100,
      },
    ];
  };

  const badges = getBadges();
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  // Check for newly unlocked badges and trigger confetti
  useEffect(() => {
    if (habits.length === 0) return;

    const storedBadges = localStorage.getItem(UNLOCKED_BADGES_KEY);
    const previouslyUnlocked: string[] = storedBadges ? JSON.parse(storedBadges) : [];
    
    const currentUnlockedIds = unlockedBadges.map(b => b.id);
    const newBadges = currentUnlockedIds.filter(id => !previouslyUnlocked.includes(id));

    if (newBadges.length > 0 && !hasTriggeredConfetti.current) {
      setNewlyUnlocked(newBadges);
      hasTriggeredConfetti.current = true;

      // Trigger confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Save updated badges to localStorage
      localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(currentUnlockedIds));

      // Clear newly unlocked state after animation
      setTimeout(() => {
        setNewlyUnlocked([]);
      }, 5000);
    } else if (newBadges.length === 0) {
      // Update stored badges even if no new ones
      localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(currentUnlockedIds));
    }
  }, [habits, unlockedBadges]);

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
            {unlockedBadges.map((badge, index) => {
              const isNew = newlyUnlocked.includes(badge.id);
              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: 1, 
                        rotate: 0,
                        boxShadow: isNew 
                          ? ['0 0 0 0 rgba(255,215,0,0)', '0 0 20px 10px rgba(255,215,0,0.5)', '0 0 0 0 rgba(255,215,0,0)']
                          : undefined
                      }}
                      transition={{ 
                        delay: index * 0.1, 
                        type: 'spring', 
                        stiffness: 200,
                        boxShadow: isNew ? { duration: 1, repeat: 3 } : undefined
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`relative p-3 rounded-xl bg-gradient-to-br ${badge.bgClass} text-white shadow-lg cursor-pointer ${isNew ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                    >
                      {badge.icon}
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      />
                      {isNew && (
                        <motion.div
                          className="absolute -top-2 -left-2 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full"
                          initial={{ scale: 0, rotate: -12 }}
                          animate={{ scale: 1, rotate: -12 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                        >
                          NEW!
                        </motion.div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {isNew && <p className="text-xs text-yellow-500 mt-1">🎉 Just unlocked!</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
            
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
