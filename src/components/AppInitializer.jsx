import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Heart, Star, Award } from 'lucide-react';

const AppInitializer = ({ children }) => {
  const { isLoading } = useAuth();
  const [initComplete, setInitComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;

    if (isLoading) {
      // Simulate progress up to 90% while loading
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 5;
          return Math.min(prev + increment, 90);
        });
      }, 200);
    } else {
      // Complete progress when loading finishes
      setTimeout(() => setProgress(100), 0);
      if (interval) clearInterval(interval);

      // Delay completion to allow 100% animation to show
      const timeout = setTimeout(() => {
        setInitComplete(true);
      }, 800);

      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Show loader until initialization is complete
  if (!initComplete || isLoading) {
    return (
      <div className="fixed inset-0 bg-maroon flex items-center justify-center z-50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 animate-float">
            <Sparkles className="h-8 w-8 text-white/20" />
          </div>
          <div className="absolute top-40 right-32 animate-float stagger-2">
            <Heart className="h-6 w-6 text-white/20" />
          </div>
          <div className="absolute bottom-32 left-32 animate-float stagger-3">
            <Star className="h-7 w-7 text-white/20" />
          </div>
          <div className="absolute bottom-20 right-20 animate-float stagger-4">
            <Award className="h-5 w-5 text-white/20" />
          </div>
        </div>

        <div className="text-center relative z-10">
          {/* Animated Logo */}
          <div className="mb-12">
            <div className="text-7xl md:text-8xl font-bold text-white mb-6 animate-fade-in-up">
              RongRani
            </div>
            <div className="relative">
              <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-gold rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-white/90 text-xl font-medium mb-8 animate-fade-in-up stagger-1">
            Crafting your experience...
          </div>

          {/* Progress Bar */}
          <div className="w-80 max-w-sm mx-auto mb-6">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-white/70 text-sm mt-2">{Math.round(progress)}%</div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-3 animate-fade-in-up stagger-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>

          {/* Inspirational text */}
          <div className="mt-8 text-white/60 text-sm animate-fade-in-up stagger-3">
            "Where tradition meets craftsmanship"
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AppInitializer;