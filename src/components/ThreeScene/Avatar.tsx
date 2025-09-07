import { useRef, useState } from 'react';
import { Text, Sparkles } from '@react-three/drei';
import { useAvatarAnimations } from './Animations';
import * as THREE from 'three';

// Note: The useMemory and useAvatarAnimations hooks are assumed to exist in other files.
// For this example, we will treat them as if they are imported correctly.
// Also, a placeholder for the useMemory hook is provided for demonstration.
const useMemory = () => {
  // A mock implementation for demonstration purposes.
  // In a real application, this would fetch data based on the userId.
  const [memory, setMemory] = useState({
    emotionalState: {
      current: 'curious',
    },
    userPreferences: {
      name: 'User',
    },
  });

  return { memory, setMemory };
};

const EmotionalEffects = () => {
  const { memory } = useMemory();

  return (
    <Sparkles
      count={50}
      scale={2}
      size={1.5}
      speed={0.3}
      color={
        memory.emotionalState.current === 'happy' ? '#ffd93d' :
        memory.emotionalState.current === 'sad' ? '#6bc5f8' :
        memory.emotionalState.current === 'excited' ? '#ff7c7c' :
        memory.emotionalState.current === 'relaxed' ? '#7dd87d' :
        '#a5b4fc'
      }
      opacity={0.8}
      noise={0.2}
    />
  );
};

const EmotionalAvatar = () => {
  const userId = "default-user-id"; // Assuming the userId is obtained here or passed as a prop
  const { memory } = useMemory();
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  // The fix is here: we pass the userId as the second argument.
  useAvatarAnimations(groupRef, userId);

  const getAvatarColor = () => {
    switch(memory.emotionalState.current) {
      case 'happy': return '#ffd93d';
      case 'sad': return '#6bc5f8';
      case 'excited': return '#ff7c7c';
      case 'relaxed': return '#7dd87d';
      case 'curious': return '#b197fc';
      default: return '#a5b4fc';
    }
  };

  const getEmissiveColor = () => {
    switch(memory.emotionalState.current) {
      case 'happy': return '#ffed4f';
      case 'sad': return '#8ac6f9';
      case 'excited': return '#ff9292';
      case 'relaxed': return '#96e096';
      case 'curious': return '#c4b0ff';
      default: return '#b8c4ff';
    }
  };

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Emotional effects */}
      <EmotionalEffects />

      {/* Main avatar body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={getAvatarColor()}
          emissive={getEmissiveColor()}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Animated eyes */}
      <mesh position={[-0.3, 0.2, 0.9]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.9]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Dynamic mouth */}
      <mesh position={[0, -0.2, 0.9]} rotation={[0, 0, 0]}>
        {memory.emotionalState.current === 'happy' ? (
          <ringGeometry args={[0.2, 0.3, 16, 1, Math.PI * 0.2, Math.PI * 0.6]} />
        ) : memory.emotionalState.current === 'sad' ? (
          <ringGeometry args={[0.2, 0.3, 16, 1, Math.PI * 1.2, Math.PI * 0.6]} />
        ) : memory.emotionalState.current === 'excited' ? (
          <circleGeometry args={[0.25, 16]} />
        ) : (
          <circleGeometry args={[0.2, 16]} />
        )}
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Hover effect */}
      {hovered && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial 
            color={getEmissiveColor()}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}

      {/* Name tag */}
      <Text
        position={[0, -1.8, 0]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {memory.userPreferences.name}'s Companion
      </Text>
    </group>
  );
};

export const Avatar = () => {
  return <EmotionalAvatar />;
};
