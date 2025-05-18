"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import * as THREE from "three";

// Environment themes
const ENVIRONMENTS = {
  forest: "forest",
  beach: "sunset",
  space: "night",
  home: "apartment",
  park: "park",
};

// Tree component for environment
const Tree = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Foliage */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.5, 1.2, 8]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.4, 1, 8]} />
        <meshStandardMaterial color="#3CB371" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color="#32CD32" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Mountain component for environment
const Mountain = ({ position, scale = 1, color = "#A9A9A9" }) => {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <coneGeometry args={[1, 2, 4, 1]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

// Sun component for environment
const Sun = ({ timeOfDay }) => {
  const isVisible = timeOfDay === "morning" || timeOfDay === "day";
  const position = timeOfDay === "morning" ? [10, 3, -15] : [0, 15, -15];

  if (!isVisible) return null;

  return (
    <mesh position={position}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#FFFF00" />
      <pointLight color="#FFFFFF" intensity={1} distance={100} decay={2} />
    </mesh>
  );
};

// Enhanced ground with better textures
const EnhancedGround = ({ theme }) => {
  // Different ground colors based on environment theme
  const groundColors = {
    forest: "#2d5a27", // Deep green
    beach: "#f5deb3", // Sandy color
    park: "#4a7c3a", // Grass green
    home: "#8b7d6b", // Indoor floor
    space: "#1a1a2e", // Dark space color
  };

  const groundColor = groundColors[theme] || "#4a7c3a"; // Default to park grass

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[30, 30, 32, 32]} />
      <meshStandardMaterial
        color={groundColor}
        roughness={0.8}
        metalness={0.1}
        wireframe={false}
        // Add some variation to the ground
        onBeforeCompile={(shader) => {
          shader.uniforms.time = { value: 0 };
          shader.vertexShader = `
            uniform float time;
            ${shader.vertexShader}
          `.replace(
            "#include <begin_vertex>",
            `
            #include <begin_vertex>
            // Add subtle height variation to make the ground more interesting
            float frequency = 0.2;
            float amplitude = 0.1;
            transformed.y += sin(transformed.x * frequency + transformed.z * frequency) * amplitude;
            `
          );
        }}
      />
    </mesh>
  );
};

// Enhanced Environment Component
export function EnhancedEnvironment({
  theme = "park",
  timeOfDay = "day",
  weather = "clear",
}) {
  const groundRef = useRef();
  const [particles, setParticles] = useState([]);

  // Dynamic environment effects
  useEffect(() => {
    const interval = setInterval(() => {
      if (weather === "rainy") {
        setParticles((prev) => [
          ...prev,
          {
            position: [
              (Math.random() - 0.5) * 10,
              5,
              (Math.random() - 0.5) * 10,
            ],
            velocity: [0, -0.1, 0],
            lifetime: 100,
          },
        ]);
      } else if (weather === "snowy") {
        setParticles((prev) => [
          ...prev,
          {
            position: [
              (Math.random() - 0.5) * 10,
              5,
              (Math.random() - 0.5) * 10,
            ],
            velocity: [
              (Math.random() - 0.5) * 0.02,
              -0.05,
              (Math.random() - 0.5) * 0.02,
            ],
            lifetime: 200,
          },
        ]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [weather]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Update ground shader time if available
    if (groundRef.current && groundRef.current.material.userData.shader) {
      groundRef.current.material.userData.shader.uniforms.time.value = time;
    }

    // Update weather particles
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          position: [
            p.position[0] + p.velocity[0],
            p.position[1] + p.velocity[1],
            p.position[2] + p.velocity[2],
          ],
          lifetime: p.lifetime - 1,
        }))
        .filter((p) => p.lifetime > 0)
    );
  });

  // Generate trees based on environment
  const trees = useMemo(() => {
    if (theme !== "forest" && theme !== "park") return [];

    const treePositions = [];
    const treeCount = theme === "forest" ? 15 : 8;

    for (let i = 0; i < treeCount; i++) {
      // Place trees in a circle around the center, but not too close
      const angle = (i / treeCount) * Math.PI * 2;
      const distance =
        theme === "forest" ? 8 + Math.random() * 4 : 12 + Math.random() * 6;
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      const scale = 0.8 + Math.random() * 0.6;

      treePositions.push({ position: [x, 0, z], scale });
    }

    return treePositions;
  }, [theme]);

  // Generate mountains for distant scenery
  const mountains = useMemo(() => {
    if (theme !== "forest" && theme !== "park" && theme !== "beach") return [];

    const mountainPositions = [];
    const mountainCount = 8;

    for (let i = 0; i < mountainCount; i++) {
      // Place mountains in a larger circle around the scene
      const angle = (i / mountainCount) * Math.PI * 2;
      const distance = 20 + Math.random() * 5;
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      const scale = 3 + Math.random() * 2;

      // Different colors for different environments
      let color;
      if (theme === "forest") {
        color = "#4b6043"; // Forest green mountains
      } else if (theme === "beach") {
        color = "#a98b66"; // Sandy mountains
      } else {
        color = "#6b7c85"; // Default gray mountains
      }

      mountainPositions.push({ position: [x, 0, z], scale, color });
    }

    return mountainPositions;
  }, [theme]);

  return (
    <>
      {/* Environment preset from drei */}
      <Environment preset={ENVIRONMENTS[theme]} />

      {/* Ambient and directional lighting */}
      <ambientLight intensity={timeOfDay === "night" ? 0.3 : 0.7} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={timeOfDay === "night" ? 0.5 : 1}
        castShadow
      />

      {/* Sky with time of day */}
      <Sky
        distance={450000}
        sunPosition={
          timeOfDay === "night"
            ? [0, -1, 0]
            : timeOfDay === "morning"
            ? [-1, 0.5, 1]
            : timeOfDay === "evening"
            ? [1, 0.5, -1]
            : [0, 1, 0]
        }
        turbidity={timeOfDay === "night" ? 20 : 10}
        rayleigh={timeOfDay === "night" ? 0.5 : 1}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Sun */}
      <Sun timeOfDay={timeOfDay} />

      {/* Weather particles */}
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[weather === "snowy" ? 0.05 : 0.03, 8, 8]} />
          <meshBasicMaterial
            color={weather === "snowy" ? "white" : "#6495ED"}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Enhanced ground */}
      <EnhancedGround theme={theme} ref={groundRef} />

      {/* Trees */}
      {trees.map((tree, index) => (
        <Tree
          key={`tree-${index}`}
          position={tree.position}
          scale={tree.scale}
        />
      ))}

      {/* Mountains */}
      {mountains.map((mountain, index) => (
        <Mountain
          key={`mountain-${index}`}
          position={mountain.position}
          scale={mountain.scale}
          color={mountain.color}
        />
      ))}
    </>
  );
}
