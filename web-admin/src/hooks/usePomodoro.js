import { useState, useEffect, useRef } from 'react';

const PRESETS = {
  focus: { label: 'Fokus Belajar', minutes: 25 },
  shortBreak: { label: 'Istirahat Singkat', minutes: 5 },
  longBreak: { label: 'Istirahat Panjang', minutes: 15 },
};

export function usePomodoro(onSessionComplete, onTaskStart) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(PRESETS.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [soundscape, setSoundscape] = useState('none'); // 'none' | 'rain' | 'whitenoise' | 'cafe'
  const [volume, setVolume] = useState(0.4);

  // Audio Context Ref for synthetic noise generation (no CORS, works 100% offline)
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseSourceRef = useRef(null);

  // Timer Tick Interval
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, selectedTaskId]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playChime();

    if (mode === 'focus') {
      const sessionData = {
        id: 'sess_' + Date.now(),
        date: new Date().toISOString(),
        durationMinutes: PRESETS.focus.minutes,
        taskId: selectedTaskId || null,
        mode: 'focus',
      };
      if (onSessionComplete) {
        onSessionComplete(sessionData);
      }
    }
  };

  // Play notification chime via Web Audio API
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio chime unsupported:', e);
    }
  };

  // Ambient Soundscapes using Web Audio Synthesizer (Rain, White Noise, Soft Hum)
  useEffect(() => {
    if (soundscape === 'none' || !isRunning) {
      stopSoundscape();
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous noise source if any
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      }

      // Create white noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (soundscape === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else if (soundscape === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gainNodeRef.current = gain;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseSourceRef.current = whiteNoise;
    } catch (err) {
      console.warn('Web Audio Ambient error:', err);
    }

    return () => stopSoundscape();
  }, [soundscape, isRunning]);

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume * 0.15, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const stopSoundscape = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch (e) {}
      noiseSourceRef.current = null;
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(PRESETS[newMode].minutes * 60);
  };

  const toggleTimer = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (nextRunning && mode === 'focus' && selectedTaskId && onTaskStart) {
      onTaskStart(selectedTaskId);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(PRESETS[mode].minutes * 60);
  };

  return {
    mode,
    timeLeft,
    isRunning,
    selectedTaskId,
    setSelectedTaskId,
    soundscape,
    setSoundscape,
    volume,
    setVolume,
    switchMode,
    toggleTimer,
    resetTimer,
    PRESETS,
  };
}
