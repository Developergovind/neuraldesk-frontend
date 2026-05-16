"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion-3d';

interface DataPoint {
  label: string;
  value: number;
}

const Bar = ({ position, height, color, delay }: { position: [number, number, number], height: number, color: string, delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = React.useState(false);

  return (
    <motion.mesh
      ref={meshRef}
      position={position}
      initial={{ scaleY: 0, y: position[1] }}
      animate={{ 
        scaleY: height, 
        y: position[1] + height / 2,
        scaleX: hovered ? 1.2 : 1,
        scaleZ: hovered ? 1.2 : 1
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 100, 
        damping: 15, 
        delay 
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial 
        color={hovered ? '#ffffff' : color} 
        roughness={0.2} 
        metalness={0.8}
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </motion.mesh>
  );
};

const Chart = ({ data, color }: { data: DataPoint[], color: string }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <group position={[-data.length / 2, -2, 0]}>
      {/* Base grid */}
      <gridHelper args={[data.length * 2 + 2, data.length * 2 + 2, '#333333', '#111111']} position={[data.length / 2, 0, 0]} />
      
      {data.map((d, i) => (
        <Bar 
          key={i} 
          position={[i * 1.5 + 0.75, 0, 0]} 
          height={(d.value / maxValue) * 4} 
          color={color} 
          delay={i * 0.1} 
        />
      ))}
    </group>
  );
};

export const AnalyticsBar3D = ({ data, color = "#00d4ff" }: { data: DataPoint[], color?: string }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/40">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-full relative cursor-crosshair">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 10, -5]} intensity={0.5} color={color} />
        <Chart data={data} color={color} />
      </Canvas>
    </div>
  );
};
