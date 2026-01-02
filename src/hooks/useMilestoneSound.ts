import { useCallback } from 'react';

// Web Audio API sound generator for milestone celebrations
export const useMilestoneSound = () => {
  const playMilestoneSound = useCallback((milestone: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Different sounds for different milestones
    const playTone = (frequency: number, duration: number, delay: number, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      const startTime = audioContext.currentTime + delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    if (milestone >= 100) {
      // Epic fanfare for 100+ days
      playTone(523.25, 0.3, 0, 'square');      // C5
      playTone(659.25, 0.3, 0.15, 'square');   // E5
      playTone(783.99, 0.3, 0.3, 'square');    // G5
      playTone(1046.50, 0.5, 0.45, 'square');  // C6
      playTone(1318.51, 0.6, 0.6, 'sine');     // E6 (high)
    } else if (milestone >= 30) {
      // Triumphant sound for 30+ days
      playTone(440, 0.2, 0);       // A4
      playTone(554.37, 0.2, 0.1);  // C#5
      playTone(659.25, 0.3, 0.2);  // E5
      playTone(880, 0.4, 0.35);    // A5
    } else if (milestone >= 7) {
      // Achievement sound for 7+ days
      playTone(392, 0.15, 0);      // G4
      playTone(523.25, 0.15, 0.1); // C5
      playTone(659.25, 0.25, 0.2); // E5
    }
  }, []);

  return { playMilestoneSound };
};
