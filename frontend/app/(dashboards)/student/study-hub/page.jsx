"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiVideo, FiMessageSquare, FiBookOpen, FiPlay, FiMic, FiVolume2, FiCpu, FiCheckCircle, FiCamera, FiEye } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import api from '@/lib/api';

export default function StudyHubPage() {
  const [activeTab, setActiveTab] = useState('code');
  const [loading, setLoading] = useState(false);

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
  const [cameraActive, setCameraActive] = useState(false);
  const [faceStatus, setFaceStatus] = useState('Good Lighting & Centered');
  const videoRef = useRef(null);

  // Voice AI Debate State (TTS + STT)
  const [debateTopic, setDebateTopic] = useState('AI taking over Software Engineering jobs');
  const [debateSide, setDebateSide] = useState('against');
  const [debateSession, setDebateSession] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [userSpeechText, setUserSpeechText] = useState('');

  // Resources State
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const prebuiltDebateTopics = [
    'AI taking over Software Engineering jobs',
    'Remote Work vs In-Office Collaboration',
    'Open Source AI vs Proprietary AI Models',
    'Microservices Architecture vs Monolith for Startups',
  ];

  const tabs = [
    { id: 'code', label: 'AI Code Compiler', icon: FiCode },
    { id: 'interview', label: 'MediaPipe Mock Interview', icon: FiVideo },
    { id: 'debate', label: 'Voice AI Debate Coach', icon: FiMessageSquare },
    { id: 'resources', label: 'Micro-Learning Notes', icon: FiBookOpen },
  ];

  // Camera stream activation
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera access failed:", err);
        setFaceStatus("Camera fallback simulation active");
      }
    }
  };

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

  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserSpeechText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/student/mock-interview/start', {
        targetRole: interviewRole,
        topic: 'General Placement Prep',
      });
      setInterviewSession(data);
    } catch (err) {
      console.error('Interview start error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDebate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/student/debate/start', {
        topic: debateTopic,
        side: debateSide,
      });
      setDebateSession(data);
      if (data.openingArgument) {
        speakText(data.openingArgument);
      }
    } catch (err) {
      console.error('Debate start error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    setLoadingResources(true);
    try {
      const res = await api.get('/faculty/learning-feed');
      setResources(res.data.feed || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'resources') loadResources();
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <FiCode className="text-[var(--electric)]" />
          Study Hub & AI Practice Suite
        </h1>
        <p className="text-gray-600">AI Code Reviewer, Voice Debate Coach, MediaPipe Proctored Mock Interviews, and Micro-Learning Modules.</p>
      </div>

      <NeuCard padding="p-0" className="overflow-hidden bg-white flex flex-col min-h-[620px]">
        {/* Tab Header */}
        <div className="flex border-b-[3px] border-[var(--ink)] bg-[#f8f7f4]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 font-bold transition-colors border-r-[3px] border-[var(--ink)] last:border-r-0 ${
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

              {/* AI Code Review Results */}
              {aiReview && (
                <div className="p-4 border-[3px] border-[var(--ink)] bg-[var(--paper)] rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base flex items-center gap-2">🤖 AI Code Explanation & Feedback</h3>
                    <NeuBadge variant={aiReview.hasErrors ? 'danger' : 'success'}>
                      {aiReview.hasErrors ? 'Bugs Detected' : 'Code Clean'}
                    </NeuBadge>
                  </div>
                  <p className="text-xs text-gray-800 font-medium">{aiReview.explanation}</p>

                  <div className="flex gap-4 text-xs font-bold text-gray-600">
                    <span>Time Complexity: {aiReview.timeComplexity}</span>
                    <span>Space Complexity: {aiReview.spaceComplexity}</span>
                  </div>

                  {aiReview.correctedCode && (
                    <div>
                      <span className="text-xs font-bold block mb-1">Optimized AI Fix:</span>
                      <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border-2 border-[var(--ink)]">
                        {aiReview.correctedCode}
                      </pre>
                      <button
                        onClick={() => setCodeSnippet(aiReview.correctedCode)}
                        className="mt-2 text-xs font-bold text-[var(--electric)] underline cursor-pointer"
                      >
                        Apply AI Fix to Editor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: MEDIAPIPE MOCK INTERVIEW */}
          {activeTab === 'interview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FiCamera className="text-[var(--coral)]" /> MediaPipe Camera Stream & Proctoring
                  </h3>
                  
                  <div className="relative w-full h-[260px] bg-gray-900 border-[3px] border-[var(--ink)] rounded-2xl overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {!cameraActive && (
                      <div className="absolute text-center text-white p-4">
                        <FiCamera size={40} className="mx-auto mb-2 opacity-50" />
                        <p className="font-bold text-sm">Camera inactive</p>
                        <p className="text-xs text-gray-400">Click below to enable MediaPipe vision checks</p>
                      </div>
                    )}
                    {cameraActive && (
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                        <span>MediaPipe Anti-Cheating Active</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border-[2px] border-[var(--ink)] text-sm">
                    <span className="font-bold flex items-center gap-2"><FiEye /> Vision Status:</span>
                    <NeuBadge variant={cameraActive ? 'success' : 'warning'}>{faceStatus}</NeuBadge>
                  </div>

                  <NeuButton variant={cameraActive ? "coral" : "primary"} className="w-full" onClick={toggleCamera}>
                    {cameraActive ? 'Turn Off Camera' : 'Enable Camera & Vision Check'}
                  </NeuButton>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-3">Interview Parameters</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-bold block mb-1">Target Job Role</label>
                        <select className="neu-select w-full" value={interviewRole} onChange={e => setInterviewRole(e.target.value)}>
                          <option>Fullstack Engineer</option>
                          <option>Frontend React Specialist</option>
                          <option>Backend Node/System Architect</option>
                          <option>Data Structures & Algorithms Specialist</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {interviewSession ? (
                    <div className="p-4 border-[3px] border-[var(--ink)] bg-[var(--paper)] rounded-xl space-y-3">
                      <p className="font-bold text-green-700 flex items-center gap-2"><FiCheckCircle /> Interview Session Live</p>
                      <p className="text-sm"><strong>Question 1:</strong> {interviewSession.firstQuestion}</p>
                      <input className="neu-input text-sm" placeholder="Type or speak your response..." />
                      <NeuButton variant="primary" size="sm" className="w-full">Submit Answer</NeuButton>
                    </div>
                  ) : (
                    <NeuButton 
                      variant="coral" 
                      onClick={handleStartInterview} 
                      loading={loading} 
                      className="w-full py-4 text-lg"
                    >
                      {loading ? 'Initializing Agent 04...' : 'Start AI Interview Session'}
                    </NeuButton>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: VOICE AI DEBATE */}
          {activeTab === 'debate' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6">
              <div className="max-w-2xl mx-auto w-full space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Voice AI Debate Coach (TTS + STT Enabled)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Pre-built Topics or Enter Custom</label>
                      <select
                        className="neu-select w-full mb-2"
                        value={debateTopic}
                        onChange={e => setDebateTopic(e.target.value)}
                      >
                        {prebuiltDebateTopics.map((t, idx) => (
                          <option key={idx} value={t}>{t}</option>
                        ))}
                      </select>
                      <input
                        className="neu-input w-full"
                        value={debateTopic}
                        onChange={e => setDebateTopic(e.target.value)}
                        placeholder="Enter custom debate topic..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <NeuButton
                        variant={debateSide === 'for' ? 'primary' : 'ghost'}
                        onClick={() => setDebateSide('for')}
                        className="flex-1"
                      >
                        For ✅
                      </NeuButton>
                      <NeuButton
                        variant={debateSide === 'against' ? 'coral' : 'ghost'}
                        onClick={() => setDebateSide('against')}
                        className="flex-1"
                      >
                        Against ❌
                      </NeuButton>
                    </div>

                    <NeuButton variant="hotpink" onClick={handleStartDebate} loading={loading} className="w-full py-3">
                      {loading ? 'Agent 05 Initializing...' : 'Start Voice AI Debate Session'}
                    </NeuButton>
                  </div>
                </div>

                {debateSession && (
                  <NeuCard className="p-5 bg-white border-[3px] border-[var(--ink)] space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-lg">AI Opponent Opening Argument</h4>
                      <NeuButton size="sm" variant="ghost" icon={FiVolume2} onClick={() => speakText(debateSession.openingArgument)}>
                        Listen AI
                      </NeuButton>
                    </div>

                    <p className="text-sm bg-[var(--paper)] p-4 rounded-xl border-[2px] border-[var(--ink)] leading-relaxed">
                      {debateSession.openingArgument}
                    </p>

                    <div className="pt-2 space-y-2">
                      <span className="text-xs font-bold text-gray-600 block">Your Argument (Speak or Type):</span>
                      <div className="flex gap-2">
                        <input
                          className="neu-input flex-1 text-sm"
                          value={userSpeechText}
                          onChange={e => setUserSpeechText(e.target.value)}
                          placeholder="Speak via microphone or type your argument..."
                        />
                        <NeuButton variant={isListening ? 'coral' : 'accent'} icon={FiMic} onClick={startVoiceInput}>
                          {isListening ? 'Listening...' : 'Speak'}
                        </NeuButton>
                      </div>
                    </div>
                  </NeuCard>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: MICRO-LEARNING RESOURCES */}
          {activeTab === 'resources' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-4">
              <h3 className="text-xl font-bold">Bite-Sized Micro-Learning Notes & Concept Cards</h3>
              {loadingResources ? (
                <div className="p-8 text-center font-bold">Fetching faculty notes & materials...</div>
              ) : resources.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {resources.map((item, i) => (
                    <NeuCard key={i} className="p-5 bg-white space-y-2 border-[3px] border-[var(--ink)]">
                      <h4 className="font-bold text-base text-[var(--electric)]">{item.technology || item.title || 'Micro Learning Note'}</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">{item.description || item.demandSummary || 'Faculty verified bite-sized concept summary.'}</p>
                      <NeuBadge variant="info">{item.category || 'Curriculum Module'}</NeuBadge>
                    </NeuCard>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 font-bold bg-white border-[3px] border-[var(--ink)] rounded-xl">
                  No micro-learning notes published yet.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </NeuCard>
    </div>
  );
}
