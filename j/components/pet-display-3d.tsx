"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Html, Sky } from "@react-three/drei";
import * as THREE from "three";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Environment themes
const ENVIRONMENTS = {
  forest: "forest",
  beach: "sunset",
  space: "night",
  home: "apartment",
  park: "park",
};

// Emotion animations and effects
const EMOTIONS = {
  happy: {
    color: "#FFD700",
    animation: "jump",
    particles: "stars",
    sound: "/sounds/happy.mp3",
  },
  sad: {
    color: "#6495ED",
    animation: "droopHead",
    particles: "raindrops",
    sound: "/sounds/sad.mp3",
  },
  excited: {
    color: "#FF4500",
    animation: "spin",
    particles: "confetti",
    sound: "/sounds/excited.mp3",
  },
  sleepy: {
    color: "#9370DB",
    animation: "yawn",
    particles: "zs",
    sound: "/sounds/sleepy.mp3",
  },
  hungry: {
    color: "#32CD32",
    animation: "pawAtBelly",
    particles: "foodIcons",
    sound: "/sounds/hungry.mp3",
  },
  loving: {
    color: "#FF69B4",
    animation: "nuzzle",
    particles: "hearts",
    sound: "/sounds/loving.mp3",
  },
  curious: {
    color: "#4169E1",
    animation: "tiltHead",
    particles: "questionMarks",
    sound: "/sounds/curious.mp3",
  },
  scared: {
    color: "#8A2BE2",
    animation: "cower",
    particles: "exclamationMarks",
    sound: "/sounds/scared.mp3",
  },
  dancing: {
    color: "#FF1493",
    animation: "dance",
    particles: "musicNotes",
    sound: "/sounds/dancing.mp3",
  },
  thinking: {
    color: "#20B2AA",
    animation: "tiltHead",
    particles: "thoughtBubbles",
    sound: "/sounds/thinking.mp3",
  },
  laughing: {
    color: "#FF8C00",
    animation: "laugh",
    particles: "hahas",
    sound: "/sounds/laughing.mp3",
  },
  proud: {
    color: "#B8860B",
    animation: "puffChest",
    particles: "stars",
    sound: "/sounds/proud.mp3",
  },
  playful: {
    color: "#00BFFF",
    animation: "bounce",
    particles: "toys",
    sound: "/sounds/playful.mp3",
  },
  shocked: {
    color: "#9932CC",
    animation: "jumpBack",
    particles: "exclamationMarks",
    sound: "/sounds/shocked.mp3",
  },
};

// Pet accessories
const ACCESSORIES = {
  hat: { position: [0, 1.2, 0], scale: 0.2 },
  glasses: { position: [0, 0.7, 0.5], scale: 0.1 },
  bowtie: { position: [0, 0.3, 0.5], scale: 0.15 },
  backpack: { position: [0, 0.5, -0.5], scale: 0.25 },
};

// Responses for different emotions
const EMOTION_RESPONSES = {
  happy: [
    "I'm so happy you're feeling good!",
    "Your happiness makes me happy too!",
    "What a wonderful day to be happy!",
    "Yay! Let's celebrate together!",
  ],
  sad: [
    "I'm sorry you're feeling down. I'm here for you.",
    "It's okay to feel sad sometimes. Would you like a virtual hug?",
    "I'll stay by your side until you feel better.",
    "Is there anything I can do to cheer you up?",
  ],
  excited: [
    "Wow! I'm excited too!",
    "Your excitement is contagious!",
    "Let's channel that energy into something fun!",
    "I can't wait to see what happens next!",
  ],
  sleepy: [
    "Getting tired? Maybe we should both take a nap.",
    "I'll keep watch while you rest.",
    "Sweet dreams if you decide to sleep!",
    "*yawns* Now I'm getting sleepy too...",
  ],
  hungry: [
    "I could go for a snack too!",
    "Food is always a good idea!",
    "What are you thinking of eating?",
    "Don't forget to stay hydrated too!",
  ],
  loving: [
    "I love spending time with you too!",
    "You're the best friend a pet could ask for!",
    "I'm so grateful for our friendship!",
    "❤️ Sending lots of love your way! ❤️",
  ],
  curious: [
    "What are you curious about? Maybe we can explore together!",
    "Curiosity is the spice of life!",
    "I wonder about that too!",
    "Let's find out together!",
  ],
  scared: [
    "Don't worry, I'm right here with you.",
    "It's okay to be scared. We'll face it together.",
    "I'll protect you!",
    "Take deep breaths. Everything will be okay.",
  ],
  dancing: [
    "I love dancing with you!",
    "Look at my moves! Aren't they great?",
    "Dancing is so much fun!",
    "Let's dance all day long!",
  ],
};

// Detect emotion from text
const detectEmotion = (text) => {
  text = text.toLowerCase();

  // Happy keywords
  if (
    text.includes("happy") ||
    text.includes("joy") ||
    text.includes("great") ||
    text.includes("awesome") ||
    text.includes("excellent") ||
    text.includes("wonderful") ||
    text.includes("yay") ||
    text.includes("woohoo") ||
    text.includes("😊") ||
    text.includes("😃") ||
    text.includes("😄")
  ) {
    return "happy";
  }

  // Sad keywords
  if (
    text.includes("sad") ||
    text.includes("unhappy") ||
    text.includes("depressed") ||
    text.includes("down") ||
    text.includes("blue") ||
    text.includes("crying") ||
    text.includes("😢") ||
    text.includes("😭") ||
    text.includes("😔")
  ) {
    return "sad";
  }

  // Excited keywords
  if (
    text.includes("excited") ||
    text.includes("thrilled") ||
    text.includes("can't wait") ||
    text.includes("pumped") ||
    text.includes("stoked") ||
    text.includes("psyched") ||
    text.includes("😲") ||
    text.includes("🤩") ||
    text.includes("wow")
  ) {
    return "excited";
  }

  // Sleepy keywords
  if (
    text.includes("tired") ||
    text.includes("sleepy") ||
    text.includes("exhausted") ||
    text.includes("yawn") ||
    text.includes("bed") ||
    text.includes("sleep") ||
    text.includes("😴") ||
    text.includes("💤") ||
    text.includes("nap")
  ) {
    return "sleepy";
  }

  // Hungry keywords
  if (
    text.includes("hungry") ||
    text.includes("starving") ||
    text.includes("food") ||
    text.includes("eat") ||
    text.includes("snack") ||
    text.includes("meal") ||
    text.includes("🍕") ||
    text.includes("🍔") ||
    text.includes("🍗")
  ) {
    return "hungry";
  }

  // Loving keywords
  if (
    text.includes("love") ||
    text.includes("adore") ||
    text.includes("care") ||
    text.includes("affection") ||
    text.includes("fond") ||
    text.includes("heart") ||
    text.includes("❤️") ||
    text.includes("💕") ||
    text.includes("😍")
  ) {
    return "loving";
  }

  // Curious keywords
  if (
    text.includes("curious") ||
    text.includes("wonder") ||
    text.includes("interested") ||
    text.includes("intrigued") ||
    text.includes("what if") ||
    text.includes("how come") ||
    text.includes("🤔") ||
    text.includes("why") ||
    text.includes("how")
  ) {
    return "curious";
  }

  // Scared keywords
  if (
    text.includes("scared") ||
    text.includes("afraid") ||
    text.includes("frightened") ||
    text.includes("terrified") ||
    text.includes("fear") ||
    text.includes("scary") ||
    text.includes("😨") ||
    text.includes("😱") ||
    text.includes("help")
  ) {
    return "scared";
  }

  // Dancing keywords
  if (
    text.includes("dance") ||
    text.includes("dancing") ||
    text.includes("move") ||
    text.includes("groove") ||
    text.includes("party") ||
    text.includes("music") ||
    text.includes("🕺") ||
    text.includes("💃")
  ) {
    return "dancing";
  }

  // Default to curious if no emotion detected
  return "curious";
};











// Get random response for an emotion
const getRandomResponse = (emotion) => {
  const responses = EMOTION_RESPONSES[emotion] || EMOTION_RESPONSES.curious;
  return responses[Math.floor(Math.random() * responses.length)];
};

// Particle system for emotion visualization
const ParticleSystem = ({ type, color, count = 20 }) => {
  const particles = useRef();
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push(
        (Math.random() - 0.5) * 3,
        Math.random() * 3,
        (Math.random() - 0.5) * 3
      );
    }
    return new Float32Array(pos);
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (particles.current) {
      const positions = particles.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // Different movement patterns based on emotion type
        if (type === "stars") {
          positions[i + 1] += 0.01 + Math.sin(time + i) * 0.005;
        } else if (type === "raindrops") {
          positions[i + 1] -= 0.02;
        } else if (type === "confetti") {
          positions[i] += Math.sin(time + i) * 0.01;
          positions[i + 1] -= 0.01;
          positions[i + 2] += Math.cos(time + i) * 0.01;
        } else if (type === "zs") {
          positions[i] += Math.sin(time + i) * 0.005;
          positions[i + 1] += 0.01;
        } else if (type === "foodIcons") {
          positions[i] += Math.sin(time + i) * 0.01;
          positions[i + 1] -= 0.015;
        } else if (type === "hearts") {
          positions[i] += Math.sin(time + i) * 0.01;
          positions[i + 1] += Math.cos(time + i) * 0.01;
        } else if (type === "questionMarks" || type === "exclamationMarks") {
          positions[i + 1] += 0.01;
        } else if (type === "musicNotes") {
          positions[i] += Math.sin(time + i) * 0.01;
          positions[i + 1] += 0.01;
          positions[i + 2] += Math.cos(time + i) * 0.01;
        } else if (type === "thoughtBubbles") {
          positions[i] += Math.sin(time + i) * 0.005;
          positions[i + 1] += 0.005;
        } else if (type === "hahas") {
          positions[i] += Math.sin(time + i) * 0.01;
          positions[i + 1] += 0.01;
        } else if (type === "toys") {
          positions[i] += Math.sin(time + i) * 0.02;
          positions[i + 1] = Math.sin(time * 2 + i) * 0.5 + 1;
          positions[i + 2] += Math.cos(time + i) * 0.02;
        }

        // Reset particles that go out of bounds
        if (positions[i + 1] < -2) positions[i + 1] = 3;
        if (positions[i + 1] > 3) positions[i + 1] = -2;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Different shapes based on emotion type
  let geometry;
  if (type === "stars") {
    geometry = <dodecahedronGeometry args={[0.05]} />;
  } else if (type === "raindrops") {
    geometry = <sphereGeometry args={[0.03, 8, 8]} />;
  } else if (type === "confetti") {
    geometry = <boxGeometry args={[0.05, 0.05, 0.01]} />;
  } else if (type === "zs") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            Z
          </Text>
        ))}
      </group>
    );
  } else if (type === "foodIcons") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            {["🍖", "🍗", "🥩", "🍕", "🍔"][Math.floor(Math.random() * 5)]}
          </Text>
        ))}
      </group>
    );
  } else if (type === "hearts") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            ❤️
          </Text>
        ))}
      </group>
    );
  } else if (type === "questionMarks") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            ?
          </Text>
        ))}
      </group>
    );
  } else if (type === "exclamationMarks") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            !
          </Text>
        ))}
      </group>
    );
  } else if (type === "musicNotes") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            {["♪", "♫", "♬", "♩", "♭"][Math.floor(Math.random() * 5)]}
          </Text>
        ))}
      </group>
    );
  } else if (type === "thoughtBubbles") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            💭
          </Text>
        ))}
      </group>
    );
  } else if (type === "hahas") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            {
              ["Ha!", "Hehe", "LOL", "Haha", "😂"][
                Math.floor(Math.random() * 5)
              ]
            }
          </Text>
        ))}
      </group>
    );
  } else if (type === "toys") {
    return (
      <group>
        {[...Array(5)].map((_, i) => (
          <Text
            key={i}
            position={[
              (Math.random() - 0.5) * 2,
              1 + Math.random() * 2,
              (Math.random() - 0.5) * 2,
            ]}
            color={color}
            fontSize={0.2}
            font="/fonts/Inter_Bold.json"
          >
            {["🎾", "🧸", "🪀", "🎮", "🎯"][Math.floor(Math.random() * 5)]}
          </Text>
        ))}
      </group>
    );
  }

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      {geometry}
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
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
  )
}
// Mountain component for environment
const Mountain = ({ position, scale = 1, color = "#A9A9A9" }) => {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <coneGeometry args={[1, 2, 4, 1]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}

// Sun component for environment
const Sun = ({ timeOfDay }) => {
  const isVisible = timeOfDay === "morning" || timeOfDay === "day"
  const position = timeOfDay === "morning" ? [10, 3, -15] : [0, 15, -15]

  if (!isVisible) return null

  return (
    <mesh position={position}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#FFFF00" />
      <pointLight color="#FFFFFF" intensity={1} distance={100} decay={2} />
    </mesh>
  )
}

// Enhanced ground with better textures
const EnhancedGround = ({ theme }) => {
  // Different ground colors based on environment theme
  const groundColors = {
    forest: "#2d5a27", // Deep green
    beach: "#f5deb3", // Sandy color
    park: "#4a7c3a", // Grass green
    home: "#8b7d6b", // Indoor floor
    space: "#1a1a2e", // Dark space color
  }

  const groundColor = groundColors[theme] || "#4a7c3a" // Default to park grass

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[30, 30, 32, 32]} />
      <meshStandardMaterial color={groundColor} roughness={0.8} metalness={0.1} wireframe={false} />
    </mesh>
  )
}








// Realistic Dog Model - Enhanced with blinking, facial expressions, and better connections
const RealisticDog = ({
  color = "golden",
  emotion,
  onInteract,
  isTalking = false,
}) => {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const [breathingScale, setBreathingScale] = useState(1);
  const [tailWag, setTailWag] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  const [earTwitch, setEarTwitch] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [legRaise, setLegRaise] = useState(0);
  const [bodyBounce, setBodyBounce] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(0);
  const [danceMoves, setDanceMoves] = useState(0);
  const [eyebrowRaise, setEyebrowRaise] = useState(0)
  const [walkCycle, setWalkCycle] = useState(0)
  const [walkDirection, setWalkDirection] = useState([0, 0])
  const [isWalking, setIsWalking] = useState(false)
  const [tears, setTears] = useState(0) // For sad emotion
  const [jumpHeight, setJumpHeight] = useState(0) // For jumping animation
  const [isJumping, setIsJumping] = useState(false)
  const [position, setPosition] = useState([0, -0.5, 0])
  const [rotation, setRotation] = useState([0, 0, 0])


 // Show emotion particles
 const [showParticles, setShowParticles] = useState(false)

  // Color mapping
  const colorMap = {
    golden: "#D4A76A",
    brown: "#8B4513",
    black: "#2D2D2D",
    white: "#F5F5F5",
    gray: "#808080",
  };

  const mainColor = colorMap[color] || colorMap.golden;
  const secondaryColor = hovered
    ? new THREE.Color(mainColor).offsetHSL(0, 0.1, 0.1).getStyle()
    : mainColor;
  const darkColor = new THREE.Color(mainColor).offsetHSL(0, 0, -0.2).getStyle();
  const lightColor = new THREE.Color(mainColor)
    .offsetHSL(0, -0.1, 0.2)
    .getStyle();

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      // Quick blink animation
      setEyeBlink(1);
      setTimeout(() => setEyeBlink(0), 150);
    }, Math.random() * 3000 + 2000); // Random blink between 2-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

// Talking mouth animation
useEffect(() => {
  if (isTalking) {
    const talkingInterval = setInterval(() => {
      setMouthOpen(Math.random() * 0.3 + 0.1) // Random mouth movement
    }, 150)

    return () => clearInterval(talkingInterval)
  }
}, [isTalking])


// Idle walking behavior
useEffect(() => {
  const idleTimeout = setTimeout(
    () => {
      if (!isJumping && emotion !== "dancing") {
        setIsWalking(true)
        // Random direction
        const angle = Math.random() * Math.PI * 2
        setWalkDirection([Math.sin(angle) * 0.01, Math.cos(angle) * 0.01])
        setRotation([0, angle, 0])

        // Walk for a random duration
        const walkDuration = Math.random() * 5000 + 3000
        setTimeout(() => {
          setIsWalking(false)
        }, walkDuration)
      }
    },
    Math.random() * 30000 + 15000,
  ) // Random between 15-45 seconds of inactivity

  return () => clearTimeout(idleTimeout)
}, [isWalking, isJumping, emotion])

// Jump animation
useEffect(() => {
  if (emotion === "excited" && !isJumping) {
    setIsJumping(true)

    // Jump animation
    const jumpUp = () => {
      let height = 0
      const jumpInterval = setInterval(() => {
        height += 0.05
        setJumpHeight(height)
        if (height >= 0.5) {
          clearInterval(jumpInterval)
          jumpDown()
        }
      }, 50)
    }

    const jumpDown = () => {
      let height = 0.5
      const fallInterval = setInterval(() => {
        height -= 0.05
        setJumpHeight(height)
        if (height <= 0) {
          clearInterval(fallInterval)
          setJumpHeight(0)
          setIsJumping(false)
        }
      }, 50)
    }

    jumpUp()
  }
}, [emotion, isJumping])

// Show emotion particles when emotion changes
useEffect(() => {
  setShowParticles(true)
  const timeout = setTimeout(() => {
    setShowParticles(false)
  }, 3000) // Show particles for 3 seconds

  return () => clearTimeout(timeout)
}, [emotion])







  // Animations based on emotion
  useFrame((state) => {
    if (group.current) {
      const time = state.clock.getElapsedTime();
  // Basic breathing animation
  const breathing = Math.sin(time * 1.5) * 0.015
  setBreathingScale(1 + breathing)

  // Walking animation
  if (isWalking) {
    setWalkCycle(time * 5)
    // Update position based on walk direction
    setPosition((prev) => [prev[0] + walkDirection[0], prev[1], prev[2] + walkDirection[1]])
  }
    // Boundary check - reverse direction if hitting boundaries
    if (Math.abs(position[0]) > 3 || Math.abs(position[2]) > 3) {
      setWalkDirection((prev) => [-prev[0], -prev[1]])
      setRotation((prev) => [prev[0], prev[1] + Math.PI, prev[2]])
    }
   

      // Enhanced emotional responses
      if (emotion === "happy") {
        // Happy dog - tail wagging, slight bounce, happy face
        setTailWag(Math.sin(time * 5) * 0.6);
        setBodyBounce(Math.sin(time * 3) * 0.05);
        setMouthOpen(0.2 + Math.sin(time * 2) * 0.1); // Happy panting
      } else if (emotion === "sad") {
        // Sad dog - droopy head, slow tail, sad face
        setHeadTilt(-0.2 + Math.sin(time * 0.3) * 0.05);
        setTailWag(Math.sin(time * 0.5) * 0.1);
        setMouthOpen(-0.1 + Math.sin(time * 0.5) * 0.03);
        // Sad eyebrows handled in the mesh directly
      } else if (emotion === "excited" || emotion === "dancing") {
        // Excited dog - jumping, fast tail wag
        setBodyBounce(Math.sin(time * 4) * 0.08);
        setTailWag(Math.sin(time * 6) * 0.7);
        setMouthOpen(0.3 + Math.sin(time * 3) * 0.1); // Excited panting

        if (emotion === "dancing") {
          setDanceMoves(Math.sin(time * 2) * 0.5)
          group.current.rotation.y = Math.sin(time * 2) * 0.5
          group.current.rotation.z = Math.sin(time * 3) * 0.1
        }
      } else if (emotion === "curious") {
        // Curious dog - head tilt, perked ears
        setHeadTilt(Math.sin(time * 0.5) * 0.3)
        setEarTwitch(Math.sin(time * 3) * 0.15)
        setMouthOpen(0.05 + Math.sin(time * 0.5) * 0.05)
        setEyebrowRaise(0.1)
        setTears(0)
      } else if (emotion === "scared") {
        // Scared dog - cowering, ears back
        setHeadTilt(-0.1)
        setBodyBounce(-0.05)
        setTailWag(0)
        setEyebrowRaise(-0.1)
        setEarTwitch(-0.2)
        setTears(0)
      } else if (emotion === "loving") {
        // Loving dog - gentle tail wag, relaxed posture
        setTailWag(Math.sin(time * 2) * 0.4)
        setBodyBounce(Math.sin(time * 1) * 0.02)
        setMouthOpen(0.1)
        setEyebrowRaise(0.05)
        setTears(0)
      } else if (emotion === "playful") {
        // Playful dog - bouncy, active tail
        setBodyBounce(Math.sin(time * 5) * 0.1)
        setTailWag(Math.sin(time * 4) * 0.8)
        setMouthOpen(0.15 + Math.sin(time * 2) * 0.1)
        setEyebrowRaise(0.1)
        setLegRaise(Math.sin(time * 3) * 0.2)
        setTears(0)
      } else if (emotion === "laughing") {
        // Laughing dog - shaking body, open mouth
        setBodyBounce(Math.sin(time * 6) * 0.06)
        setTailWag(Math.sin(time * 3) * 0.5)
        setMouthOpen(0.3 + Math.sin(time * 4) * 0.1)
        setEyebrowRaise(0.2)
        setTears(0)
      } else {
        // Default animations
        setTailWag(Math.sin(time * 2) * 0.3)
        setHeadTilt(Math.sin(time * 0.3) * 0.05)
        setEarTwitch(Math.sin(time * 1) * 0.03)
        setMouthOpen(Math.sin(time * 0.5) * 0.05)
        setEyebrowRaise(0)
        setTears(0)
      }

  // Apply animations
  if (group.current) {
    if (emotion === "dancing") {
      // Dancing animation
      group.current.position.y = bodyBounce + jumpHeight
      group.current.rotation.y = danceMoves * 0.5
      group.current.rotation.z = Math.sin(time * 3) * 0.1
    } else if (isWalking) {
      // Walking animation
      group.current.position.x = position[0]
      group.current.position.y = bodyBounce + Math.abs(Math.sin(walkCycle) * 0.1) + jumpHeight
      group.current.position.z = position[2]
      group.current.rotation.y = rotation[1]
    } else {
      // Normal animation
      group.current.position.x = position[0]
      group.current.position.y = bodyBounce + jumpHeight
      group.current.position.z = position[2]
      group.current.rotation.y = rotation[1]
    }
    group.current.scale.set(breathingScale, breathingScale, breathingScale)
  }
}
})

  return (
    <group
      ref={group}
      onClick={onInteract}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, -0.5, 0]} // Lower the dog to stand on the ground
    >
      {/* Main body - more natural proportions */}
      <group>
        {/* Torso - horizontal oval shape */}
        <mesh position={[0, 0.35, 0]} scale={[1, 0.7, 1.4]}>
          <sphereGeometry args={[0.35, 24, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Lower body/hip area - properly connected to torso */}
        <mesh position={[0, 0.3, -0.3]} scale={[0.9, 0.65, 0.7]}>
          <sphereGeometry args={[0.35, 24, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Chest - slightly lighter */}
        <mesh position={[0, 0.2, 0.35]} scale={[0.8, 0.6, 0.6]}>
          <sphereGeometry args={[0.35, 24, 16]} />
          <meshStandardMaterial color={lightColor} roughness={0.7} />
        </mesh>

        {/* Neck - connecting body to head */}
        <mesh position={[0, 0.45, 0.45]} scale={[0.7, 0.7, 0.5]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Connection points for legs - make them blend with the body */}
        {/* Front Left Connection */}
        <mesh position={[-0.2, 0.15, 0.3]} scale={[0.3, 0.3, 0.3]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Front Right Connection */}
        <mesh position={[0.2, 0.15, 0.3]} scale={[0.3, 0.3, 0.3]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Back Left Connection */}
        <mesh position={[-0.2, 0.15, -0.3]} scale={[0.3, 0.3, 0.3]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Back Right Connection */}
        <mesh position={[0.2, 0.15, -0.3]} scale={[0.3, 0.3, 0.3]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Tail connection point */}
        <mesh position={[0, 0.3, -0.5]} scale={[0.25, 0.25, 0.25]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Head group - properly positioned and sized */}
      <group position={[0, 0.65, 0.65]} rotation={[headTilt, 0, 0]}>
        {/* Main head - slightly oval */}
        <mesh scale={[0.8, 0.75, 0.8]}>
          <sphereGeometry args={[0.25, 24, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Eyebrows - fixed position but move for emotions */}
        <mesh
          position={[-0.12, 0.12, 0.15]}
          rotation={[
            emotion === "sad" ? -0.3 : emotion === "angry" ? -0.2 : 0,
            0,
            0,
          ]}
          scale={[0.1, 0.02, 0.05]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={darkColor} roughness={0.8} />
        </mesh>
        <mesh
          position={[0.12, 0.12, 0.15]}
          rotation={[
            emotion === "sad" ? -0.3 : emotion === "angry" ? -0.2 : 0,
            0,
            0,
          ]}
          scale={[0.1, 0.02, 0.05]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={darkColor} roughness={0.8} />
        </mesh>

        {/* Muzzle - properly attached to face */}
        <group position={[0, -0.05, 0.15]}>
          {/* Upper muzzle */}
          <mesh scale={[0.6, 0.4, 0.7]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={mainColor} roughness={0.7} />
          </mesh>

          {/* Lower muzzle/jaw - animated for talking */}
          <mesh
            position={[0, -0.08, 0]}
            rotation={[mouthOpen, 0, 0]}
            scale={[0.55, 0.3, 0.65]}
          >
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color={mainColor} roughness={0.7} />
          </mesh>

          {/* Nose - black and shiny */}
          <mesh position={[0, 0, 0.15]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color="#000000"
              roughness={0.2}
              metalness={0.2}
            />
          </mesh>

          {/* Mouth line */}
          <mesh position={[0, -0.1, 0.1]} rotation={[mouthOpen / 2, 0, 0]}>
            <boxGeometry args={[0.1, 0.01, 0.1]} />
            <meshStandardMaterial color="#5C4033" roughness={0.3} />
          </mesh>

          {/* Tongue - visible when mouth open */}
          {mouthOpen > 0.1 && (
            <mesh position={[0, -0.12, 0.05]} rotation={[mouthOpen, 0, 0]}>
              <boxGeometry args={[0.08, 0.02, 0.1]} />
              <meshStandardMaterial color="#FF6B6B" roughness={0.3} />
            </mesh>
          )}
        </group>

        {/* Eyes with blinking - more realistic with black pupils */}
        <group position={[-0.12, 0.05, 0.15]}>
          {/* Eye white */}
          <mesh scale={[1, 1 - eyeBlink, 1]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
          {/* Pupil - black */}
          <mesh
            position={[0, 0, 0.02]}
            scale={[0.6, 0.6 * (1 - eyeBlink), 0.6]}
          >
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
        </group>

        <group position={[0.12, 0.05, 0.15]}>
          {/* Eye white */}
          <mesh scale={[1, 1 - eyeBlink, 1]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
          {/* Pupil - black */}
          <mesh
            position={[0, 0, 0.02]}
            scale={[0.6, 0.6 * (1 - eyeBlink), 0.6]}
          >
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
        </group>

        {/* Ears - properly positioned on top of head */}
        <mesh
          position={[-0.15, 0.18, -0.05]}
          rotation={[0.2, -0.3 + earTwitch, -0.2]}
        >
          <coneGeometry args={[0.08, 0.2, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh
          position={[0.15, 0.18, -0.05]}
          rotation={[0.2, 0.3 - earTwitch, 0.2]}
        >
          <coneGeometry args={[0.08, 0.2, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Inner ears */}
        <mesh
          position={[-0.15, 0.18, -0.05]}
          rotation={[0.2, -0.3 + earTwitch, -0.2]}
          scale={[0.7, 0.7, 0.7]}
        >
          <coneGeometry args={[0.06, 0.15, 16]} />
          <meshStandardMaterial color={lightColor} roughness={0.6} />
        </mesh>
        <mesh
          position={[0.15, 0.18, -0.05]}
          rotation={[0.2, 0.3 - earTwitch, 0.2]}
          scale={[0.7, 0.7, 0.7]}
        >
          <coneGeometry args={[0.06, 0.15, 16]} />
          <meshStandardMaterial color={lightColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Legs - properly positioned and proportioned */}
      {/* Front Left - better connected to body */}
      <group position={[-0.2, 0, 0.3]}>
        {/* Connection joint */}
        <mesh position={[0, 0, 0]} scale={[0.07, 0.07, 0.07]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.15, 0]} rotation={[legRaise, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.3, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.35, 0]} rotation={[legRaise / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.5, 0.02]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Front Right - better connected to body */}
      <group position={[0.2, 0, 0.3]}>
        {/* Connection joint */}
        <mesh position={[0, 0, 0]} scale={[0.07, 0.07, 0.07]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.3, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.5, 0.02]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Back Left - better connected to body */}
      <group position={[-0.2, 0, -0.3]}>
        {/* Connection joint */}
        <mesh position={[0, 0, 0]} scale={[0.07, 0.07, 0.07]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.3, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.5, 0.02]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Back Right - better connected to body */}
      <group position={[0.2, 0, -0.3]}>
        {/* Connection joint */}
        <mesh position={[0, 0, 0]} scale={[0.07, 0.07, 0.07]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.3, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.5, 0.02]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Tail - properly connected to body */}
      <group position={[0, 0.3, -0.5]} rotation={[0.5, tailWag, 0]}>
        <mesh position={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.05, 0.03, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, -0.25]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.02, 0.2, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.05, -0.35]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.7} />
        </mesh>
      </group>

    </group>
  );
};

// Realistic Cat Model - Enhanced with blinking, facial expressions, and better connections
const RealisticCat = ({
  color = "orange",
  emotion,
  onInteract,
  isTalking = false,
}) => {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const [breathingScale, setBreathingScale] = useState(1);
  const [tailSwish, setTailSwish] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  const [earTwitch, setEarTwitch] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [pawLift, setPawLift] = useState(0);
  const [bodyStretch, setBodyStretch] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(0);
  const [pupilDilation, setPupilDilation] = useState(1);
  const [danceMoves, setDanceMoves] = useState(0);

  // Color mapping
  const colorMap = {
    orange: "#E0853D",
    black: "#2D2D2D",
    white: "#F5F5F5",
    gray: "#808080",
    brown: "#8B4513",
    calico: "#E0853D", // Base color for calico, patterns added in mesh
  };

  const mainColor = colorMap[color] || colorMap.orange;
  const secondaryColor = hovered
    ? new THREE.Color(mainColor).offsetHSL(0, 0.1, 0.1).getStyle()
    : mainColor;
  const darkColor = new THREE.Color(mainColor).offsetHSL(0, 0, -0.2).getStyle();
  const lightColor = new THREE.Color(mainColor)
    .offsetHSL(0, -0.1, 0.2)
    .getStyle();

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      // Quick blink animation
      setEyeBlink(1);
      setTimeout(() => setEyeBlink(0), 150);
    }, Math.random() * 3000 + 2000); // Random blink between 2-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Talking mouth animation
  useEffect(() => {
    if (isTalking) {
      const talkingInterval = setInterval(() => {
        setMouthOpen(Math.random() * 0.2 + 0.05); // Random mouth movement
      }, 150);

      return () => clearInterval(talkingInterval);
    }
  }, [isTalking]);

  // Animations based on emotion
  useFrame((state) => {
    if (group.current) {
      const time = state.clock.getElapsedTime();

      // Basic breathing animation
      const breathing = Math.sin(time * 1.2) * 0.015;
      setBreathingScale(1 + breathing);

      // Tail swishing
      let tailSpeed = 1.5; // default speed
      let tailAmplitude = 0.4; // default amplitude

      if (emotion === "happy" || emotion === "excited") {
        tailSpeed = 3;
        tailAmplitude = 0.7;
      } else if (emotion === "alert" || emotion === "curious") {
        tailSpeed = 2;
        tailAmplitude = 0.5;
      } else if (emotion === "sad" || emotion === "scared") {
        tailSpeed = 0.5;
        tailAmplitude = 0.2;
      }

      setTailSwish(Math.sin(time * tailSpeed) * tailAmplitude);

      // Head tilting
      if (emotion === "curious" || emotion === "thinking") {
        setHeadTilt(Math.sin(time * 0.5) * 0.3);
      } else if (emotion === "sad") {
        setHeadTilt(-0.2 + Math.sin(time * 0.3) * 0.05); // Drooping head for sadness
      } else {
        setHeadTilt(Math.sin(time * 0.3) * 0.05);
      }

      // Ear twitching
      if (emotion === "alert" || emotion === "curious") {
        setEarTwitch(Math.sin(time * 4) * 0.15);
      } else {
        setEarTwitch(Math.sin(time * 1.5) * 0.05);
      }

      // Mouth opening (if not talking)
      if (!isTalking) {
        if (emotion === "hungry" || emotion === "meowing") {
          setMouthOpen(0.15 + Math.sin(time * 2) * 0.1);
        } else if (emotion === "sad") {
          setMouthOpen(-0.1 + Math.sin(time * 0.5) * 0.03); // Frown for sadness
        } else {
          setMouthOpen(Math.sin(time * 0.5) * 0.03);
        }
      }

      // Pupil dilation based on emotion
      if (
        emotion === "excited" ||
        emotion === "alert" ||
        emotion === "scared"
      ) {
        setPupilDilation(1.5 + Math.sin(time) * 0.2); // Dilated pupils
      } else if (emotion === "sleepy") {
        setPupilDilation(0.5); // Constricted pupils
      } else {
        setPupilDilation(1 + Math.sin(time * 0.5) * 0.1); // Normal with subtle changes
      }

      // Paw lifting (for grooming or playful pose)
      if (emotion === "playful" || emotion === "curious") {
        setPawLift(0.2 + Math.sin(time * 1.5) * 0.1);
      } else {
        setPawLift(0);
      }

      // Body stretching
      if (emotion === "sleepy" || emotion === "relaxed") {
        setBodyStretch(0.1 + Math.sin(time * 0.5) * 0.05);
      } else {
        setBodyStretch(0);
      }

      // Dancing animation
      if (emotion === "dancing") {
        setDanceMoves(Math.sin(time * 2) * 0.5);
      } else {
        setDanceMoves(0);
      }

      // Apply animations
      if (group.current) {
        if (emotion === "dancing") {
          // Dancing animation
          group.current.position.y = Math.sin(time * 4) * 0.05;
          group.current.rotation.y = danceMoves * 0.5;
          group.current.rotation.z = Math.sin(time * 3) * 0.1;
        } else {
          group.current.position.y = Math.sin(time * 1) * 0.01; // subtle body movement
          group.current.rotation.y = 0;
          group.current.rotation.z = 0;
        }
        group.current.scale.set(breathingScale, breathingScale, breathingScale);
      }
    }
  });

  return (
    <group
      ref={group}
      onClick={onInteract}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, -0.5, 0]} // Lower the cat to stand on the ground
    >
      {/* Main body - sleek and slender */}
      <group>
        {/* Torso - oval shape */}
        <mesh position={[0, 0.35, 0]} scale={[0.8, 0.6, 1.2 + bodyStretch]}>
          <sphereGeometry args={[0.3, 24, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Lower body/hip area */}
        <mesh position={[0, 0.3, -0.25]} scale={[0.75, 0.55, 0.6]}>
          <sphereGeometry args={[0.3, 24, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Chest - slightly lighter */}
        <mesh position={[0, 0.2, 0.25]} scale={[0.7, 0.5, 0.5]}>
          <sphereGeometry args={[0.3, 24, 16]} />
          <meshStandardMaterial color={lightColor} roughness={0.7} />
        </mesh>

        {/* Neck - thinner than dog */}
        <mesh position={[0, 0.4, 0.35]} scale={[0.6, 0.6, 0.4]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Connection points for legs - make them blend with the body */}
        {/* Front Left Connection */}
        <mesh position={[-0.15, 0.15, 0.25]} scale={[0.25, 0.25, 0.25]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Front Right Connection */}
        <mesh position={[0.15, 0.15, 0.25]} scale={[0.25, 0.25, 0.25]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Back Left Connection */}
        <mesh position={[-0.15, 0.15, -0.25]} scale={[0.25, 0.25, 0.25]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Back Right Connection */}
        <mesh position={[0.15, 0.15, -0.25]} scale={[0.25, 0.25, 0.25]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Tail connection point */}
        <mesh position={[0, 0.3, -0.4]} scale={[0.2, 0.2, 0.2]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Head - more triangular than dog */}
      <group position={[0, 0.6, 0.55]} rotation={[headTilt, 0, 0]}>
        {/* Main head - slightly triangular */}
        <mesh scale={[0.7, 0.65, 0.7]}>
          <sphereGeometry args={[0.22, 24, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Muzzle - smaller than dog's */}
        <group position={[0, -0.05, 0.12]}>
          {/* Upper muzzle */}
          <mesh scale={[0.5, 0.3, 0.5]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={mainColor} roughness={0.7} />
          </mesh>

          {/* Nose - pink */}
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color="#FF69B4" roughness={0.2} />
          </mesh>

          {/* Mouth line - animated for talking */}
          <mesh position={[0, -0.08, 0.05]} rotation={[mouthOpen / 2, 0, 0]}>
            <boxGeometry args={[0.05, 0.01, 0.05]} />
            <meshStandardMaterial color="#5C4033" roughness={0.3} />
          </mesh>
        </group>

        {/* Eyes with blinking and pupil dilation */}
        <group position={[-0.1, 0.05, 0.12]} rotation={[0, 0.3, 0.3]}>
          {/* Eye white */}
          <mesh scale={[1, 1 - eyeBlink, 1]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
          {/* Pupil - vertical slit that dilates */}
          <mesh
            position={[0, 0, 0.02]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[
              0.2 * pupilDilation,
              1 * (1 - eyeBlink),
              0.2 * pupilDilation,
            ]}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color="#000000"
              emissive="#00FF00"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        <group position={[0.1, 0.05, 0.12]} rotation={[0, -0.3, -0.3]}>
          {/* Eye white */}
          <mesh scale={[1, 1 - eyeBlink, 1]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
          {/* Pupil - vertical slit that dilates */}
          <mesh
            position={[0, 0, 0.02]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[
              0.2 * pupilDilation,
              1 * (1 - eyeBlink),
              0.2 * pupilDilation,
            ]}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color="#000000"
              emissive="#00FF00"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* Ears - triangular and pointed */}
        <mesh
          position={[-0.12, 0.18, -0.05]}
          rotation={[0.2, -0.3 + earTwitch, -0.2]}
          scale={[0.6, 1, 0.6]}
        >
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh
          position={[0.12, 0.18, -0.05]}
          rotation={[0.2, 0.3 - earTwitch, 0.2]}
          scale={[0.6, 1, 0.6]}
        >
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Inner ears */}
        <mesh
          position={[-0.12, 0.18, -0.05]}
          rotation={[0.2, -0.3 + earTwitch, -0.2]}
          scale={[0.4, 0.8, 0.4]}
        >
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.6} />
        </mesh>
        <mesh
          position={[0.12, 0.18, -0.05]}
          rotation={[0.2, 0.3 - earTwitch, 0.2]}
          scale={[0.4, 0.8, 0.4]}
        >
          <coneGeometry args={[0.08, 0.15, 3]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.6} />
        </mesh>

        {/* Whiskers */}
        {[-0.1, 0.1].map((x) => (
          <group key={x} position={[x, -0.05, 0.15]}>
            {[30, 0, -30].map((angle) => (
              <mesh key={angle} rotation={[0, 0, (angle * Math.PI) / 180]}>
                <cylinderGeometry args={[0.001, 0.001, 0.2, 3]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Legs - thinner than dog's */}
      {/* Front Left */}
      <group position={[-0.15, 0, 0.25]}>
        <mesh position={[0, -0.15, 0]} rotation={[pawLift, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0]} rotation={[pawLift / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.2, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.4, 0.02]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Front Right */}
      <group position={[0.15, 0, 0.25]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.2, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.4, 0.02]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Back Left */}
      <group position={[-0.15, 0, -0.25]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.2, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.4, 0.02]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Back Right */}
      <group position={[0.15, 0, -0.25]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.2, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.4, 0.02]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Tail - long and flexible */}
      <group position={[0, 0.3, -0.4]}>
        <mesh position={[0, 0, -0.1]} rotation={[0.8, tailSwish, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh
          position={[tailSwish * 0.2, 0.1, -0.25]}
          rotation={[1.2, tailSwish * 1.2, 0]}
        >
          <cylinderGeometry args={[0.03, 0.02, 0.25, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh
          position={[tailSwish * 0.4, 0.2, -0.4]}
          rotation={[1.5, tailSwish * 1.5, 0]}
        >
          <cylinderGeometry args={[0.02, 0.01, 0.2, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[tailSwish * 0.5, 0.25, -0.5]}>
          <sphereGeometry args={[0.015, 12, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Hover tooltip */}
   
    </group>
  );
};

// Realistic Bird Model - Enhanced with blinking, facial expressions, and better connections
const RealisticBird = ({
  color = "blue",
  emotion,
  onInteract,
  isTalking = false,
}) => {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const [breathingScale, setBreathingScale] = useState(1);
  const [wingFlap, setWingFlap] = useState(0);
  const [headTurn, setHeadTurn] = useState(0);
  const [tailWag, setTailWag] = useState(0);
  const [beakOpen, setBeakOpen] = useState(0);
  const [bodyBounce, setBodyBounce] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(0);
  const [danceMoves, setDanceMoves] = useState(0);

  // Color mapping
  const colorMap = {
    blue: "#4169E1",
    red: "#DC143C",
    yellow: "#FFD700",
    green: "#32CD32",
    white: "#F5F5F5",
    black: "#2D2D2D",
  };

  const mainColor = colorMap[color] || colorMap.blue;
  const secondaryColor = hovered
    ? new THREE.Color(mainColor).offsetHSL(0, 0.1, 0.1).getStyle()
    : mainColor;
  const accentColor = new THREE.Color(mainColor)
    .offsetHSL(0.1, 0.2, 0.1)
    .getStyle();
  const lightColor = new THREE.Color(mainColor)
    .offsetHSL(0, -0.1, 0.2)
    .getStyle();

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      // Quick blink animation
      setEyeBlink(1);
      setTimeout(() => setEyeBlink(0), 150);
    }, Math.random() * 3000 + 2000); // Random blink between 2-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Talking beak animation
  useEffect(() => {
    if (isTalking) {
      const talkingInterval = setInterval(() => {
        setBeakOpen(Math.random() * 0.3 + 0.1); // Random beak movement
      }, 150);

      return () => clearInterval(talkingInterval);
    }
  }, [isTalking]);

  // Animations based on emotion
  useFrame((state) => {
    if (group.current) {
      const time = state.clock.getElapsedTime();

      // Basic breathing animation
      const breathing = Math.sin(time * 2) * 0.015;
      setBreathingScale(1 + breathing);

      // Wing flapping
      let flapSpeed = 0.5; // default speed (idle)
      let flapAmplitude = 0.1; // default amplitude (idle)

      if (emotion === "excited" || emotion === "happy") {
        flapSpeed = 8;
        flapAmplitude = 0.8;
      } else if (emotion === "alert") {
        flapSpeed = 4;
        flapAmplitude = 0.4;
      } else if (emotion === "sad") {
        flapSpeed = 0.3;
        flapAmplitude = 0.05; // Droopy wings when sad
      }

      setWingFlap(Math.sin(time * flapSpeed) * flapAmplitude);

      // Head turning
      if (emotion === "curious" || emotion === "thinking") {
        setHeadTurn(Math.sin(time * 0.8) * 0.5);
      } else if (emotion === "sad") {
        setHeadTurn(-0.2 + Math.sin(time * 0.4) * 0.1); // Drooping head for sadness
      } else {
        setHeadTurn(Math.sin(time * 0.4) * 0.2);
      }

      // Tail wagging
      setTailWag(Math.sin(time * 2) * 0.2);

      // Beak opening (if not talking)
      if (!isTalking) {
        if (emotion === "excited" || emotion === "happy") {
          setBeakOpen(0.2 + Math.sin(time * 4) * 0.1);
        } else if (emotion === "hungry") {
          setBeakOpen(0.3 + Math.sin(time * 2) * 0.1);
        } else if (emotion === "sad") {
          setBeakOpen(-0.1 + Math.sin(time * 0.5) * 0.05); // Slight frown for sadness
        } else {
          setBeakOpen(Math.sin(time * 0.5) * 0.05);
        }
      }

      // Body bouncing
      if (emotion === "dancing") {
        // Special dance animation
        setBodyBounce(Math.sin(time * 5) * 0.05);
        setDanceMoves(Math.sin(time * 2) * 0.5);
      } else if (emotion === "sad") {
        setBodyBounce(Math.sin(time * 0.5) * 0.01); // Less bouncy when sad
      } else {
        setBodyBounce(Math.sin(time * 1) * 0.01);
      }

      // Apply animations
      if (group.current) {
        if (emotion === "dancing") {
          // Dancing animation
          group.current.position.y = bodyBounce;
          group.current.rotation.y = danceMoves * 0.5;
          group.current.rotation.z = Math.sin(time * 3) * 0.1;
        } else {
          group.current.position.y = bodyBounce;
          group.current.rotation.y = 0;
          group.current.rotation.z = 0;
        }
        group.current.scale.set(breathingScale, breathingScale, breathingScale);
      }
    }
  });

  return (
    <group
      ref={group}
      onClick={onInteract}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, -0.3, 0]} // Position bird appropriately
    >
      {/* Body - oval shaped */}
      <mesh position={[0, 0.2, 0]} scale={[0.7, 0.8, 0.9]}>
        <sphereGeometry args={[0.25, 24, 16]} />
        <meshStandardMaterial color={mainColor} roughness={0.8} />
      </mesh>

      {/* Chest/breast - lighter color */}
      <mesh position={[0, 0.15, 0.15]} scale={[0.65, 0.7, 0.5]}>
        <sphereGeometry args={[0.25, 24, 16]} />
        <meshStandardMaterial color={lightColor} roughness={0.7} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.5, 0.15]} rotation={[0, headTurn, 0]}>
        {/* Main head - round */}
        <mesh scale={[0.7, 0.7, 0.7]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>

        {/* Beak - animated for talking */}
        <group position={[0, 0, 0.15]}>
          {/* Upper beak */}
          <mesh position={[0, 0, 0]} rotation={[-beakOpen / 2, 0, 0]}>
            <coneGeometry
              args={[0.05, 0.15, 4]}
              rotation={[0, Math.PI / 4, 0]}
            />
            <meshStandardMaterial color="#FF8C00" roughness={0.5} />
          </mesh>

          {/* Lower beak */}
          <mesh position={[0, -0.03, 0]} rotation={[beakOpen, 0, 0]}>
            <coneGeometry
              args={[0.04, 0.12, 4]}
              rotation={[0, Math.PI / 4, 0]}
            />
            <meshStandardMaterial color="#FF8C00" roughness={0.5} />
          </mesh>
        </group>

        {/* Eyes with blinking */}
        <group position={[-0.08, 0.05, 0.1]}>
          {/* Eye white */}
          <mesh scale={[1, 1 - eyeBlink, 1]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
          {/* Pupil */}
          <mesh
            position={[0, 0, 0.01]}
            scale={[0.6, 0.6 * (1 - eyeBlink), 0.6]}
          >
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
        </group>

        <group position={[0.08, 0.05, 0.1]}>
          {/* Eye white */}
          <mesh scale={[1, 1 - eyeBlink, 1]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
          {/* Pupil */}
          <mesh
            position={[0, 0, 0.01]}
            scale={[0.6, 0.6 * (1 - eyeBlink), 0.6]}
          >
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="#000000" roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Wings - connected to body */}
      {/* Left Wing */}
      <group position={[-0.2, 0.2, 0]} rotation={[0, 0, wingFlap]}>
        <mesh position={[-0.15, 0, 0]} scale={[1, 0.2, 0.8]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[-0.3, 0, 0]} scale={[0.8, 0.15, 0.6]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Right Wing */}
      <group position={[0.2, 0.2, 0]} rotation={[0, 0, -wingFlap]}>
        <mesh position={[0.15, 0, 0]} scale={[1, 0.2, 0.8]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshStandardMaterial color={mainColor} roughness={0.8} />
        </mesh>
        <mesh position={[0.3, 0, 0]} scale={[0.8, 0.15, 0.6]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Tail - connected to body */}
      <group position={[0, 0.15, -0.25]} rotation={[0, tailWag, 0]}>
        <mesh scale={[0.7, 0.2, 0.5]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Legs */}
      {/* Left Leg */}
      <mesh position={[-0.07, -0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#FF8C00" roughness={0.7} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.07, -0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#FF8C00" roughness={0.7} />
      </mesh>

      {/* Feet */}
      {/* Left Foot */}
      <mesh position={[-0.07, -0.2, 0.03]}>
        <boxGeometry args={[0.06, 0.02, 0.08]} />
        <meshStandardMaterial color="#FF8C00" roughness={0.7} />
      </mesh>

      {/* Right Foot */}
      <mesh position={[0.07, -0.2, 0.03]}>
        <boxGeometry args={[0.06, 0.02, 0.08]} />
        <meshStandardMaterial color="#FF8C00" roughness={0.7} />
      </mesh>

 
    </group>
  );
};

// Interactive environment with day/night cycle
const Environment3D = ({ theme, timeOfDay, weather }) => {
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

  useFrame(() => {
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

  return (
    <>
    {/* Sun */}
    <Sun timeOfDay={timeOfDay} />


{/* Enhanced ground */}
<EnhancedGround theme={ENVIRONMENTS} />
{/* Trees and mountains for forest and park environments */}
{(theme === "forest" || theme === "park") && (
  <>
    {/* Trees in a circle around the scene */}
    {useMemo(() => {
      const count = theme === "forest" ? 12 : 8;
      const distance = theme === "forest" ? 8 : 12;

      return [...Array(count)].map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.sin(angle) * distance;
        const z = Math.cos(angle) * distance;
        const y = -0.5; // Lowered slightly into ground
        const scale = 1;

        return <Tree key={`tree-${i}`} position={[x, y, z]} scale={scale} />;
      });
    }, [theme])}
  </>
)}
 {/* Mountains in the background for forest environment */}
{theme === "forest" && (
  <>
    <Mountain position={[-20, 0, -50]} scale={8} color="#6e6e6e" />
    <Mountain position={[15, 0, -55]} scale={10} color="#7d7d7d" />
    <Mountain position={[0, 0, -60]} scale={12} color="#8d8d8d" />
  </>
)}



      <Environment preset={ENVIRONMENTS[theme]} />
      <ambientLight intensity={timeOfDay === "night" ? 0.3 : 0.7} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={timeOfDay === "night" ? 0.5 : 1}
        castShadow
      />
      <Sky
        sunPosition={timeOfDay === "night" ? [0, -1, 0] : [1, 1, 1]}
        turbidity={1}
        rayleigh={1}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={weather === "snowy" ? "white" : "#6495ED"}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={
            theme === "forest"
              ? "#2d5a27"
              : theme === "beach"
              ? "#f5deb3"
              : "#808080"
          }
          roughness={0.8}
        />
      </mesh>
    </>
  );
};

// Chat interface component
const PetChat = ({ petName, onSendMessage, messages, emotion }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Card className="absolute bottom-4 right-4 w-80 h-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden z-20">
      <div className="flex flex-col h-full">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white font-medium">
          Chat with {petName}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] p-2 rounded-lg ${
                msg.from === "user"
                  ? "bg-blue-100 dark:bg-blue-900 ml-auto"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Talk to ${petName}...`}
            className="flex-1 mr-2"
          />
          <Button onClick={handleSend} size="sm">
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Main 3D pet display component
export function PetDisplay3D({
  petType = "dog",
  petColor = "golden",
  emotion = "happy",
  petName = "Buddy",
  accessories = [],
  environment = "park",
  onPlayGame,
}) {
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [weather, setWeather] = useState("clear");
  const [showParticles, setShowParticles] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [chatMessages, setChatMessages] = useState([
    {
      from: "pet",
      text: `Hi there! I'm ${petName}. How are you feeling today?`,
    },
  ]);
  const [showChat, setShowChat] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const { toast } = useToast();

  // Handle pet interaction
  const handlePetInteraction = () => {
    // Show chat interface when pet is clicked
    setShowChat(false);

    toast({
      title: `${petName} wants to chat with you!`,
      description: "Share how you're feeling today.",
      duration: 3000,
    });

    if (onPlayGame && typeof onPlayGame === "function") {
      onPlayGame();
    }

    // Show emotion particles
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 3000);
  };

  // Handle sending a message to the pet
  const handleSendMessage = (message) => {
    // Add user message to chat
    setChatMessages((prev) => [...prev, { from: "user", text: message }]);

    // Special interactive responses
    if (message.toLowerCase().includes("bark")) {
      // Make the dog bark
      setCurrentEmotion("excited");
      setShowParticles(true);

      // Add a barking message
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { from: "pet", text: "Woof! Woof! 🐶" },
        ]);
        setIsTalking(true);

        setTimeout(() => {
          setIsTalking(false);
        }, 1000);
      }, 500);

      return; // Skip the normal response
    } else if (
      message.toLowerCase().includes("jump") ||
      message.toLowerCase().includes("be happy")
    ) {
      // Make the dog jump/be happy
      setCurrentEmotion("excited");
      setShowParticles(true);

      // Add a happy jumping message
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { from: "pet", text: "Yay! I'm so happy! *jumps excitedly* 🐾" },
        ]);
        setIsTalking(true);

        setTimeout(() => {
          setIsTalking(false);
        }, 2000);
      }, 500);

      return; // Skip the normal response
    } else if (message.toLowerCase().includes("dance")) {
      // Make the dog dance
      setCurrentEmotion("dancing");
      setShowParticles(true);

      // Add a dancing message
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { from: "pet", text: "Look at my dance moves! 💃🐕" },
        ]);
        setIsTalking(true);

        setTimeout(() => {
          setIsTalking(false);
        }, 2000);
      }, 500);

      return; // Skip the normal response
    }

    // Detect emotion from message
    const detectedEmotion = detectEmotion(message);

    // Pet mirrors user's emotion
    setCurrentEmotion(detectedEmotion);

    // Show emotion particles
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 3000);

    // Get pet's response based on detected emotion
    const response = getRandomResponse(detectedEmotion);

    // Start talking animation
    setIsTalking(true);

    // Add pet's response after a short delay
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { from: "pet", text: response }]);

      // Stop talking animation after response duration (based on text length)
      const talkDuration = Math.min(response.length * 50, 3000);
      setTimeout(() => {
        setIsTalking(false);
      }, talkDuration);
    }, 1000);
  };

  // Simulate day/night cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay((prev) => {
        const cycle = ["morning", "day", "evening", "night"];
        const currentIndex = cycle.indexOf(prev);
        return cycle[(currentIndex + 1) % cycle.length];
      });
    }, 60000); // Change every minute for demo purposes

    return () => clearInterval(interval);
  }, []);

  // Occasionally change weather
  useEffect(() => {
    const interval = setInterval(() => {
      const weathers = ["clear", "rainy", "snowy"];
      setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    }, 120000); // Change every 2 minutes

    return () => clearInterval(interval);
  }, []);

  // Show emotion particles when emotion changes
  useEffect(() => {
    setShowParticles(true);
    const timeout = setTimeout(() => setShowParticles(false), 3000);
    return () => clearTimeout(timeout);
  }, [currentEmotion]);

  // Get emotion color
  const emotionColor = EMOTIONS[currentEmotion]?.color || "#FFD700";

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-100 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden">
      {/* Time of day indicator */}
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant="outline"
          className="bg-black/30 backdrop-blur-sm text-white"
        >
          {timeOfDay === "morning" && "🌅 Morning"}
          {timeOfDay === "day" && "☀️ Day"}
          {timeOfDay === "evening" && "🌇 Evening"}
          {timeOfDay === "night" && "🌙 Night"}
        </Badge>
      </div>

      {/* Weather indicator */}
      <div className="absolute top-4 left-4 z-10">
        <Badge
          variant="outline"
          className="bg-black/30 backdrop-blur-sm text-white"
        >
          {weather === "clear" && "☀️ Clear"}
          {weather === "rainy" && "🌧️ Rainy"}
          {weather === "snowy" && "❄️ Snowy"}
        </Badge>
      </div>

      {/* Pet name */}
      <div className="absolute top-16 left-4 z-10">
        <Badge
          variant="outline"
          className="bg-black/30 backdrop-blur-sm text-white"
        >
          {petName}
        </Badge>
      </div>

      {/* Current emotion */}
      <div className="absolute top-16 right-4 z-10">
        <Badge
          variant="outline"
          className="bg-black/30 backdrop-blur-sm text-white"
        >
          Feeling: {currentEmotion}
        </Badge>
      </div>

      {/* Chat toggle button */}
      <div className="absolute top-28 right-4 z-10">
        <Button
          size="sm"
          onClick={() => setShowChat(!showChat)}
          variant={showChat ? "default" : "outline"}
          className="bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
        >
          {showChat ? "Hide Chat" : "Chat with " + petName}
        </Button>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 1, 5], fov: 50 }}>
        <Environment3D
          theme={environment}
          timeOfDay={timeOfDay}
          weather={weather}
        />

        {/* Render the appropriate pet model based on petType */}
        {petType === "dog" && (
          <RealisticDog
            color={petColor}
            emotion={currentEmotion}
            onInteract={handlePetInteraction}
            isTalking={isTalking}
          />
        )}

        {petType === "cat" && (
          <RealisticCat
            color={petColor}
            emotion={currentEmotion}
            onInteract={handlePetInteraction}
            isTalking={isTalking}
          />
        )}

        {petType === "bird" && (
          <RealisticBird
            color={petColor}
            emotion={currentEmotion}
            onInteract={handlePetInteraction}
            isTalking={isTalking}
          />
        )}

        <OrbitControls
          enableZoom={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>

      {/* Chat interface */}
      {showChat && (
        <PetChat
          petName={petName}
          onSendMessage={handleSendMessage}
          messages={chatMessages}
          emotion={currentEmotion}
        />
      )}
    </div>
  );
}
