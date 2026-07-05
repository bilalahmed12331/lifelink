import React, { useEffect, useState } from 'react';
import { Droplet } from 'lucide-react';

const Splash = ({ onComplete }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-dark flex items-center justify-center z-50">
      <div className={`text-center transition-all duration-1000 ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <div className="relative">
          <Droplet className="h-32 w-32 text-primary mx-auto animate-pulse-slow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">LL</span>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mt-6 animate-slide-up">LifeLink</h1>
        <p className="text-white/80 mt-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          AI-Powered Blood Donation System
        </p>
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="w-48 h-1 bg-white/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
