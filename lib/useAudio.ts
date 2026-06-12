import { useCallback, useRef, useEffect } from 'react';

export type AudioType = 'success' | 'click' | 'error' | 'celebration';

// Audio file paths (Agent 10 will generate/place these in public/assets/)
const audioMap: Record<AudioType, string> = {
  success: '/assets/sounds/success.mp3',
  click: '/assets/sounds/click.mp3',
  error: '/assets/sounds/error.mp3',
  celebration: '/assets/sounds/celebration.mp3',
};

export const useAudio = () => {
  const audioCache = useRef<Partial<Record<AudioType, HTMLAudioElement>>>({});

  // Preload sounds on mount for zero-latency playback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Object.entries(audioMap).forEach(([key, src]) => {
        const type = key as AudioType;
        const audio = new Audio(src);
        audio.preload = 'auto';
        audioCache.current[type] = audio;
      });
    }
  }, []);

  const playSound = useCallback((type: AudioType) => {
    try {
      const audio = audioCache.current[type];
      if (audio) {
        // Reset playback position so sound can play rapidly in succession
        audio.currentTime = 0;
        audio.play().catch((err) => {
          console.warn(`Failed to play audio ${type}:`, err);
        });
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }, []);

  return { playSound };
};
