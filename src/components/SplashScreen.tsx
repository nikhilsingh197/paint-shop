import React, { useEffect, useState } from "react";
import { Zap, Palette, ShieldCheck, PaintBucket, Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 1800,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 400); // Wait for fade-out animation to complete
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#0b1d16] text-white select-none transition-opacity duration-400 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at 50% 35%, #133a2b 0%, #0b1d16 65%, #06110d 100%)",
      }}
    >
      {/* Skip button in top corner */}
      <div className="w-full max-w-lg flex justify-end p-5 pt-8">
        <button
          onClick={handleSkip}
          className="text-[11px] font-bold tracking-wider uppercase text-emerald-300/70 hover:text-emerald-200 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors backdrop-blur-sm cursor-pointer"
        >
          Skip ✕
        </button>
      </div>

      {/* Center Branding Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          {/* Ambient Glow */}
          <div className="absolute -inset-4 rounded-3xl bg-emerald-400/20 blur-xl animate-pulse" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 p-0.5 shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center justify-center">
            <div className="w-full h-full bg-[#0d241c] rounded-[22px] flex items-center justify-center relative overflow-hidden">
              {/* Decorative shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent -translate-x-full animate-[np-sheen_2.5s_infinite]" />
              
              <PaintBucket className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400 drop-shadow-[0_4px_12px_rgba(52,211,153,0.4)]" />
              
              {/* Dripping paint visual badge */}
              <div className="absolute bottom-2 right-2">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            Jamshedpur's Paint Express
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
            Nikhil <span className="text-emerald-400">Paints</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-emerald-100/70 font-medium max-w-xs">
            Fresh Walls. Zero Waiting. 7,000+ Shades.
          </p>
        </div>

        {/* Quick Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7 max-w-sm">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] text-white/80 backdrop-blur-sm">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>35-min Express Delivery</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] text-white/80 backdrop-blur-sm">
            <Palette className="w-3 h-3 text-rose-400" />
            <span>Computerized Tinting</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] text-white/80 backdrop-blur-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>100% Genuine Brands</span>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full max-w-xs px-6 pb-12 flex flex-col items-center">
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(52,211,153,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between w-full mt-2 text-[10px] font-semibold text-emerald-300/60">
          <span>Loading catalog & shades</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
