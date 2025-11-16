'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import DrChick3D from './DrChick3D';
import { motion, AnimatePresence } from 'framer-motion';

interface DrChick3DCanvasProps {
  animationState: 'idle' | 'wave' | 'listen' | 'responding';
  showMoodBubble?: boolean;
  moodText?: string;
}

export default function DrChick3DCanvas({ 
  animationState, 
  showMoodBubble = false,
  moodText = ''
}: DrChick3DCanvasProps) {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch (e) {
      setWebGLSupported(false);
    }

    // Show loaded after mount
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  if (!webGLSupported) {
    // Fallback to emoji if WebGL not supported
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
        <div className="text-center">
          <div className="text-8xl mb-4">🐥</div>
          <p className="text-sm text-gray-600">Dr. Chick</p>
          <p className="text-xs text-gray-400">3D not supported</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#F0F9FF] via-[#E0F2FE] to-white rounded-2xl overflow-hidden shadow-inner">
      {/* Mood Bubble */}
      <AnimatePresence>
        {showMoodBubble && moodText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-white px-4 py-2 rounded-full shadow-lg border-2 border-[#0B7BD6]">
              <p className="text-sm font-medium text-[#0B7BD6]">{moodText}</p>
            </div>
            {/* Bubble tail */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heartbeat icon */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 right-4 text-2xl z-10"
      >
        💗
      </motion.div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Lighting Setup - Soft and glossy for cute chick */}
          <ambientLight intensity={0.7} />
          
          {/* Main light - soft warm from above */}
          <directionalLight
            position={[3, 5, 4]}
            intensity={1.2}
            color="#FFFACD"
            castShadow
          />
          
          {/* Fill light - front */}
          <directionalLight
            position={[0, 0, 5]}
            intensity={0.6}
            color="#FFFFFF"
          />
          
          {/* Rim light - subtle back highlight */}
          <directionalLight
            position={[-2, 2, -3]}
            intensity={0.3}
            color="#FFE4B5"
          />

          {/* Camera */}
          <PerspectiveCamera
            makeDefault
            position={[0, 0.5, 4.5]}
            fov={45}
          />

          {/* Environment for reflections */}
          <Environment preset="sunset" />

          {/* Dr. Chick 3D Model */}
          <DrChick3D animationState={animationState} />

          {/* Orbit Controls - Limited for subtle interaction */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 6}
            maxAzimuthAngle={Math.PI / 6}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-2"
            >
              🐥
            </motion.div>
            <p className="text-sm text-gray-600">Loading Dr. Chick...</p>
          </div>
        </div>
      )}

      {/* Subtle glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none rounded-2xl" />
    </div>
  );
}
