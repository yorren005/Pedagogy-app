import { useCallback, useState, useEffect } from 'react';

export const useTTS = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };

      // Load initial voices
      loadVoices();
      
      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = useCallback(
    (text: string, options?: { rate?: number; pitch?: number; voiceURI?: string; lang?: string }) => {
      if (!isSupported || typeof window === 'undefined') return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Default to slightly slower rate and higher pitch for a kid-friendly voice
      utterance.rate = options?.rate ?? 0.9;
      utterance.pitch = options?.pitch ?? 1.1;
      utterance.lang = options?.lang ?? 'en-US';

      if (options?.voiceURI) {
        const selectedVoice = voices.find((v) => v.voiceURI === options.voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Try to find a friendly default voice (e.g., Google US English or a generic female voice)
        const friendlyVoice = voices.find(
          (v) => v.name.includes('Google US English') || v.name.includes('Samantha') || (v.lang === 'en-US' && v.name.includes('Female'))
        );
        if (friendlyVoice) {
          utterance.voice = friendlyVoice;
        } else if (voices.length > 0) {
          // Fallback to the first available voice
          utterance.voice = voices[0];
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices]
  );

  const stop = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
};
