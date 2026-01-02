import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  Dumbbell,
  BookOpen,
  Brain,
  Calendar,
  Star,
  Heart,
  Zap,
  Check,
} from 'lucide-react';
import { useHabits } from '@/contexts/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const iconOptions = [
  { value: 'Dumbbell', label: 'Exercise', icon: Dumbbell },
  { value: 'BookOpen', label: 'Reading', icon: BookOpen },
  { value: 'Brain', label: 'Mindfulness', icon: Brain },
  { value: 'Calendar', label: 'Planning', icon: Calendar },
  { value: 'Star', label: 'Goal', icon: Star },
  { value: 'Heart', label: 'Health', icon: Heart },
  { value: 'Zap', label: 'Energy', icon: Zap },
  { value: 'Target', label: 'Focus', icon: Target },
];

const colorOptions = [
  { value: 'hsl(142, 76%, 36%)', label: 'Green' },
  { value: 'hsl(221, 83%, 53%)', label: 'Blue' },
  { value: 'hsl(270, 76%, 53%)', label: 'Purple' },
  { value: 'hsl(25, 95%, 53%)', label: 'Orange' },
  { value: 'hsl(346, 77%, 49%)', label: 'Red' },
  { value: 'hsl(173, 80%, 40%)', label: 'Teal' },
  { value: 'hsl(45, 93%, 47%)', label: 'Yellow' },
  { value: 'hsl(328, 85%, 46%)', label: 'Pink' },
];

const AddHabit: React.FC = () => {
  const navigate = useNavigate();
  const { addHabit } = useHabits();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState('hsl(142, 76%, 36%)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    addHabit({
      name: name.trim(),
      description: description.trim(),
      frequency,
      icon: selectedIcon,
      color: selectedColor,
    });

    toast.success('Habit created successfully!');
    navigate('/habits');
  };

  const SelectedIconComponent = iconOptions.find((i) => i.value === selectedIcon)?.icon || Target;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Create New Habit
        </h1>
        <p className="text-muted-foreground mt-1">
          Start building a new positive habit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Exercise"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your habit..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Icon Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose an Icon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {iconOptions.map((option) => {
                const IconComp = option.icon;
                const isSelected = selectedIcon === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedIcon(option.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <IconComp
                      className={`h-6 w-6 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        isSelected ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Color Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose a Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {colorOptions.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                  <motion.button
                    key={color.value}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(color.value)}
                    className={`relative w-10 h-10 rounded-full transition-all ${
                      isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {isSelected && (
                      <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <SelectedIconComponent
                  className="h-6 w-6"
                  style={{ color: selectedColor }}
                />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  {name || 'Your Habit Name'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {description || 'Your habit description'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/habits')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create Habit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddHabit;
