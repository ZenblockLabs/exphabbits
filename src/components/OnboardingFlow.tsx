import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  LayoutDashboard, 
  Wallet, 
  Target, 
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: Sparkles,
    title: "Welcome to Habex!",
    description: "Your all-in-one app for tracking habits and managing expenses. Let's take a quick tour of what you can do.",
    color: "from-primary to-primary/60",
    features: [
      "Track daily habits and build streaks",
      "Monitor and categorize expenses",
      "Get insights with beautiful charts"
    ]
  },
  {
    icon: LayoutDashboard,
    title: "Combined Dashboard",
    description: "Get a unified view of your habits and expenses at a glance. See your streaks, spending trends, and quick stats all in one place.",
    color: "from-blue-500 to-blue-600",
    features: [
      "Weekly habit completion trends",
      "Monthly expense overview",
      "Top performing habits"
    ]
  },
  {
    icon: Target,
    title: "Habit Tracking",
    description: "Build positive habits with our intuitive tracking system. Set goals, track streaks, and celebrate your progress.",
    color: "from-green-500 to-emerald-600",
    features: [
      "Daily habit check-ins",
      "Streak tracking with best records",
      "Category organization"
    ]
  },
  {
    icon: Flame,
    title: "21-Day Challenge",
    description: "Science says it takes 21 days to form a habit. Join our challenge mode to build lasting habits with extra motivation.",
    color: "from-orange-500 to-red-500",
    features: [
      "Structured habit building",
      "Progress visualization",
      "Milestone celebrations"
    ]
  },
  {
    icon: Wallet,
    title: "Expense Management",
    description: "Track your spending across categories, set budgets, and manage recurring expenses with ease.",
    color: "from-purple-500 to-violet-600",
    features: [
      "Category-based tracking",
      "Recurring expense automation",
      "Budget progress monitoring"
    ]
  },
  {
    icon: CheckCircle2,
    title: "You're All Set!",
    description: "You're ready to start your journey with Habex. Build better habits, manage your money, and track your progress.",
    color: "from-primary to-secondary",
    features: [
      "Start tracking today",
      "Set your first habit",
      "Log your first expense"
    ]
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const step = onboardingSteps[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
      >
        {/* Skip button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {/* Icon */}
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br",
              step.color
            )}>
              <step.icon className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mb-6">
              {step.description}
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {step.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br",
                    step.color
                  )}>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentStep 
                      ? "w-8 bg-primary" 
                      : index < currentStep 
                        ? "bg-primary/50" 
                        : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className={cn(
                  "flex-1 bg-gradient-to-r",
                  step.color
                )}
              >
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};