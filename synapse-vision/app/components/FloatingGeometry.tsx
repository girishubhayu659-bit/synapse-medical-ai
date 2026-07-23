"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function OrbitingTorusKnot() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={[-3.5, 0.5, -2]}>
        <torusKnotGeometry args={[1, 0.28, 128, 32]} />
        <meshStandardMaterial
          color="#22d3ee"
          wireframe
          emissive="#0284c7"
          emissiveIntensity={1.2}
          transparent
          opacity={0.35}
        />
      </mesh>
    </Float>
  );
}

function FloatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * -0.2;
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1.8}>
      <mesh ref={meshRef} position={[3.8, -1, -2]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color="#818cf8"
          wireframe
          emissive="#6366f1"
          emissiveIntensity={1.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
}

function FloatingIcosahedron() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1} floatIntensity={2.5}>
      <mesh ref={meshRef} position={[0, -3, -3]}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#f472b6"
          wireframe
          emissive="#db2777"
          emissiveIntensity={1.2}
          transparent
          opacity={0.25}
        />
      </mesh>
    </Float>
  );
}

export default function FloatingGeometry() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden opacity-60">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#818cf8" />
        <OrbitingTorusKnot />
        <FloatingCube />
        <FloatingIcosahedron />
      </Canvas>
    </div>
  );
}
