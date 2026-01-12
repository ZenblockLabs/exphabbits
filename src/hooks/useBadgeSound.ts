import { useCallback } from 'react';

export const BADGE_SOUND_ENABLED_KEY = 'habex-badge-sound-enabled';

export const useBadgeSound = () => {
  const isSoundEnabled = (): boolean => {
    const saved = localStorage.getItem(BADGE_SOUND_ENABLED_KEY);
    return saved !== 'false'; // Default to true
  };

  const setSoundEnabled = (enabled: boolean) => {
    localStorage.setItem(BADGE_SOUND_ENABLED_KEY, String(enabled));
    window.dispatchEvent(new Event('storage'));
  };

  const playBadgeUnlockSound = useCallback(() => {
    if (!isSoundEnabled()) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Celebratory fanfare sound
    const playTone = (frequency: number, duration: number, delay: number, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      const startTime = audioContext.currentTime + delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Triumphant achievement sound (ascending notes)
    playTone(523.25, 0.15, 0, 'triangle');      // C5
    playTone(659.25, 0.15, 0.1, 'triangle');    // E5
    playTone(783.99, 0.15, 0.2, 'triangle');    // G5
    playTone(1046.50, 0.25, 0.3, 'triangle');   // C6
    playTone(1318.51, 0.35, 0.4, 'sine');       // E6 (high, sustained)
  }, []);

  return { 
    playBadgeUnlockSound, 
    isSoundEnabled, 
    setSoundEnabled 
  };
};
