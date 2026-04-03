import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/utils/notifications';

const DISMISSED_KEY = 'habex-notif-prompt-dismissed';

export const NotificationPrompt: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;
    if (getNotificationPermission() !== 'default') return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // Show after a 5-second delay
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    await requestNotificationPermission();
    setShow(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[60] bg-card border border-border rounded-2xl shadow-2xl p-4"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground">Enable Notifications</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Get habit reminders and budget alerts to stay on track.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleAllow} className="text-xs h-8">
                  Allow
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs h-8">
                  Not now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
