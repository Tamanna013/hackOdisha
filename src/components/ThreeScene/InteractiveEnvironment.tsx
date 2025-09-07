import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useMemory } from '../../hooks/useMemory';

const InteractiveOrb = ({ position, color, onClick }: { 
  position: [number, number, number]; 
  color: string;
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial 
          color={color} 
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

export const InteractiveEnvironment = () => {
  // Corrected the destructuring to updateUserPreferences
  const { memory, updateUserPreferences } = useMemory("some-user-id"); 
  const [activeTheme, setActiveTheme] = useState('default');

  const themes = {
    default: { color: '#6366f1', bg: '#1a202c' },
    nature: { color: '#10b981', bg: '#064e3b' },
    cosmic: { color: '#8b5cf6', bg: '#1e1b4b' },
    sunset: { color: '#f97316', bg: '#7c2d12' },
    ocean: { color: '#06b6d4', bg: '#083344' }
  };

  const handleThemeChange = (theme: string) => {
    setActiveTheme(theme);
    // You could trigger other effects here
  };

  const handleMoodChange = (mood: string) => {
    // Simulate mood change
    console.log(`Changing mood to: ${mood}`);
  };

  return (
    <group>
      {/* Interactive theme orbs */}
      <InteractiveOrb 
        position={[-4, 2, -2]} 
        color="#10b981"
        onClick={() => handleThemeChange('nature')}
      />
      <InteractiveOrb 
        position={[-2, 3, -3]} 
        color="#8b5cf6"
        onClick={() => handleThemeChange('cosmic')}
      />
      <InteractiveOrb 
        position={[4, 1, -1]} 
        color="#f97316"
        onClick={() => handleThemeChange('sunset')}
      />
      <InteractiveOrb 
        position={[2, 2, -4]} 
        color="#06b6d4"
        onClick={() => handleThemeChange('ocean')}
      />

      {/* Floating information cards */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.8}>
        <Text
          position={[-3, -1, -1]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          textAlign="center"
        >
          {`Topics: ${memory.recentTopics.slice(0, 3).join(', ')}`}
        </Text>
      </Float>

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <Text
          position={[3, -2, -2]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
          textAlign="center"
        >
          {`Style: ${memory.userPreferences.conversationStyle}`}
        </Text>
      </Float>
    </group>
  );
};