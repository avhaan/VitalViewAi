'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import Spline to avoid SSR issues
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse text-4xl">🐥</div>
    </div>
  ),
});

interface DoctorChickAssistantProps {
  animationState: 'idle' | 'thinking' | 'talking' | 'happy' | 'concerned' | 'alert' | 'bounce';
  healthMetric?: {
    title: string;
    value: string;
    status: 'normal' | 'warning' | 'critical';
    description?: string;
  };
}

export default function DoctorChickAssistant({ 
  animationState, 
  healthMetric 
}: DoctorChickAssistantProps) {
  const splineRef = useRef<any>(null);
  const [showMetric, setShowMetric] = useState(false);

  useEffect(() => {
    if (healthMetric) {
      setShowMetric(true);
      const timer = setTimeout(() => setShowMetric(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [healthMetric]);

  // Map animation states to Spline events (you'll configure these in Spline)
  useEffect(() => {
    if (splineRef.current) {
      try {
        // Trigger animation based on state
        switch (animationState) {
          case 'thinking':
            splineRef.current.emitEvent('mouseDown', 'Thinking');
            break;
          case 'talking':
            splineRef.current.emitEvent('mouseDown', 'Talking');
            break;
          case 'happy':
            splineRef.current.emitEvent('mouseDown', 'Happy');
            break;
          case 'concerned':
            splineRef.current.emitEvent('mouseDown', 'Concerned');
            break;
          case 'alert':
            splineRef.current.emitEvent('mouseDown', 'Alert');
            break;
          case 'bounce':
            splineRef.current.emitEvent('mouseDown', 'Bounce');
            break;
          default:
            splineRef.current.emitEvent('mouseDown', 'Idle');
        }
      } catch (error) {
        console.log('Spline animation trigger failed:', error);
      }
    }
  }, [animationState]);

  function onLoad(spline: any) {
    splineRef.current = spline;
  }

  const getMetricColor = () => {
    if (!healthMetric) return 'from-teal-500 to-cyan-500';
    switch (healthMetric.status) {
      case 'normal':
        return 'from-green-500 to-emerald-500';
      case 'warning':
        return 'from-yellow-500 to-orange-500';
      case 'critical':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-teal-500 to-cyan-500';
    }
  };

  const getMetricIcon = () => {
    if (!healthMetric) return '📊';
    switch (healthMetric.status) {
      case 'normal':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
      default:
        return '📊';
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Doctor Chick 3D Model */}
      <div className="w-full h-full bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl overflow-hidden">
        {/* Fallback cute chick emoji if Spline URL not provided */}
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            animate={{
              y: animationState === 'bounce' ? [-10, 0, -10] : 
                 animationState === 'thinking' ? [-3, 3, -3] : 0,
              rotate: animationState === 'alert' ? [-5, 5, -5, 5, 0] : 0,
            }}
            transition={{
              duration: animationState === 'bounce' ? 0.5 : 
                       animationState === 'thinking' ? 2 : 
                       animationState === 'alert' ? 0.5 : 0,
              repeat: animationState === 'thinking' ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            {/* Cute Doctor Chick Illustration */}
            <div className="relative text-[120px] leading-none">
              🐥
              {/* White Coat - Behind the chick */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[100px] -z-10 opacity-90">🥼</div>
              {/* Stethoscope - Around neck */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 text-5xl">🩺</div>
              
              {/* Expression overlay based on state */}
              {animationState === 'happy' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-8 -right-8 text-4xl"
                >
                  ✨
                </motion.div>
              )}
              {animationState === 'concerned' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-8 -right-8 text-3xl"
                >
                  😟
                </motion.div>
              )}
              {animationState === 'alert' && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute -top-8 -right-8 text-4xl"
                >
                  🚨
                </motion.div>
              )}
            </div>

            {/* Speech bubble for thinking */}
            {animationState === 'thinking' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg"
              >
                <div className="flex gap-1">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-[#0B7BD6] rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-[#0B7BD6] rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-[#0B7BD6] rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Uncomment this when you have your Spline scene URL */}
        {/* <Spline
          scene="YOUR_SPLINE_SCENE_URL_HERE"
          onLoad={onLoad}
        /> */}
      </div>

      {/* Floating Health Metric Card */}
      <AnimatePresence>
        {showMetric && healthMetric && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-48"
          >
            <div className={`bg-gradient-to-br ${getMetricColor()} p-4 rounded-2xl shadow-2xl text-white`}>
              <div className="text-3xl mb-2">{getMetricIcon()}</div>
              <div className="text-sm font-semibold mb-1">{healthMetric.title}</div>
              <div className="text-2xl font-bold mb-2">{healthMetric.value}</div>
              {healthMetric.description && (
                <div className="text-xs opacity-90">{healthMetric.description}</div>
              )}
            </div>
            {/* Pointer arrow */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-current ${
              healthMetric.status === 'normal' ? 'text-green-500' :
              healthMetric.status === 'warning' ? 'text-yellow-500' :
              'text-red-500'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
