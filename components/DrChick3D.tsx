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

  // Memoize expensive calculations
  const mainBodyColor = useMemo(() => new THREE.Color('#FFE066'), []);
  const beakColor = useMemo(() => new THREE.Color('#FF8C42'), []);
  const feetColor = useMemo(() => new THREE.Color('#FF8C42'), []);

  return (
    <group ref={chickGroup} position={[0, 0.2, 0]} scale={0.9}>
      {/* Main Body - Smooth glossy sphere */}
      <Sphere ref={bodyRef} args={[1, 64, 64]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={mainBodyColor}
          roughness={0.15}
          metalness={0.05}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
          emissive={"#FFE066"}
          emissiveIntensity={0.08}
        />
      </Sphere>

      {/* Head group for better control */}
      <group ref={headRef} position={[0, 0.6, 0.5]}>
        
        {/* Eyes with shine */}
        <group position={[0, 0.15, 0.3]}>
          {/* Left Eye Base */}
          <Sphere ref={leftEyeRef} args={[0.15, 32, 32]} position={[-0.28, 0, 0]} castShadow>
            <meshStandardMaterial
              color="#1A1A1A"
              roughness={0.3}
              metalness={0.1}
            />
          </Sphere>
          {/* Left Eye Shine */}
          <Sphere args={[0.06, 16, 16]} position={[-0.26, 0.06, 0.12]}>
            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={1}
            />
          </Sphere>
          
          {/* Right Eye Base */}
          <Sphere ref={rightEyeRef} args={[0.15, 32, 32]} position={[0.28, 0, 0]} castShadow>
            <meshStandardMaterial
              color="#1A1A1A"
              roughness={0.3}
              metalness={0.1}
            />
          </Sphere>
          {/* Right Eye Shine */}
          <Sphere args={[0.06, 16, 16]} position={[0.30, 0.06, 0.12]}>
            <meshStandardMaterial
              color="white"
              emissive="white"
              emissiveIntensity={1}
            />
          </Sphere>
        </group>

        {/* Beak - Two parts for talking animation */}
        <group position={[0, -0.05, 0.45]}>
          {/* Top beak */}
          <mesh ref={beakTopRef} castShadow>
            <coneGeometry args={[0.15, 0.25, 16]} />
            <meshPhysicalMaterial
              color={beakColor}
              roughness={0.4}
              metalness={0.1}
              clearcoat={0.2}
            />
          </mesh>
          {/* Bottom beak */}
          <mesh ref={beakBottomRef} position={[0, -0.05, 0]} castShadow>
            <coneGeometry args={[0.12, 0.18, 16]} />
            <meshPhysicalMaterial
              color={beakColor}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        </group>
      </group>

      {/* Cute blush marks */}
      <Sphere args={[0.18, 24, 24]} position={[-0.65, 0.35, 0.72]} castShadow>
        <meshStandardMaterial
          color="#FFB8D1"
          transparent
          opacity={0.7}
          roughness={1}
          emissive="#FFB8D1"
          emissiveIntensity={0.1}
        />
      </Sphere>
      <Sphere args={[0.18, 24, 24]} position={[0.65, 0.35, 0.72]} castShadow>
        <meshStandardMaterial
          color="#FFB8D1"
          transparent
          opacity={0.7}
          roughness={1}
          emissive="#FFB8D1"
          emissiveIntensity={0.1}
        />
      </Sphere>

      {/* Top tuft - Cute hair */}
      <group position={[0, 1.05, 0]}>
        <Sphere args={[0.22, 32, 32]} position={[0, 0, 0]} castShadow>
          <meshPhysicalMaterial
            color={mainBodyColor}
            roughness={0.2}
            clearcoat={0.3}
          />
        </Sphere>
        <Sphere args={[0.16, 24, 24]} position={[-0.15, 0.12, 0]} castShadow>
          <meshPhysicalMaterial
            color={mainBodyColor}
            roughness={0.25}
          />
        </Sphere>
        <Sphere args={[0.14, 24, 24]} position={[0.15, 0.1, 0]} castShadow>
          <meshPhysicalMaterial
            color={mainBodyColor}
            roughness={0.25}
          />
        </Sphere>
      </group>

      {/* Wings - Improved design */}
      <group ref={leftWingRef} position={[-0.85, -0.15, 0.2]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshPhysicalMaterial
            color={mainBodyColor}
            roughness={0.18}
            clearcoat={0.35}
          />
        </mesh>
        {/* Wing highlight */}
        <Sphere args={[0.15, 16, 16]} position={[-0.12, 0.1, 0.15]}>
          <meshStandardMaterial
            color="#FFFACD"
            transparent
            opacity={0.5}
          />
        </Sphere>
      </group>
      <group ref={rightWingRef} position={[0.85, -0.15, 0.2]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshPhysicalMaterial
            color={mainBodyColor}
            roughness={0.18}
            clearcoat={0.35}
          />
        </mesh>
        {/* Wing highlight */}
        <Sphere args={[0.15, 16, 16]} position={[0.12, 0.1, 0.15]}>
          <meshStandardMaterial
            color="#FFFACD"
            transparent
            opacity={0.5}
          />
        </Sphere>
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

      {/* Professional stethoscope */}
      <group ref={stethoscopeRef} position={[0, 0.3, 0.85]} scale={0.6}>
        {/* Tube (torus) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.28, 0.025, 16, 64]} />
          <meshPhysicalMaterial
            color="#2C3E50"
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
        {/* Chest piece */}
        <mesh position={[0, -0.35, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.08, 32]} />
          <meshPhysicalMaterial
            color="#95A5A6"
            roughness={0.2}
            metalness={0.8}
            clearcoat={0.5}
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
