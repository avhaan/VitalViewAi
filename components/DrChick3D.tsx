'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cone, Torus, Box, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface DrChick3DProps {
  animationState: 'idle' | 'wave' | 'listen' | 'responding';
}

export default function DrChick3D({ animationState }: DrChick3DProps) {
  const chickGroup = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const stethoscopeRef = useRef<THREE.Group>(null);
  const eyeBlinkRef = useRef<number>(0);

  // Idle bobbing animation
  useFrame((state) => {
    if (!chickGroup.current || !bodyRef.current || !headRef.current) return;

    const time = state.clock.getElapsedTime();

    switch (animationState) {
      case 'idle':
        // Gentle bobbing
        chickGroup.current.position.y = Math.sin(time * 1.5) * 0.1;
        chickGroup.current.rotation.y = Math.sin(time * 0.5) * 0.05;
        
        // Blinking
        eyeBlinkRef.current = Math.sin(time * 3) > 0.95 ? 0.2 : 1;
        break;

      case 'wave':
        // Wave animation
        if (leftWingRef.current) {
          leftWingRef.current.rotation.z = Math.sin(time * 8) * 0.5 - 0.3;
        }
        chickGroup.current.position.y = Math.sin(time * 2) * 0.15;
        headRef.current.rotation.z = Math.sin(time * 4) * 0.1;
        break;

      case 'listen':
        // Lean forward slightly
        chickGroup.current.rotation.x = Math.sin(time * 3) * 0.1 + 0.1;
        headRef.current.rotation.y = Math.sin(time * 2) * 0.15;
        break;

      case 'responding':
        // Thinking mode - soft rotation + glow
        chickGroup.current.rotation.y = Math.sin(time * 1) * 0.2;
        chickGroup.current.position.y = Math.sin(time * 2) * 0.12;
        headRef.current.rotation.x = Math.sin(time * 1.5) * 0.08;
        break;
    }
  });

  return (
    <group ref={chickGroup} position={[0, 0, 0]}>
      {/* Main Body - Single round sphere (cute chick style) */}
      <Sphere ref={bodyRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#FFDB58" 
          roughness={0.2}
          metalness={0.05}
          emissive="#FFDB58"
          emissiveIntensity={0.1}
        />
      </Sphere>

      {/* Top tuft/hair */}
      <Sphere args={[0.25, 32, 32]} position={[0, 1.3, 0]}>
        <meshStandardMaterial 
          color="#FFDB58" 
          roughness={0.2}
          metalness={0.05}
        />
      </Sphere>

      {/* Eyes - Simple black dots */}
      <group ref={headRef} position={[0, 0.4, 1]}>
        {/* Left Eye */}
        <Sphere args={[0.12, 16, 16]} position={[-0.25, 0, 0]} scale={[1, eyeBlinkRef.current, 1]}>
          <meshStandardMaterial color="#2C1810" />
        </Sphere>
        {/* Right Eye */}
        <Sphere args={[0.12, 16, 16]} position={[0.25, 0, 0]} scale={[1, eyeBlinkRef.current, 1]}>
          <meshStandardMaterial color="#2C1810" />
        </Sphere>
      </group>

      {/* Beak - Simple orange circle/bump */}
      <Sphere args={[0.1, 16, 16]} position={[0, 0.15, 1.15]} scale={[1, 0.8, 0.8]}>
        <meshStandardMaterial color="#FF6347" />
      </Sphere>

      {/* Blush - Pink circles on cheeks */}
      <Sphere args={[0.25, 16, 16]} position={[-0.75, 0.2, 0.75]}>
        <meshStandardMaterial 
          color="#FFB6D9" 
          transparent 
          opacity={0.8}
          roughness={0.9}
        />
      </Sphere>
      <Sphere args={[0.25, 16, 16]} position={[0.75, 0.2, 0.75]}>
        <meshStandardMaterial 
          color="#FFB6D9" 
          transparent 
          opacity={0.8}
          roughness={0.9}
        />
      </Sphere>

      {/* Wings - Rounded nubs on sides */}
      <group ref={leftWingRef} position={[-1, -0.2, 0]}>
        <Sphere args={[0.35, 24, 24]} scale={[0.8, 1, 0.6]}>
          <meshStandardMaterial 
            color="#FFDB58" 
            roughness={0.2}
            metalness={0.05}
          />
        </Sphere>
      </group>
      <group ref={rightWingRef} position={[1, -0.2, 0]}>
        <Sphere args={[0.35, 24, 24]} scale={[0.8, 1, 0.6]}>
          <meshStandardMaterial 
            color="#FFDB58" 
            roughness={0.2}
            metalness={0.05}
          />
        </Sphere>
      </group>

      {/* Feet - Orange rounded feet at bottom */}
      <Sphere args={[0.2, 16, 16]} position={[-0.35, -1.1, 0.3]} scale={[1.2, 0.6, 1]}>
        <meshStandardMaterial color="#FF6B35" />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[0.35, -1.1, 0.3]} scale={[1.2, 0.6, 1]}>
        <meshStandardMaterial color="#FF6B35" />
      </Sphere>

      {/* Subtle stethoscope - Much smaller and less prominent */}
      <group ref={stethoscopeRef} position={[0, 0.2, 1]} scale={0.5}>
        <Torus args={[0.25, 0.02, 12, 24]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#404040" roughness={0.6} />
        </Torus>
        <Sphere args={[0.08, 12, 12]} position={[0, -0.4, 0]}>
          <meshStandardMaterial color="#C0C0C0" metalness={0.6} roughness={0.3} />
        </Sphere>
      </group>

      {/* Glow effect when responding */}
      {animationState === 'responding' && (
        <pointLight
          position={[0, 0, 2]}
          intensity={0.8}
          distance={4}
          color="#0B7BD6"
        />
      )}
    </group>
  );
}
