'use client';

import { useCallback, useEffect, useState } from 'react';
import { Howl } from 'howler';
import { AgeRange } from './gameConfig';

export type SFXType = 'click' | 'success' | 'error' | 'celebration' | 'streak';

const sfxMap: Record<SFXType, string> = {
  click: '/assets/sounds/click.wav',
  success: '/assets/sounds/success.wav',
  error: '/assets/sounds/error.wav',
  celebration: '/assets/sounds/celebration.wav',
  streak: '/assets/sounds/streak.wav',
};

const musicMap: Record<AgeRange, string> = {
  'elementary': '/assets/sounds/music_elementary.wav',
  'middle-school-lower': '/assets/sounds/music_middle_school.wav',
  'middle-school-upper': '/assets/sounds/music_middle_school.wav',
  'high-school': '/assets/sounds/music_high_school.wav',
  'university': '/assets/sounds/music_university.wav',
};

// Module-level persistent state for singleton audio playback across page navigation
let activeMusicHowl: Howl | null = null;
let activeMusicKey: string | null = null;
let musicMutedGlobal = false;
let sfxMutedGlobal = false;
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((l) => l());
};

// Initialize settings from localStorage (client-side only)
if (typeof window !== 'undefined') {
  musicMutedGlobal = localStorage.getItem('mak_music_muted') === 'true';
  sfxMutedGlobal = localStorage.getItem('mak_sfx_muted') === 'true';
}

export const useAudio = () => {
  const [musicMuted, setMusicMuted] = useState(musicMutedGlobal);
  const [sfxMuted, setSfxMuted] = useState(sfxMutedGlobal);

  useEffect(() => {
    const onChange = () => {
      setMusicMuted(musicMutedGlobal);
      setSfxMuted(sfxMutedGlobal);
    };
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const toggleMusic = useCallback(() => {
    musicMutedGlobal = !musicMutedGlobal;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mak_music_muted', String(musicMutedGlobal));
    }
    if (activeMusicHowl) {
      activeMusicHowl.mute(musicMutedGlobal);
    }
    notifyListeners();
  }, []);

  const toggleSFX = useCallback(() => {
    sfxMutedGlobal = !sfxMutedGlobal;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mak_sfx_muted', String(sfxMutedGlobal));
    }
    notifyListeners();
  }, []);

  const playSound = useCallback((type: SFXType, options?: { pitch?: number }) => {
    if (sfxMutedGlobal) return;
    try {
      const sound = new Howl({
        src: [sfxMap[type]],
        volume: type === 'click' ? 0.3 : type === 'error' ? 0.4 : 0.5,
      });
      if (options?.pitch) {
        sound.rate(options.pitch);
      }
      sound.play();
    } catch (e) {
      console.warn(`Failed to play sound: ${type}`, e);
    }
  }, []);

  const playMusic = useCallback((ageRange: AgeRange) => {
    const src = musicMap[ageRange];
    if (!src) return;

    // If same music is already playing, do nothing
    if (activeMusicHowl && activeMusicKey === src) {
      // Ensure mute state matches global preference
      activeMusicHowl.mute(musicMutedGlobal);
      return;
    }

    try {
      // Stop and fade out current music
      if (activeMusicHowl) {
        const oldHowl = activeMusicHowl;
        oldHowl.fade(oldHowl.volume() as number, 0, 1000);
        setTimeout(() => oldHowl.stop(), 1000);
      }

      // Start new music
      const newHowl = new Howl({
        src: [src],
        loop: true,
        volume: 0.15,
        autoplay: true,
        mute: musicMutedGlobal,
      });

      newHowl.fade(0, 0.15, 1000);
      activeMusicHowl = newHowl;
      activeMusicKey = src;
    } catch (e) {
      console.warn(`Failed to play background music: ${src}`, e);
    }
  }, []);

  const stopMusic = useCallback(() => {
    if (activeMusicHowl) {
      activeMusicHowl.stop();
      activeMusicHowl = null;
      activeMusicKey = null;
    }
  }, []);

  return {
    playSound,
    playMusic,
    stopMusic,
    musicMuted,
    sfxMuted,
    toggleMusic,
    toggleSFX,
  };
};
