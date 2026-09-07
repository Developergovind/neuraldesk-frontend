"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Infinity Lemniscate Curve with smooth 3D Z-depth twist
class InfinityCurve3D extends THREE.Curve<THREE.Vector3> {
  scale: number;
  zDepth: number;

  constructor(scale = 7.4, zDepth = 1.6) {
    super();
    this.scale = scale;
    this.zDepth = zDepth;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const u = ((t % 1) + 1) % 1;
    const angle = 2 * Math.PI * u;
    const denom = 1 + Math.sin(angle) * Math.sin(angle);
    const x = (this.scale * Math.cos(angle)) / denom;
    const y = (this.scale * Math.sin(angle) * Math.cos(angle)) / denom;
    const z = Math.sin(angle * 2) * this.zDepth;

    return optionalTarget.set(x, y, z);
  }
}

// Luminous Laser Light Trail flowing along Infinity Loop in Project Palette (#F58F7C Coral / #F2C4CE Blush)
function InfinityLaserTrail() {
  const groupRef = useRef<THREE.Group>(null);
  const headFlareRef = useRef<THREE.Mesh>(null);
  const headPointLightRef = useRef<THREE.PointLight>(null);
  const { mouse } = useThree();

  const curve = useMemo(() => new InfinityCurve3D(7.4, 1.8), []);

  // 1. Static delicate base guide line in Coral #F58F7C
  const baseLine = useMemo(() => {
    const points = curve.getPoints(240);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: "#F58F7C",
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Line(geometry, material);
  }, [curve]);

  // 2. Dynamic flowing trail buffer geometry & line in Coral & Blush
  const trailSegmentCount = 200;
  const { trailLine, trailGeometry } = useMemo(() => {
    const positions = new Float32Array(trailSegmentCount * 3);
    const colors = new Float32Array(trailSegmentCount * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const line = new THREE.Line(geometry, material);
    return { trailLine: line, trailGeometry: geometry };
  }, [trailSegmentCount]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 0.28; // Elegant drift speed

    if (groupRef.current) {
      // Smooth 3D mouse parallax tracking
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.x * 0.18 + Math.sin(time * 0.5) * 0.1,
        0.04
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -0.08 + mouse.y * 0.12 + Math.cos(time * 0.4) * 0.08,
        0.04
      );
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.15;
    }

    // Update laser trail segment vertices along the curve
    if (trailGeometry) {
      const posAttr = trailGeometry.attributes.position;
      const colAttr = trailGeometry.attributes.color;
      const posArray = posAttr.array as Float32Array;
      const colArray = colAttr.array as Float32Array;

      const headU = (time * 0.9) % 1;
      const trailLength = 0.62; // Length of the luminous trailing streak

      // Project Brand Colors
      const coralBase = new THREE.Color("#D45C47"); // Deep Coral
      const coralRadiant = new THREE.Color("#F58F7C"); // Core Radiant Coral
      const blush = new THREE.Color("#F2C4CE"); // Blush Rose
      const whiteGlow = new THREE.Color("#FFF2F4"); // Luminous Highlight
      const tempColor = new THREE.Color();

      for (let i = 0; i < trailSegmentCount; i++) {
        const fraction = i / (trailSegmentCount - 1); // 0 = tail (dim), 1 = head (bright)
        const u = headU - (1 - fraction) * trailLength;
        const pt = curve.getPoint(u);

        posArray[i * 3] = pt.x;
        posArray[i * 3 + 1] = pt.y;
        posArray[i * 3 + 2] = pt.z;

        // Exponential glow intensity towards head
        const intensity = Math.pow(fraction, 2.0);

        if (fraction > 0.82) {
          // Intense warm white-coral core at the leading head
          tempColor.lerpColors(coralRadiant, whiteGlow, (fraction - 0.82) / 0.18);
        } else if (fraction > 0.35) {
          // Vibrant Coral body
          tempColor.lerpColors(blush, coralRadiant, (fraction - 0.35) / 0.47);
        } else {
          // Soft Blush Rose tail fading into darkness
          tempColor.lerpColors(coralBase, blush, fraction / 0.35);
        }

        colArray[i * 3] = tempColor.r * intensity;
        colArray[i * 3 + 1] = tempColor.g * intensity;
        colArray[i * 3 + 2] = tempColor.b * intensity;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Position glowing head flare and pointlight
      if (headFlareRef.current && headPointLightRef.current) {
        const headPt = curve.getPoint(headU);
        headFlareRef.current.position.set(headPt.x, headPt.y, headPt.z);
        headPointLightRef.current.position.set(headPt.x, headPt.y, headPt.z);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {/* 1. Delicate Guide Path in Brand Coral */}
      <primitive object={baseLine} />

      {/* 2. Main Glowing Laser Streak in Coral & Blush */}
      <primitive object={trailLine} />

      {/* 3. Glowing Head Flare */}
      <mesh ref={headFlareRef}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshBasicMaterial
          color="#FFF5F7"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Radiant Head PointLight in Coral Glow */}
      <pointLight
        ref={headPointLightRef}
        color="#F58F7C"
        intensity={2.4}
        distance={10}
        decay={2}
      />
    </group>
  );
}

// Main 3D Luminous Background with Project Theme (#19181C Charcoal / #F58F7C Coral / #F2C4CE Blush)
export function Luminous3DBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#19181C]">
      {/* Three.js Canvas Container with Soft Cinematic Blur & Muted Opacity */}
      <div className="absolute inset-0 filter blur-[2px] opacity-80 transform scale-100 transition-opacity duration-1000">
        <Canvas
          camera={{ position: [0, 0, 13], fov: 48 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#19181C']} />
          
          <ambientLight intensity={0.35} />
          <pointLight position={[0, 6, 8]} intensity={0.9} color="#F58F7C" />
          <pointLight position={[0, -6, -8]} intensity={0.5} color="#F2C4CE" />

          {/* 3D Flowing Luminous Infinity Laser Element */}
          <InfinityLaserTrail />
        </Canvas>
      </div>

      {/* Atmospheric dark gradient overlays to guarantee pristine contrast for foreground content */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#19181C] via-transparent to-[#19181C]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#19181C]/80 via-transparent to-[#19181C]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[#19181C]/20 pointer-events-none" />
    </div>
  );
}

export default Luminous3DBackground;
