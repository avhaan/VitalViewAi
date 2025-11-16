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
    <div className="relative w-full h-full bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F0F9FF] rounded-2xl overflow-hidden shadow-lg">
      {/* Mood Bubble */}
      <AnimatePresence>
        {showMoodBubble && moodText && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-xl border-2 border-[#0B7BD6]/50">
              <p className="text-sm font-semibold text-[#0B7BD6]">{moodText}</p>
            </div>
            {/* Bubble tail */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white/95" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated heartbeat icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-3 right-3 text-2xl z-10 drop-shadow-lg"
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
          {/* Professional Studio Lighting Setup */}
          <ambientLight intensity={0.5} />
          
          {/* Key light - main soft warm from top-front */}
          <directionalLight
            position={[2, 4, 3]}
            intensity={1.5}
            color="#FFFEF0"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={15}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={3}
            shadow-camera-bottom={-3}
          />
          
          {/* Fill light - front-right */}
          <directionalLight
            position={[3, 1, 4]}
            intensity={0.7}
            color="#F0F8FF"
          />
          
          {/* Rim/back light - creates separation from background */}
          <directionalLight
            position={[-3, 2, -2]}
            intensity={0.6}
            color="#FFE4B5"
          />
          
          {/* Subtle bottom light - softens shadows */}
          <pointLight
            position={[0, -2, 2]}
            intensity={0.3}
            color="#E0F2FE"
          />

          {/* Camera - optimal viewing angle */}
          <PerspectiveCamera
            makeDefault
            position={[0, 0.8, 4.2]}
            fov={40}
          />

          {/* High quality environment for reflections */}
          <Environment preset="city" environmentIntensity={0.3} />

          {/* Dr. Chick 3D Model */}
          <DrChick3D animationState={animationState} />

          {/* Smooth Orbit Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3.5}
            maxPolarAngle={Math.PI / 2.2}
            minAzimuthAngle={-Math.PI / 5}
            maxAzimuthAngle={Math.PI / 5}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.5}
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
