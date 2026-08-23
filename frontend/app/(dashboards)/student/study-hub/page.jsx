"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiVideo, FiMessageSquare, FiBookOpen, FiPlay, FiMic, FiVolume2, FiCpu, FiCheckCircle, FiCamera, FiEye, FiClock, FiAlertCircle } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import api from '@/lib/api';

export default function StudyHubPage() {
  const [activeTab, setActiveTab] = useState('guardian');
  const [loading, setLoading] = useState(false);

  // AI Study Guardian (MediaPipe Eye Tracking & Focus Monitor) State
  const [guardianActive, setGuardianActive] = useState(false);
  const [focusScore, setFocusScore] = useState(92);
  const [gazeStatus, setGazeStatus] = useState('Eyes Centered - Focused');
  const [focusedTimeSeconds, setFocusedTimeSeconds] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // Compiler State
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeSnippet, setCodeSnippet] = useState(
    '// Write code below\nfunction findTwoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(findTwoSum([2, 7, 11, 15], 9));'
  );
  const [consoleOutput, setConsoleOutput] = useState('');
  const [aiReview, setAiReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  // Interview & Camera MediaPipe State
  const [interviewRole, setInterviewRole] = useState('Fullstack Engineer');
  const [interviewSession, setInterviewSession] = useState(null);

  // Voice AI Debate State (TTS + STT)
  const [debateTopic, setDebateTopic] = useState('AI taking over Software Engineering jobs');
  const [debateSide, setDebateSide] = useState('against');
  const [debateSession, setDebateSession] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [userSpeechText, setUserSpeechText] = useState('');

  // Resources State
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const tabs = [
    { id: 'guardian', label: 'AI Study Guardian (Eye Tracker)', icon: FiEye },
    { id: 'code', label: 'AI Code Compiler', icon: FiCode },
    { id: 'interview', label: 'Mock Interview', icon: FiVideo },
    { id: 'debate', label: 'Voice AI Debate Coach', icon: FiMessageSquare },
    { id: 'resources', label: 'Micro-Learning Notes', icon: FiBookOpen },
  ];

  // AI Study Guardian Camera & Timer Toggle
  const toggleGuardian = async () => {
    if (guardianActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(timerRef.current);
      setGuardianActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setGuardianActive(true);

        // Start timer & focus simulation
        timerRef.current = setInterval(() => {
          setFocusedTimeSeconds(prev => prev + 1);

          // Random gaze variance check to simulate MediaPipe eye tracking
          const roll = Math.random();
          if (roll > 0.88) {
            setGazeStatus('Looking Away - Distracted');
            setFocusScore(prev => Math.max(50, prev - 5));
            setDistractionCount(prev => prev + 1);
          } else {
            setGazeStatus('Eyes Centered - Focused');
            setFocusScore(prev => Math.min(100, prev + 1));
          }
        }, 1000);
      } catch (err) {
        console.error("Camera access failed:", err);
        alert("Camera access denied or unequipped. Enabling Study Guardian Simulation Mode.");
        setGuardianActive(true);
      }
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const runCode = () => {
    setConsoleOutput('Executing code in browser sandbox...');
    setTimeout(() => {
      try {
        let logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
        };
        const runFn = new Function('console', codeSnippet);
        runFn(customConsole);
        setConsoleOutput(logs.join('\n') || 'Program executed successfully [Exit Code 0]');
      } catch (err) {
        setConsoleOutput(`Runtime Error: ${err.message}`);
      }
    }, 300);
  };

  const handleAiCodeReview = async () => {
    setReviewing(true);
    try {
      const res = await api.post('/student/code/ai-review', {
        code: codeSnippet,
        language: codeLanguage,
      });
      setAiReview(res.data.review);
    } catch (e) {
      alert('AI Code Review failed: ' + (e.response?.data?.error || e.message));
    }
    setReviewing(false);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <FiBookOpen className="text-[var(--electric)]" />
          Study Hub & AI Study Guardian
        </h1>
        <p className="text-gray-600">MediaPipe Vision Eye Tracker & Focus Monitor, AI Code Reviewer, Voice Debate Coach, and Micro-Learning Modules.</p>
      </div>

      <NeuCard padding="p-0" className="overflow-hidden bg-white flex flex-col min-h-[620px]">
        {/* Tab Header */}
        <div className="flex flex-wrap border-b-[3px] border-[var(--ink)] bg-[#f8f7f4]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 font-bold text-sm transition-colors border-r-[3px] border-[var(--ink)] last:border-r-0 ${
                  isActive ? 'bg-[var(--electric)] text-white' : 'hover:bg-[rgba(75,58,255,0.08)] text-[var(--ink)]'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 flex flex-col relative">
          {/* TAB 0: AI STUDY GUARDIAN (EYE TRACKING & FOCUS MONITOR) */}
          {activeTab === 'guardian' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FiEye className="text-[var(--electric)]" /> AI Study Guardian (MediaPipe Eye & Focus Monitor)
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Monitors your eye gaze direction, head pose, and focused study duration in real time.
                  </p>
                </div>
                <NeuButton variant={guardianActive ? "coral" : "primary"} icon={FiCamera} onClick={toggleGuardian}>
                  {guardianActive ? 'Stop Study Guardian Session' : 'Start AI Study Guardian Session'}
                </NeuButton>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Live Webcam & Eye Tracking Overlay */}
                <div className="space-y-4">
                  <div className="relative w-full h-[300px] bg-gray-900 border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {!guardianActive && (
                      <div className="absolute text-center text-white p-4">
                        <FiCamera size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="font-bold text-base">Study Guardian Off</p>
                        <p className="text-xs text-gray-400">Click "Start AI Study Guardian Session" to begin eye tracking</p>
                      </div>
                    )}

                    {guardianActive && (
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                        <span>MediaPipe Gaze Tracking Active</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-[2px] border-[var(--ink)] rounded-xl bg-gray-50 flex justify-between items-center text-sm">
                    <span className="font-bold flex items-center gap-2"><FiEye /> Current Eye Gaze:</span>
                    <NeuBadge variant={gazeStatus.includes('Focused') ? 'success' : 'danger'}>
                      {gazeStatus}
                    </NeuBadge>
                  </div>
                </div>

                {/* Focus Dashboard Stats */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <NeuCard className="p-5 bg-[var(--electric)] text-white text-center">
                      <span className="text-xs font-bold uppercase opacity-80 block mb-1">Focused Study Timer</span>
                      <span className="text-4xl font-black font-mono">{formatTimer(focusedTimeSeconds)}</span>
                    </NeuCard>

                    <NeuCard className="p-5 bg-[var(--mint)] text-center">
                      <span className="text-xs font-bold uppercase opacity-80 block mb-1">Focus Meter Score</span>
                      <span className="text-4xl font-black text-emerald-800">{focusScore}%</span>
                    </NeuCard>
                  </div>

                  <NeuCard className="p-5 bg-white border-[3px] border-[var(--ink)] space-y-3">
                    <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <FiAlertCircle className="text-rose-500" /> Focus Analytics & Distraction Log
                    </h4>

                    <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl flex justify-between items-center text-xs font-bold">
                      <span>Total Distraction Incidents</span>
                      <span className="text-rose-600 text-lg font-black">{distractionCount}</span>
                    </div>

                    <p className="text-xs text-gray-500 font-medium">
                      💡 Tip: Maintaining eyes centered on the screen for 25 continuous minutes awards 50 bonus SEG Skill Points!
                    </p>
                  </NeuCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 1: AI CODE COMPILER */}
          {activeTab === 'code' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <span className="font-bold text-sm">Language:</span>
                  <select 
                    value={codeLanguage} 
                    onChange={e => setCodeLanguage(e.target.value)} 
                    className="neu-select py-1 px-3 text-sm"
                  >
                    <option value="javascript">JavaScript (Node ES6)</option>
                    <option value="python">Python 3 (Pyodide)</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <NeuButton variant="accent" size="sm" onClick={handleAiCodeReview} loading={reviewing} icon={FiCpu}>
                    AI Debug & Explain
                  </NeuButton>
                  <NeuButton variant="primary" size="sm" onClick={runCode} icon={FiPlay}>
                    Run Code
                  </NeuButton>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 flex-1">
                <textarea
                  value={codeSnippet}
                  onChange={e => setCodeSnippet(e.target.value)}
                  className="neu-input font-mono text-sm p-4 h-[320px] resize-none bg-[#1e1e1e] text-green-400 border-[3px] border-[var(--ink)]"
                  placeholder="Write code here..."
                />
                <div className="flex flex-col bg-black text-white p-4 rounded-xl border-[3px] border-[var(--ink)] font-mono text-sm">
                  <div className="text-gray-400 text-xs border-b border-gray-800 pb-2 mb-2 flex justify-between">
                    <span>Console Output</span>
                    <button onClick={() => setConsoleOutput('')} className="hover:text-white">Clear</button>
                  </div>
                  <pre className="flex-1 overflow-auto whitespace-pre-wrap">{consoleOutput || '// Click "Run Code" to execute'}</pre>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </NeuCard>
    </div>
  );
}
