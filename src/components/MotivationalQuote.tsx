import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const quotes = [
  { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't save what is left after spending; spend what is left after saving.", author: "Warren Buffett" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "It's not about how much money you make, but how much you keep.", author: "Robert Kiyosaki" },
];

const MotivationalQuote: React.FC = () => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * quotes.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const quote = quotes[index];

  return (
    <div className="flex items-start gap-2 mt-3">
      <Sparkles className="h-3.5 w-3.5 text-primary/70 mt-0.5 shrink-0" />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-xs text-muted-foreground/80 italic"
        >
          "{quote.text}" — <span className="font-medium text-muted-foreground">{quote.author}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default MotivationalQuote;
