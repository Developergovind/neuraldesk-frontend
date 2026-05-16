"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TorusKnot = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.05;
      meshRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[10, 2, 100, 16]} />
      <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.15} />
    </mesh>
  );
};

export const TorusKnotBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
        <TorusKnot />
      </Canvas>
    </div>
  );
};
