import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Environment } from '@react-three/drei';

export const useTimeCycle = () => {
  const [timeOfDay, setTimeOfDay] = useState('day');
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // 24-second day/night cycle (24 seconds = 24 hours)
    const cycleProgress = (timeRef.current % 24) / 24;
    
    if (cycleProgress > 0.75 || cycleProgress < 0.25) {
      setTimeOfDay('night');
    } else {
      setTimeOfDay('day');
    }
  });

  return timeOfDay;
};

export const DynamicSky = () => {
  const timeOfDay = useTimeCycle();

  return (
    <Environment
      preset={timeOfDay === 'day' ? 'sunset' : 'night'}
      background
      blur={0.5}
    />
  );
};