import React, { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';
import { OnboardingFlow } from './OnboardingFlow';
import PinLockScreen from './PinLockScreen';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PIN_ENABLED_KEY } from './PinSetup';

interface AppWrapperProps {
  children: React.ReactNode;
}

const ONBOARDING_KEY = 'habex-onboarding-complete';
const SPLASH_SHOWN_KEY = 'habex-splash-shown-session';
const PIN_UNLOCKED_KEY = 'habex-pin-unlocked-session';

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem(SPLASH_SHOWN_KEY);
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPinLock, setShowPinLock] = useState(false);
  const [pinChecked, setPinChecked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (showSplash) {
      sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    }
  }, [showSplash]);

  // Check if user has PIN enabled
  useEffect(() => {
    const checkPin = async () => {
      if (!user || authLoading || showSplash) return;
      
      // Already unlocked this session
      if (sessionStorage.getItem(PIN_UNLOCKED_KEY)) {
        setPinChecked(true);
        return;
      }

      // Quick check: does user have PIN enabled locally?
      if (!localStorage.getItem(PIN_ENABLED_KEY)) {
        setPinChecked(true);
        return;
      }

      // Verify in database
      try {
        const { data } = await supabase
          .from('user_pins')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setShowPinLock(true);
        }
      } catch {
        // If check fails, skip PIN
      }
      setPinChecked(true);
    };

    checkPin();
  }, [user, authLoading, showSplash]);

  const handlePinUnlock = () => {
    sessionStorage.setItem(PIN_UNLOCKED_KEY, 'true');
    setShowPinLock(false);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    
    if (user && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    } else {
      setIsReady(true);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    setIsReady(true);
  };

  useEffect(() => {
    if (!showSplash && !authLoading) {
      if (user && !localStorage.getItem(ONBOARDING_KEY)) {
        setShowOnboarding(true);
      } else {
        setIsReady(true);
      }
    }
  }, [user, authLoading, showSplash]);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show PIN lock screen if PIN is set and not yet unlocked
  if (user && pinChecked && showPinLock) {
    return <PinLockScreen onUnlock={handlePinUnlock} />;
  }

  if (showOnboarding && user) {
    return (
      <>
        {children}
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return <>{children}</>;
};