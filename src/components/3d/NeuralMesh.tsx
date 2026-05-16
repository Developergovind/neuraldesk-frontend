"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const NeuralNetwork = () => {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { mouse, viewport } = useThree();

  // Create nodes and connections
  const { nodes, geometry } = useMemo(() => {
    const nodeCount = 50;
    const nodes = [];
    const positions = new Float32Array(nodeCount * 3);
    
    // Spread nodes in a volume
    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 10;
      
      nodes.push({ id: i, position: new THREE.Vector3(x, y, z) });
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    // Create connections based on distance
    const indices = [];
    const maxDistance = 6;
    
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < maxDistance) {
          indices.push(i, j);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(indices);

    return { nodes, geometry };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Slow rotation
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;

      // Mouse parallax
      const targetX = (mouse.x * viewport.width) / 15;
      const targetY = (mouse.y * viewport.height) / 15;
      
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((node) => (
        <mesh key={node.id} position={node.position}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#00d4ff" />
          {/* Subtle glow */}
          <pointLight distance={3} intensity={0.5} color="#00d4ff" />
        </mesh>
      ))}

      {/* Edges */}
      <lineSegments ref={linesRef} geometry={geometry}>
        <lineBasicMaterial color="#7c3aed" transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
};

export const NeuralMesh = () => {
  return (
    <div className="absolute inset-0 z-0 bg-obsidian-950 overflow-hidden">
      {/* Fallback gradient behind canvas */}
      <div className="absolute inset-0 bg-obsidian-gradient opacity-80" />
      
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <fog attach="fog" args={['#080810', 10, 25]} />
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <NeuralNetwork />
      </Canvas>
      
      {/* Foreground gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian-950/50 to-obsidian-950 pointer-events-none" />
    </div>
  );
};
