"use client";

import { useRef, useState, useImperativeHandle, forwardRef, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

// --- The actual avatar mesh, lives INSIDE the <Canvas> ---
function VrmAvatar({ vrmUrl, mouthDataRef }) {
  const vrmRef = useRef(null);
  const { camera } = useThree();

  const gltf = useLoader(GLTFLoader, vrmUrl, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  if (!vrmRef.current && gltf.userData.vrm) {
    const vrm = gltf.userData.vrm;
    VRMUtils.rotateVRM0(vrm); // safe no-op on VRM1.0, fixes backwards-facing VRM0.0 models
    vrm.lookAt.target = camera;
    vrmRef.current = vrm;
  }

  const dataArray = useRef(new Uint8Array(128));

  useFrame((state, delta) => {
    const vrm = vrmRef.current;
    if (!vrm) return;

    vrm.update(delta);

    // idle sway so she isn't frozen
    const elapsed = state.clock.getElapsedTime();
    vrm.scene.position.y = Math.sin(elapsed * 1.5) * 0.01;

    // Head and spine idle (breathing/looking)
    const spine = vrm.humanoid.getNormalizedBoneNode('spine');
    const head = vrm.humanoid.getNormalizedBoneNode('head');
    if (spine) {
      spine.rotation.x = Math.sin(elapsed * 2) * 0.02; // breathing
    }
    if (head) {
      head.rotation.y = Math.sin(elapsed * 0.8) * 0.05;
      head.rotation.x = Math.cos(elapsed * 0.8) * 0.03;
    }

    // blink every ~4s
    const blinkCycle = elapsed % 4;
    vrm.expressionManager?.setValue("blink", blinkCycle > 3.85 ? 1 : 0);

    const isSpeaking = mouthDataRef.current.isPlaying;
    const isWaving = mouthDataRef.current.isWaving;

    // Fix T-pose: Bring arms down to the sides
    const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
    const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
    const leftLowerArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
    const rightLowerArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');

    // To bring arms down from T-pose (horizontal):
    // Left arm points +X, rotating -Z brings it down
    // Right arm points -X, rotating +Z brings it down
    const armDownAngle = 1.2; // approx 70 degrees down

    if (leftUpperArm) {
      leftUpperArm.rotation.z = -armDownAngle; 
      leftUpperArm.rotation.x = 0.05; 
      leftUpperArm.rotation.y = 0.1;
    }
    
    if (rightUpperArm) {
      if (isWaving) {
        // Wave animation (Right arm UP)
        rightUpperArm.rotation.z = -2.0; 
        rightUpperArm.rotation.x = Math.sin(elapsed * 8) * 0.3;
        if (rightLowerArm) {
          rightLowerArm.rotation.z = -0.5;
        }
      } else {
        // Arms down
        rightUpperArm.rotation.z = armDownAngle; 
        rightUpperArm.rotation.x = 0.05;
        rightUpperArm.rotation.y = -0.1;
        if (rightLowerArm) {
          rightLowerArm.rotation.z = 0;
        }
      }
    }

    // Move hands naturally while speaking or idle
    if (isSpeaking && !isWaving) {
      // Natural conversational gestures (slight movements)
      if (leftUpperArm) leftUpperArm.rotation.x = 0.1 + Math.sin(elapsed * 2) * 0.05;
      if (rightUpperArm) rightUpperArm.rotation.x = 0.1 + Math.cos(elapsed * 2) * 0.05;
      if (leftLowerArm) leftLowerArm.rotation.x = -0.2 - Math.abs(Math.sin(elapsed * 2)) * 0.1;
      if (rightLowerArm) rightLowerArm.rotation.x = -0.2 - Math.abs(Math.cos(elapsed * 2)) * 0.1;
    } else {
      // Gentle idle arm sway
      if (leftUpperArm) leftUpperArm.rotation.x = 0.05 + Math.sin(elapsed) * 0.02;
      if (rightUpperArm && !isWaving) rightUpperArm.rotation.x = 0.05 + Math.cos(elapsed) * 0.02;
      if (leftLowerArm) leftLowerArm.rotation.x = -0.05;
      if (rightLowerArm && !isWaving) rightLowerArm.rotation.x = -0.05;
    }

    // lip sync driven by live ElevenLabs audio volume or simulated fallback
    if (isSpeaking) {
      if (mouthDataRef.current.analyser) {
        mouthDataRef.current.analyser.getByteFrequencyData(dataArray.current);
        const avg = dataArray.current.reduce((a, b) => a + b, 0) / dataArray.current.length;
        const mouthOpen = Math.min(avg / 60, 1); // tweak 60 if too strong/weak
        vrm.expressionManager?.setValue("aa", mouthOpen);
      } else if (mouthDataRef.current.simulatedMouthOpen !== undefined) {
        vrm.expressionManager?.setValue("aa", mouthDataRef.current.simulatedMouthOpen);
      }
    } else {
      vrm.expressionManager?.setValue("aa", 0);
    }
  });

  return gltf.userData.vrm ? <primitive object={gltf.userData.vrm.scene} /> : null;
}

// --- The exported component your page will use ---
const InterviewAvatar = forwardRef(function InterviewAvatar(
  { vrmUrl = "/models/avatar.vrm" },
  ref
) {
  const mouthDataRef = useRef({ isPlaying: false, isWaving: false, analyser: null });
  const audioContextRef = useRef(null);

  useImperativeHandle(ref, () => ({
    speak: async (text, voiceId) => {
      // Trigger wave if text contains hello/welcome
      if (text.toLowerCase().includes("hello") || text.toLowerCase().includes("welcome")) {
        mouthDataRef.current.isWaving = true;
        setTimeout(() => {
          mouthDataRef.current.isWaving = false;
        }, 3000); // Wave for 3 seconds
      }

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      });
      if (!res.ok) {
        console.error("ElevenLabs TTS request failed:", await res.text());
        console.log("Falling back to Browser Speech Synthesis...");
        
        // Fallback to browser TTS with simulated lip sync
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          mouthDataRef.current.isPlaying = true;
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.2; // slightly higher pitch for female voice
          
          // Force a female voice
          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(v => 
            (v.name.toLowerCase().includes('female') || 
             v.name.toLowerCase().includes('zira') || 
             v.name.toLowerCase().includes('samantha') ||
             v.name.toLowerCase().includes('victoria') ||
             v.name.toLowerCase().includes('karen') ||
             v.name.toLowerCase().includes('tessa') ||
             v.name.toLowerCase().includes('moira')) && 
             v.lang.startsWith('en')
          ) || voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira'));
          
          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }

          // Simulate Lip Sync (stores value in ref for useFrame to read)
          const simInterval = setInterval(() => {
            if (mouthDataRef.current.isPlaying) {
              mouthDataRef.current.simulatedMouthOpen = Math.random() * 0.8;
            }
          }, 100);

          utterance.onend = () => {
            mouthDataRef.current.isPlaying = false;
            mouthDataRef.current.simulatedMouthOpen = 0;
            clearInterval(simInterval);
          };
          window.speechSynthesis.speak(utterance);
        }
        return;
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const audioContext = audioContextRef.current;
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      mouthDataRef.current.analyser = analyser;
      mouthDataRef.current.isPlaying = true;
      audio.onended = () => {
        mouthDataRef.current.isPlaying = false;
      };
      await audio.play();
    },
  }));

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1.1, 2.2], fov: 35 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[1, 1, 1]} intensity={1.0} />
        <Suspense fallback={null}>
          <VrmAvatar vrmUrl={vrmUrl} mouthDataRef={mouthDataRef} />
        </Suspense>
        <OrbitControls target={[0, 1.0, 0]} enablePan={false} minDistance={0.5} maxDistance={3.5} />
      </Canvas>
    </div>
  );
});

export default InterviewAvatar;
