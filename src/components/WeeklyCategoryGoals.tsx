import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDates: string[];
  category?: string;
}

interface WeeklyCategoryGoalsProps {
  habits: Habit[];
  weeklyGoals: Record<string, number>;
  onUpdateGoal: (category: string, goal: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  health: 'hsl(142, 76%, 36%)',
  productivity: 'hsl(221, 83%, 53%)',
  learning: 'hsl(270, 76%, 53%)',
  mindfulness: 'hsl(173, 80%, 40%)',
  fitness: 'hsl(25, 95%, 53%)',
  other: 'hsl(0, 0%, 50%)',
};

const WeeklyCategoryGoals: React.FC<WeeklyCategoryGoalsProps> = ({ 
  habits, 
  weeklyGoals,
  onUpdateGoal
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Get current week date range
  const weekRange = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    startOfWeek.setDate(now.getDate() - dayOfWeek); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    
    return { start: startOfWeek, end: endOfWeek };
  }, []);

  // Get all dates in current week
  const weekDates = useMemo(() => {
    const dates: string[] = [];
    const current = new Date(weekRange.start);
    
    while (current <= weekRange.end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, [weekRange]);

  // Calculate category progress for this week
  const categoryProgress = useMemo(() => {
    const categories: Record<string, {
      category: string;
      habits: Habit[];
      completions: number;
      possibleCompletions: number;
      goal: number;
      progress: number;
      color: string;
    }> = {};

    // Group habits by category
    habits.forEach(habit => {
      const cat = habit.category || 'other';
      if (!categories[cat]) {
        categories[cat] = {
          category: cat,
          habits: [],
          completions: 0,
          possibleCompletions: 0,
          goal: weeklyGoals[cat] || 70, // Default 70% goal
          progress: 0,
          color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other,
        };
      }
      categories[cat].habits.push(habit);
    });

    // Calculate completions for each category
    Object.values(categories).forEach(catData => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      weekDates.forEach(dateStr => {
        const date = new Date(dateStr);
        if (date <= today) { // Only count past and today
          catData.habits.forEach(habit => {
            catData.possibleCompletions++;
            if (habit.completedDates.includes(dateStr)) {
              catData.completions++;
            }
          });
        }
      });
      
      catData.progress = catData.possibleCompletions > 0
        ? Math.round((catData.completions / catData.possibleCompletions) * 100)
        : 0;
    });

    return Object.values(categories).sort((a, b) => b.habits.length - a.habits.length);
  }, [habits, weekDates, weeklyGoals]);

  const startEditing = (category: string, currentGoal: number) => {
    setEditingCategory(category);
    setEditValue(String(currentGoal));
  };

  const saveGoal = (category: string) => {
    const goal = Math.min(100, Math.max(0, parseInt(editValue) || 70));
    onUpdateGoal(category, goal);
    setEditingCategory(null);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const total = categoryProgress.reduce((sum, cat) => sum + cat.completions, 0);
    const possible = categoryProgress.reduce((sum, cat) => sum + cat.possibleCompletions, 0);
    return possible > 0 ? Math.round((total / possible) * 100) : 0;
  }, [categoryProgress]);

  // Count goals met
  const goalsMet = useMemo(() => {
    return categoryProgress.filter(cat => cat.progress >= cat.goal).length;
  }, [categoryProgress]);

  if (habits.length === 0) return null;

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = weekRange.start.toLocaleDateString('en-US', options);
    const end = weekRange.end.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Weekly Category Goals</CardTitle>
                    <CardDescription>{formatDateRange()}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={goalsMet === categoryProgress.length ? 'default' : 'secondary'}>
                    {goalsMet}/{categoryProgress.length} goals met
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Overall Progress */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Weekly Progress</span>
                  <span className="font-semibold">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              {/* Category Goals */}
              <div className="space-y-3">
                {categoryProgress.map((cat) => {
                  const isGoalMet = cat.progress >= cat.goal;
                  const isEditing = editingCategory === cat.category;

                  return (
                    <motion.div
                      key={cat.category}
                      className={`p-3 rounded-lg border transition-colors ${
                        isGoalMet 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-card border-border'
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium capitalize">{cat.category}</span>
                          <Badge variant="outline" className="text-xs">
                            {cat.habits.length} habit{cat.habits.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-16 h-7 text-xs"
                                autoFocus
                              />
                              <span className="text-xs text-muted-foreground">%</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-green-600 dark:text-green-500"
                                onClick={() => saveGoal(cat.category)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-destructive"
                                onClick={cancelEditing}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm">
                                <span className={isGoalMet ? 'text-green-600 font-semibold' : ''}>
                                  {cat.progress}%
                                </span>
                                <span className="text-muted-foreground"> / {cat.goal}%</span>
                              </span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 opacity-50 hover:opacity-100"
                                onClick={() => startEditing(cat.category, cat.goal)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress bar with goal marker */}
                      <div className="relative">
                        <Progress 
                          value={cat.progress} 
                          className={`h-2 ${isGoalMet ? '[&>div]:bg-green-500' : ''}`}
                        />
                        {/* Goal marker */}
                        <div 
                          className="absolute top-0 h-2 w-0.5 bg-foreground/60 rounded"
                          style={{ left: `${cat.goal}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {cat.completions}/{cat.possibleCompletions} completions
                        </span>
                        {isGoalMet && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Goal reached!
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
};

export default WeeklyCategoryGoals;
