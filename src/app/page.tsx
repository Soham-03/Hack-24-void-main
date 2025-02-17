'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Play, Pause, Volume2 } from 'lucide-react';
import { Ripple } from "@/components/magicui/ripple";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownUnitProps {
  value: number;
  prevValue: number;
  label: string;
}

const UnplugLanding: React.FC = () => {
  const [currentPhrase, setCurrentPhrase] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasAttemptedAutoplay = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const audioUrl = "/music.mp3";
  const acceptanceLetterUrl = "/gg.pdf"

  const images = [
    {
      src: '/alibaug_fort.jpg',
      alt: 'Historic Fort',
      caption: 'historic vibes',
      theme: 'from-amber-500/20'
    },
    {
      src: '/beach.jpg',
      alt: 'Beach View',
      caption: 'your workspace view',
      theme: 'from-blue-500/20'
    },
    {
      src: '/venue.jpg',
      alt: 'Camping Area',
      caption: 'your stay awaits',
      theme: 'from-green-500/20'
    },
    {
      src: '/bonfire.jpg',
      alt: 'Beach Bonfire',
      caption: 'evening connections',
      theme: 'from-orange-500/20'
    }
  ];

  const phrases = [
    "tick tock, time's precious.",
    "your spot won't wait forever.",
    "the beach is calling your name.",
    "this could be your moment.",
    "don't let this wave pass you by.",
    "your unplug journey awaits.",
    "make the leap, join the adventure."
  ];

  // Improved Countdown Calculation
  const calculateTimeLeft = useCallback(() => {
    const targetDate = new Date('2025-02-20T11:00:00+05:30'); // Specific event date and time
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Only update if values have changed to prevent unnecessary re-renders
      setTimeLeft(prevTime => {
        if (
          prevTime.days !== days ||
          prevTime.hours !== hours ||
          prevTime.minutes !== minutes ||
          prevTime.seconds !== seconds
        ) {
          setPrevTimeLeft(prevTime);
          return { days, hours, minutes, seconds };
        }
        return prevTime;
      });
    } else {
      // Countdown finished
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  const attemptAutoplay = useCallback(async () => {
    // await audioRef.current?.play
    if (audioRef.current) {
      try {
        // Check if audio is paused and not already playing
        if (audioRef.current.paused) {
          audioRef.current.volume = volume;
          await audioRef.current.play();
          setIsPlaying(true);
          localStorage.setItem('audioPlayState', 'playing');
        }
      } catch (error) {
        console.log('Autoplay prevented:', error);
        setIsPlaying(false);
        localStorage.removeItem('audioPlayState');
      }
    }
  }, [volume]);

  // useEffect(() => {
  //   attemptAutoplay()
  //   if (isPlaying) {
  //     localStorage.setItem('audioPlayState', 'playing');
  //   } else {
  //     localStorage.removeItem('audioPlayState');
  //   }
  // }, [isPlaying]);

  // Effect for Countdown Timer
  useEffect(() => {
    // Initial calculation
    calculateTimeLeft();

    // Set up interval
    timerRef.current = setInterval(calculateTimeLeft, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [calculateTimeLeft]);

  // Effect for Autoplay
  useEffect(() => {
    // Attempt autoplay on mount
    attemptAutoplay()

    // Add interaction listeners to enable autoplay
    // const handleInteraction = () => {
    //   attemptAutoplay();
    //   // Remove listeners after first interaction
    //   document.removeEventListener('click', handleInteraction);
    //   document.removeEventListener('touchstart', handleInteraction);
    // };

    // document.addEventListener('click', handleInteraction);
    // document.addEventListener('touchstart', handleInteraction);

    // // Autoplay on page load with user interaction
    // const handlePageLoad = () => {
    //   attemptAutoplay();
    //   window.removeEventListener('load', handlePageLoad);
    // };

    // window.addEventListener('load', handlePageLoad);

    // return () => {
    //   document.removeEventListener('click', handleInteraction);
    //   document.removeEventListener('touchstart', handleInteraction);
    //   window.removeEventListener('load', handlePageLoad);
    // };
  }, [attemptAutoplay]);



  // Remaining component implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const animateValue = target.getAttribute('data-animate');
          if (entry.isIntersecting && animateValue) {
            setIsVisible(prev => ({
              ...prev,
              [animateValue]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((element) => observer.observe(element));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(acceptanceLetterUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "unplug_acceptance_letter.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Enhanced CountdownUnit component
  const CountdownUnit: React.FC<CountdownUnitProps> = ({ value, prevValue, label }) => {
    const hasChanged = value !== prevValue;

    return (
      <div className="group relative overflow-hidden flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center 
        text-4xl md:text-7xl font-bold mb-1 md:mb-2 
        bg-gray-800 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
          <span
            className={`block text-blue-400 ${hasChanged ? 'animate-slide-up' : ''
              }`}
          >
            {value.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="text-xs md:text-lg text-gray-500 uppercase tracking-widest 
        group-hover:text-blue-400 transition-colors duration-300">
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-full h-full">
            <Ripple />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-8 py-16 space-y-24">
        {/* Welcome Section */}
        <div
          data-animate="header"
          className="space-y-6 text-center"
        >
          <div className="space-y-2">
            <p className="text-2xl text-gray-400 animate-fade-in">hello</p>
            <h1 className="text-7xl font-light tracking-tight animate-slide-up">
              Beach, please! You're in.
            </h1>
          </div>
          <div className="pt-4 space-y-2">
            <h2 className="text-5xl font-['BeachFont'] tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              UNPLUG
            </h2>
            <p className="text-2xl text-gray-400">by the beach</p>
          </div>
        </div>

        {/* Image Grid */}
        <div
          data-animate="images"
          className="grid grid-cols-2 gap-6"
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] group overflow-hidden rounded-lg"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${image.theme} to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300`} />
              <p className="absolute bottom-4 left-4 text-sm font-light tracking-wider text-white/90 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {image.caption}
              </p>
            </div>
          ))}
        </div>

        {/* Music Player */}
        <div
          data-animate="music"
          className="text-center space-y-4"
        >
          <p className="text-xl text-gray-400">while you're here...</p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <p className="text-lg text-gray-400">vibes for your acceptance letter</p>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-6 h-6 text-gray-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          <audio
            ref={audioRef}
            loop
            src={audioUrl}
            onError={(e) => console.error("Audio loading error:", e)}
          />
        </div>

        {/* Acceptance Letter Button */}
        <div
          data-animate="letter"
          className="text-center space-y-6"
        >
          <p className="text-2xl text-gray-400">first things first,</p>
          <button
            onClick={handleDownload}
            className="group relative px-12 py-6 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 hover:from-blue-500/30 hover:via-purple-500/30 hover:to-blue-500/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center space-x-4 text-2xl">
              <span className="font-light tracking-wide group-hover:text-blue-400 transition-colors duration-300">
                your acceptance letter
              </span>
              <Download className="w-6 h-6 group-hover:-translate-y-1 group-hover:text-blue-400 transition-all duration-300" />
            </span>
          </button>
        </div>

        {/* Rotating Phrases */}
        <div
          data-animate="phrase"
          className="h-24 flex items-center justify-center overflow-hidden"
        >
          <p className="text-xl sm:text-2xl md:text-3xl text-center text-gray-400 tracking-wide transition-all duration-500">
            {phrases[currentPhrase]}
          </p>
        </div>

        {/* Countdown */}
        <div
          data-animate="countdown"
          className="relative space-y-6 md:space-y-12 transform-gpu"
        >
          <p className="text-2xl md:text-4xl text-center tracking-wide bg-clip-text text-transparent 
  bg-gradient-to-r from-white to-blue-400">
            confirm your spot in
          </p>

          <div className="grid grid-cols-4 gap-2 md:gap-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 
    blur-3xl opacity-50 -z-10" />
            <CountdownUnit value={timeLeft.days} prevValue={prevTimeLeft.days} label="days" />
            <CountdownUnit value={timeLeft.hours} prevValue={prevTimeLeft.hours} label="hours" />
            <CountdownUnit value={timeLeft.minutes} prevValue={prevTimeLeft.minutes} label="minutes" />
            <CountdownUnit value={timeLeft.seconds} prevValue={prevTimeLeft.seconds} label="seconds" />
          </div>

          {/* New Payment Confirmation Message */}
          <div className="text-center mt-4">
            <p className="text-xl text-gray-400 animate-pulse">
              Payment confirmation opens after the countdown ends
            </p>
          </div>
        </div>

        {/* Footer */}
        {/* Footer */}
        {/* Footer */}
        {/* Footer */}
        <div
          data-animate="footer"
          className="relative text-center space-y-6 pt-12 overflow-hidden w-full"
        >
          {/* Video Background */}
          

          {/* Footer Content - positioned relatively */}
          <div className="relative z-10 max-w-4xl mx-auto px-8">
            <p className="text-xl text-">
              that's all folks.
            </p>
            <p className="text-lg text-gray-500">
              see you at the beach.
            </p>
            <div className="space-y-4 pt-8">
              <p className="text-sm text-blue-500 tracking-widest">
                brought to you by
              </p>
              <p className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                GDSC CRCE
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnplugLanding;

// (I'll continue with the rest of the component in the next part)