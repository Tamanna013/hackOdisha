import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useMemory } from '../../hooks/useMemory';

export const useAvatarAnimations = (groupRef: React.RefObject<THREE.Group>, userId: string) => {
  const { memory } = useMemory(userId);
  const animationState = useRef({
    time: 0,
    intensity: 0,
    gesture: 'idle' as string
  });

  useFrame(() => {
    if (!groupRef.current) return;

    // Base idle animation
    const idleBounce = Math.sin(animationState.current.time * 2) * 0.05;
    groupRef.current.position.y = idleBounce;

    // Emotional state animations
    switch(memory.emotionalState.current) {
      case 'happy':
        groupRef.current.rotation.y = Math.sin(animationState.current.time * 3) * 0.3;
        groupRef.current.scale.setScalar(1 + Math.sin(animationState.current.time * 4) * 0.1);
        break;
      
      case 'sad':
        groupRef.current.rotation.x = Math.sin(animationState.current.time * 0.8) * 0.15;
        groupRef.current.scale.setScalar(0.9 + Math.sin(animationState.current.time * 1) * 0.05);
        break;
      
      case 'excited':
        groupRef.current.rotation.z = Math.sin(animationState.current.time * 5) * 0.2;
        groupRef.current.scale.setScalar(1 + Math.sin(animationState.current.time * 6) * 0.15);
        break;
      
      case 'curious':
        groupRef.current.rotation.y = Math.sin(animationState.current.time * 2) * 0.4;
        groupRef.current.position.x = Math.sin(animationState.current.time * 1.5) * 0.2;
        break;
      
      default:
        groupRef.current.rotation.y = Math.sin(animationState.current.time * 1.2) * 0.2;
    }
  });
};

// Gesture components for different emotional states
export const HappyGesture = () => {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
        <meshStandardMaterial color="#ffd93d" emissive="#ffed4f" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffd93d" emissive="#ffed4f" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

export const ThinkingGesture = () => {
  return (
    <group>
      <mesh position={[0.8, 1.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#a5b4fc" />
      </mesh>
      <mesh position={[1.1, 1.5, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#a5b4fc" />
      </mesh>
      <mesh position={[1.3, 1.5, 0.1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#a5b4fc" />
      </mesh>
    </group>
  );
};