import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Stats, Sparkles } from '@react-three/drei';
import { Avatar } from './Avatar';
import { InteractiveEnvironment } from './InteractiveEnvironment';
import { DynamicSky } from './TimeCycle';
import { useMemory } from '../../hooks/useMemory';
import { useEffect, useState } from 'react';

const userId = 'user-123'; 

const EmotionalParticles = () => {
  const { memory } = useMemory(userId); 
  
  return (
    <Sparkles
      count={200}
      scale={15}
      size={3}
      speed={0.5}
      color={
        memory.emotionalState.current === 'happy' ? '#ffcc00' :
        memory.emotionalState.current === 'sad' ? '#6666ff' :
        memory.emotionalState.current === 'excited' ? '#ff3300' :
        memory.emotionalState.current === 'relaxed' ? '#00cc99' :
        '#ffffff'
      }
      opacity={0.7}
      noise={0.3}
    />
  );
};

const EmotionalLighting = () => {
  const { memory } = useMemory(userId); // Pass the userId

  return (
    <>
      <ambientLight 
        intensity={0.6} 
        color={
          memory.emotionalState.current === 'happy' ? '#fff9c4' :
          memory.emotionalState.current === 'sad' ? '#e3f2fd' :
          memory.emotionalState.current === 'excited' ? '#ffebee' :
          memory.emotionalState.current === 'relaxed' ? '#e8f5e8' :
          '#ffffff'
        }
      />
      <pointLight 
        position={[5, 5, 5]} 
        intensity={1.5}
        color={
          memory.emotionalState.current === 'happy' ? '#ffd54f' :
          memory.emotionalState.current === 'sad' ? '#90caf9' :
          memory.emotionalState.current === 'excited' ? '#ff8a65' :
          memory.emotionalState.current === 'relaxed' ? '#81c784' :
          '#ffffff'
        }
      />
      <pointLight 
        position={[-5, 3, 2]} 
        intensity={1}
        color={
          memory.emotionalState.current === 'happy' ? '#ffecb3' :
          memory.emotionalState.current === 'sad' ? '#bbdefb' :
          memory.emotionalState.current === 'excited' ? '#ffcdd2' :
          memory.emotionalState.current === 'relaxed' ? '#c8e6c9' :
          '#f5f5f5'
        }
      />
    </>
  );
};

export const ThreeScene = () => {
  const { memory } = useMemory(userId); // Pass the userId
  const [moodColor, setMoodColor] = useState('#6366f1');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Change background based on emotional state
    switch(memory.emotionalState.current) {
      case 'happy':
        setMoodColor('#fbbf24');
        break;
      case 'sad':
        setMoodColor('#3b82f6');
        break;
      case 'excited':
        setMoodColor('#ef4444');
        break;
      case 'relaxed':
        setMoodColor('#10b981');
        break;
      case 'curious':
        setMoodColor('#8b5cf6');
        break;
      default:
        setMoodColor('#6366f1');
    }

    // Toggle stats with 'S' key
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 's') {
        setShowStats(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [memory.emotionalState.current]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ 
          background: `linear-gradient(to bottom, #1a202c, ${moodColor}44)`
        }}
      >
        <DynamicSky />
        <EmotionalLighting />
        <Avatar />
        <InteractiveEnvironment />
        <EmotionalParticles />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
          minDistance={3}
          maxDistance={10}
        />
        
        {/* Performance stats (toggle with 'S' key) */}
        {showStats && <Stats />}
        
        {/* Floating mood text */}
        <Text
          position={[0, 3.5, 0]}
          color="white"
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
        >
          {`Feeling ${memory.emotionalState.current}`}
        </Text>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full animate-pulse ${
            memory.emotionalState.current === 'happy' ? 'bg-yellow-400' :
            memory.emotionalState.current === 'sad' ? 'bg-blue-400' :
            memory.emotionalState.current === 'excited' ? 'bg-red-400' :
            memory.emotionalState.current === 'relaxed' ? 'bg-green-400' :
            'bg-purple-400'
          }`}></div>
          <div>
            <div className="font-semibold capitalize">{memory.emotionalState.current}</div>
            <div className="text-xs opacity-80">Mood</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
        <div className="text-right">
          <div className="font-semibold">{memory.userPreferences.name}</div>
          <div className="text-xs opacity-80">Conversing with AI</div>
        </div>
      </div>

      {/* Help tip */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-sm">
        Press 'S' for stats
      </div>
    </div>
  );
};