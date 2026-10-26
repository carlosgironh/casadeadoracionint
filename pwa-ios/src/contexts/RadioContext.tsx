import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const RADIO_STREAM_URL = 'https://studio20.radiolize.com/radio/8050/radio.mp3';

interface RadioContextType {
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  setVolume: (vol: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.src = RADIO_STREAM_URL;
    audio.preload = 'none';
    audioRef.current = audio;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setupMediaSession();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const handleError = (e: any) => {
      console.warn('Error en streaming de audio:', e);
      setIsBuffering(false);
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  const setupMediaSession = () => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Radio Casa de Adoración',
        artist: 'Transmisión En Vivo',
        album: 'Casa de Adoración Int',
        artwork: [
          { src: '/ios/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/ios/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => play());
      navigator.mediaSession.setActionHandler('pause', () => pause());
    }
  };

  const play = () => {
    if (audioRef.current) {
      setIsBuffering(true);
      audioRef.current.play().catch((err) => {
        console.warn('Playback prevented:', err);
        setIsBuffering(false);
        setIsPlaying(false);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  return (
    <RadioContext.Provider value={{ isPlaying, isBuffering, volume, setVolume, togglePlay, play, pause }}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio debe ser usado dentro de RadioProvider');
  }
  return context;
}
