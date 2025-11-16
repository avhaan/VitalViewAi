'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface DrChick3DProps {
  animationState: 'idle' | 'wave' | 'listen' | 'responding';
}

export default function DrChick3D({ animationState }: DrChick3DProps) {
  const chickGroup = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const beakTopRef = useRef<THREE.Mesh>(null);
  const beakBottomRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const stethoscopeRef = useRef<THREE.Group>(null);
  const animationTime = useRef<number>(0);
  const eyeBlinkTimer = useRef<number>(0);
  const isBlinking = useRef<boolean>(false);

  // Smooth animation system
  useFrame((state, delta) => {
    if (!chickGroup.current || !bodyRef.current || !headRef.current) return;

    animationTime.current += delta;
    const time = state.clock.getElapsedTime();

    // Random blinking
    eyeBlinkTimer.current += delta;
    if (eyeBlinkTimer.current > 3 + Math.random() * 2) {
      isBlinking.current = true;
      setTimeout(() => { isBlinking.current = false; }, 150);
      eyeBlinkTimer.current = 0;
    }

    // Eye blink animation
    const blinkTarget = isBlinking.current ? 0.15 : 1;
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, blinkTarget, 0.3);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkTarget, 0.3);
    }

    // Smooth animation transitions
    switch (animationState) {
      case 'idle':
        // Gentle breathing bobbing
        chickGroup.current.position.y = Math.sin(time * 1.2) * 0.08;
        chickGroup.current.rotation.y = Math.sin(time * 0.3) * 0.03;
        headRef.current.rotation.x = Math.sin(time * 0.8) * 0.02;
        
        // Subtle wing movement
        if (leftWingRef.current && rightWingRef.current) {
          leftWingRef.current.rotation.z = Math.sin(time * 1.5) * 0.05 - 0.15;
          rightWingRef.current.rotation.z = Math.sin(time * 1.5) * 0.05 + 0.15;
        }
        break;

      case 'wave':
        // Enthusiastic waving
        if (leftWingRef.current) {
          leftWingRef.current.rotation.z = Math.sin(time * 10) * 0.7 - 0.3;
          leftWingRef.current.rotation.y = Math.sin(time * 5) * 0.2;
        }
        chickGroup.current.position.y = Math.sin(time * 3) * 0.12 + 0.05;
        chickGroup.current.rotation.y = Math.sin(time * 2) * 0.08;
        headRef.current.rotation.z = Math.sin(time * 6) * 0.12;
        
        // Happy beak movement
        if (beakTopRef.current) {
          beakTopRef.current.rotation.x = Math.sin(time * 12) * 0.1;
        }
        break;

      case 'listen':
        // Attentive lean and head tilt
        chickGroup.current.rotation.x = THREE.MathUtils.lerp(chickGroup.current.rotation.x, 0.12, 0.05);
        headRef.current.rotation.y = Math.sin(time * 1.5) * 0.18;
        headRef.current.rotation.x = Math.sin(time * 2) * 0.05 + 0.05;
        chickGroup.current.position.y = Math.sin(time * 2) * 0.06;
        
        // Wiggle beak slightly (curious)
        if (beakTopRef.current) {
          beakTopRef.current.rotation.x = Math.sin(time * 3) * 0.03;
        }
        break;

      case 'responding':
        // Thinking mode - contemplative motion
        chickGroup.current.rotation.y = Math.sin(time * 0.8) * 0.25;
        chickGroup.current.position.y = Math.sin(time * 1.5) * 0.1 + 0.05;
        headRef.current.rotation.x = Math.sin(time * 1) * 0.1;
        headRef.current.rotation.z = Math.sin(time * 0.6) * 0.06;
        
        // Subtle wing flap (processing)
        if (leftWingRef.current && rightWingRef.current) {
          leftWingRef.current.rotation.z = Math.sin(time * 2) * 0.15 - 0.2;
          rightWingRef.current.rotation.z = Math.sin(time * 2) * 0.15 + 0.2;
        }
        break;
    }

    // Talking animation (beak movement)
    if (animationState === 'wave' || animationState === 'responding') {
      if (beakTopRef.current && beakBottomRef.current) {
        const talkCycle = Math.sin(time * 8);
        beakTopRef.current.rotation.x = talkCycle * 0.08;
        beakBottomRef.current.rotation.x = -talkCycle * 0.08;
      }
    }
  });

  // KAWAII color palette - soft and pastel
  const mainBodyColor = useMemo(() => new THREE.Color('#FFF4D6'), []); // Softer yellow
  const beakColor = useMemo(() => new THREE.Color('#FFB84D'), []); // Warm orange
  const feetColor = useMemo(() => new THREE.Color('#FFAA5C'), []); // Peachy orange

  return (
    <group ref={chickGroup} position={[0, 0.2, 0]} scale={0.9}>
      {/* Main Body - Soft matte kawaii style */}
      <Sphere ref={bodyRef} args={[1, 64, 64]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color={mainBodyColor}
          roughness={0.8}
          metalness={0}
          emissive={"#FFF8E1"}
          emissiveIntensity={0.05}
        />
      </Sphere>

      {/* Head group for better control */}
      <group ref={headRef} position={[0, 0.6, 0.5]}>
        
        {/* KAWAII Eyes - Big and sparkly */}
        <group position={[0, 0.2, 0.4]}>
          {/* Left Eye - Bigger, rounder */}
          <group position={[-0.25, 0, 0]}>
            {/* Eye white base */}
            <Sphere args={[0.18, 32, 32]} castShadow>
              <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
            </Sphere>
            {/* Big sparkle (top-left) */}
            <Sphere ref={leftEyeRef} args={[0.08, 16, 16]} position={[-0.05, 0.07, 0.15]} scale-y={1}>
              <meshStandardMaterial
                color="white"
                emissive="white"
                emissiveIntensity={2}
              />
            </Sphere>
            {/* Small sparkle (bottom-right) */}
            <Sphere args={[0.04, 12, 12]} position={[0.06, -0.04, 0.16]}>
              <meshStandardMaterial
                color="white"
                emissive="white"
                emissiveIntensity={1.5}
              />
            </Sphere>
          </group>
          
          {/* Right Eye - Bigger, rounder */}
          <group position={[0.25, 0, 0]}>
            {/* Eye white base */}
            <Sphere args={[0.18, 32, 32]} castShadow>
              <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
            </Sphere>
            {/* Big sparkle (top-left) */}
            <Sphere ref={rightEyeRef} args={[0.08, 16, 16]} position={[-0.05, 0.07, 0.15]} scale-y={1}>
              <meshStandardMaterial
                color="white"
                emissive="white"
                emissiveIntensity={2}
              />
            </Sphere>
            {/* Small sparkle (bottom-right) */}
            <Sphere args={[0.04, 12, 12]} position={[0.06, -0.04, 0.16]}>
              <meshStandardMaterial
                color="white"
                emissive="white"
                emissiveIntensity={1.5}
              />
            </Sphere>
          </group>
        </group>

        {/* Simple cute beak - kawaii style */}
        <group position={[0, 0, 0.5]}>
          {/* Small rounded beak */}
          <mesh ref={beakTopRef} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <coneGeometry args={[0.08, 0.15, 16]} />
            <meshStandardMaterial
              color={beakColor}
              roughness={0.6}
            />
          </mesh>
          {/* Tiny bottom part */}
          <mesh ref={beakBottomRef} position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <coneGeometry args={[0.06, 0.1, 16]} />
            <meshStandardMaterial
              color={beakColor}
              roughness={0.6}
            />
          </mesh>
        </group>
      </group>

      {/* KAWAII blush marks - bigger and pinker */}
      <Sphere args={[0.22, 24, 24]} position={[-0.7, 0.25, 0.75]} castShadow>
        <meshStandardMaterial
          color="#FFC0E0"
          transparent
          opacity={0.85}
          roughness={1}
          emissive="#FFB8D1"
          emissiveIntensity={0.15}
        />
      </Sphere>
      <Sphere args={[0.22, 24, 24]} position={[0.7, 0.25, 0.75]} castShadow>
        <meshStandardMaterial
          color="#FFC0E0"
          transparent
          opacity={0.85}
          roughness={1}
          emissive="#FFB8D1"
          emissiveIntensity={0.15}
        />
      </Sphere>

      {/* Fluffy kawaii tuft - softer and rounder */}
      <group position={[0, 1.08, 0]}>
        <Sphere args={[0.25, 32, 32]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial
            color={mainBodyColor}
            roughness={0.9}
          />
        </Sphere>
        <Sphere args={[0.18, 24, 24]} position={[-0.18, 0.15, 0]} castShadow>
          <meshStandardMaterial
            color={mainBodyColor}
            roughness={0.9}
          />
        </Sphere>
        <Sphere args={[0.16, 24, 24]} position={[0.18, 0.13, 0]} castShadow>
          <meshStandardMaterial
            color={mainBodyColor}
            roughness={0.9}
          />
        </Sphere>
      </group>

      {/* Soft rounded wings - kawaii style */}
      <group ref={leftWingRef} position={[-0.9, -0.1, 0.3]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial
            color={mainBodyColor}
            roughness={0.85}
          />
        </mesh>
      </group>
      <group ref={rightWingRef} position={[0.9, -0.1, 0.3]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial
            color={mainBodyColor}
            roughness={0.85}
          />
        </mesh>
      </group>

      {/* Feet - Adorable orange feet */}
      <group position={[0, -0.95, 0.25]}>
        {/* Left foot */}
        <mesh position={[-0.28, 0, 0]} rotation={[0, 0, 0.2]} castShadow>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshPhysicalMaterial
            color={feetColor}
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>
        {/* Left toes */}
        {[-1, 0, 1].map((offset, i) => (
          <Sphere key={`left-toe-${i}`} args={[0.06, 16, 16]} position={[-0.28 + offset * 0.12, -0.08, 0.15]} castShadow>
            <meshStandardMaterial color={feetColor} />
          </Sphere>
        ))}
        
        {/* Right foot */}
        <mesh position={[0.28, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshPhysicalMaterial
            color={feetColor}
            roughness={0.5}
            metalness={0.05}
          />
        </mesh>
        {/* Right toes */}
        {[-1, 0, 1].map((offset, i) => (
          <Sphere key={`right-toe-${i}`} args={[0.06, 16, 16]} position={[0.28 + offset * 0.12, -0.08, 0.15]} castShadow>
            <meshStandardMaterial color={feetColor} />
          </Sphere>
        ))}
      </group>

      {/* Simple cute stethoscope - less prominent */}
      <group ref={stethoscopeRef} position={[0, 0.15, 0.92]} scale={0.4}>
        {/* Minimal tube */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.35, 0.035, 12, 48]} />
          <meshStandardMaterial
            color="#5A6A7A"
            roughness={0.6}
          />
        </mesh>
        {/* Small chest piece */}
        <mesh position={[0, -0.42, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.1, 24]} />
          <meshStandardMaterial
            color="#B0BEC5"
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* Magical sparkles when responding */}
      {animationState === 'responding' && (
        <>
          <Sparkles
            count={20}
            scale={3}
            size={2}
            speed={0.4}
            color="#66D1C9"
          />
          <pointLight
            position={[0, 0, 2]}
            intensity={1.2}
            distance={5}
            color="#0B7BD6"
            castShadow
          />
        </>
      )}

      {/* Rim light for depth */}
      <pointLight
        position={[-2, 2, -2]}
        intensity={0.4}
        color="#FFE066"
      />
    </group>
  );
}
