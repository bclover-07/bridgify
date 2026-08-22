"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Edges } from '@react-three/drei';

function AbstractShape() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />
        <meshStandardMaterial 
          color="#4B3AFF" // var(--electric)
          roughness={0.1}
          metalness={0.8}
        />
        {/* Neubrutalist black wireframe outline effect */}
        <Edges scale={1.05} threshold={15} color="#14121F" /> 
      </mesh>
    </Float>
  );
}

export default function ThreeModel() {
  return (
    <div className="w-full h-[500px] border-[4px] border-[var(--ink)] rounded-[var(--radius-card)] bg-[var(--paper)] shadow-[10px_10px_0px_0px_var(--ink)] relative overflow-hidden">
      {/* Background decoration in the 3D container */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--ink) 1px, transparent 0)', backgroundSize: '16px 16px' }}>
      </div>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#E8FF3D" /> {/* Acid light */}
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#FF3D9A" /> {/* Hotpink fill */}
        <AbstractShape />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
      <div className="absolute bottom-4 right-4 bg-white border-[4px] border-[var(--ink)] px-3 py-1 rounded-full text-xs font-bold pointer-events-none">
        Interactive 3D
      </div>
    </div>
  );
}
