"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher, FaBuilding, FaUserTie } from 'react-icons/fa';
import NeuButton from '@/components/shared/NeuButton';
import NeuCard from '@/components/shared/NeuCard';
import NeuInput from '@/components/shared/NeuInput';
import useAuthStore from '@/lib/store/authStore';

const demoAccounts = [
  { role: 'Student', email: 'arjun@mrdu.edu', password: 'test123', icon: FaGraduationCap, color: '#4B3AFF', name: 'Arjun Reddy' },
  { role: 'Faculty', email: 'lakshmi.naidu@mrdu.edu', password: 'faculty123', icon: FaChalkboardTeacher, color: '#3AC1FF', name: 'Prof. Lakshmi' },
  { role: 'Admin', email: 'admin@mrdu.edu', password: 'admin123', icon: FaBuilding, color: '#A960FF', name: 'Dr. Srinivas' },
  { role: 'Recruiter', email: 'ravi@techspark.com', password: 'recruiter123', icon: FaUserTie, color: '#FF3D9A', name: 'Ravi Menon' },
];

const floatingShapes = [
  { className: 'w-20 h-20 rounded-3xl bg-[var(--electric)] rotate-12', style: { top: '8%', right: '8%', animationDelay: '0s' } },
  { className: 'w-14 h-14 rounded-full bg-[var(--acid)]', style: { top: '20%', left: '5%', animationDelay: '1.2s' } },
  { className: 'w-16 h-16 rounded-2xl bg-[var(--hotpink)] -rotate-6', style: { bottom: '15%', right: '12%', animationDelay: '0.6s' } },
  { className: 'w-12 h-12 rounded-full bg-[var(--mint)]', style: { bottom: '25%', left: '8%', animationDelay: '1.8s' } },
  { className: 'w-10 h-10 rounded-xl bg-[var(--amber)] rotate-45', style: { top: '55%', right: '5%', animationDelay: '2.4s' } },
  { className: 'w-24 h-8 rounded-full bg-[var(--violet)] -rotate-12', style: { top: '70%', left: '3%', animationDelay: '0.3s' } },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, fetchMe, isAuthenticated, error, clearError } = useAuthStore();
  const [isDemo, setIsDemo] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clearError) clearError();
    // Check if user already has a valid session
    fetchMe().then((user) => {
      if (user) {
        if (user.role === 'student') router.push('/student');
        else if (user.role === 'faculty') router.push('/faculty');
        else if (user.role === 'admin') router.push('/admin');
        else if (user.role === 'recruiter') router.push('/recruiter');
      }
    }).catch(() => {
      // No existing session, stay on login page
    });
  }, []);

  const handleSelectDemo = (account) => {
    if (clearError) clearError();
    setSelectedDemo(account.role);
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (user) {
        setLoginSuccess(true);
        setTimeout(() => {
          if (user.role === 'student') router.push('/student');
          else if (user.role === 'faculty') router.push('/faculty');
          else if (user.role === 'admin') router.push('/admin');
          else if (user.role === 'recruiter') router.push('/recruiter');
        }, 300);
      }
    } catch (err) {
      /* error is set in store */
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = (demo) => {
    setIsDemo(demo);
    if (clearError) clearError();
    if (demo) {
      setSelectedDemo(null);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {floatingShapes.map((shape, i) => (
        <div
          key={i}
          className={`absolute border-[4px] border-[var(--ink)] animate-float opacity-30 hidden lg:block ${shape.className}`}
          style={shape.style}
        />
      ))}

      <div className="absolute top-[-15%] left-[-10%] w-96 h-96 bg-[var(--electric)] opacity-[0.06] rounded-full blur-[100px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-96 h-96 bg-[var(--hotpink)] opacity-[0.06] rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
        className="w-full max-w-md z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity group">
          <div className="w-10 h-10 rounded-full bg-[var(--electric)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)] group-hover:shadow-[6px_6px_0px_0px_var(--ink)] transition-all">
            <div className="w-3.5 h-3.5 bg-white rounded-full" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Bridgify</span>
        </Link>

        <NeuCard hover={false} className="p-6 md:p-8 bg-white">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome Back! 👋</h1>
            <p className="text-gray-500 font-medium text-sm">Sign in to your dashboard</p>
          </div>

          <div className="flex justify-center mb-6 relative p-1 bg-gray-100 border-[4px] border-[var(--ink)] rounded-2xl shadow-[6px_6px_0px_0px_var(--ink)] w-fit mx-auto">
            <button
              type="button"
              className={`relative px-5 py-2.5 font-bold text-sm z-10 transition-colors rounded-xl ${isDemo ? 'text-white' : 'text-gray-500 hover:text-black'}`}
              onClick={() => handleToggle(true)}
            >
              🎮 Demo Access
            </button>
            <button
              type="button"
              className={`relative px-5 py-2.5 font-bold text-sm z-10 transition-colors rounded-xl ${!isDemo ? 'text-white' : 'text-gray-500 hover:text-black'}`}
              onClick={() => handleToggle(false)}
            >
              🔐 Real Sign In
            </button>
            <motion.div
              className="absolute top-1 bottom-1 bg-[var(--electric)] border-[3px] border-[var(--ink)] rounded-xl z-0"
              initial={false}
              animate={{
                left: isDemo ? '4px' : '50%',
                right: isDemo ? '50%' : '4px',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 mb-5 bg-red-50 border-[3px] border-[var(--coral)] rounded-2xl text-[var(--coral)] text-sm font-bold text-center shadow-[3px_3px_0px_0px_var(--coral)]"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {loginSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 mb-5 bg-green-50 border-[3px] border-[var(--mint)] rounded-2xl text-green-700 text-sm font-bold text-center shadow-[3px_3px_0px_0px_var(--mint)]"
            >
              ✅ Login successful! Redirecting...
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isDemo ? (
              <motion.div
                key="demo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-center text-sm font-semibold text-gray-500 mb-4">Click a role to auto-fill credentials</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {demoAccounts.map((account) => (
                    <motion.button
                      key={account.role}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectDemo(account)}
                      className={`p-4 rounded-2xl border-[4px] border-[var(--ink)] text-left transition-all shadow-[5px_5px_0px_0px_var(--ink)] hover:shadow-[7px_7px_0px_0px_var(--ink)] ${
                        selectedDemo === account.role ? 'ring-2 ring-offset-2 shadow-[7px_7px_0px_0px_var(--ink)] -translate-y-1' : ''
                      }`}
                      style={{ background: account.color + '12', ringColor: account.color }}
                    >
                      <div className="w-11 h-11 rounded-xl border-[3px] border-[var(--ink)] flex items-center justify-center text-white mb-3 shadow-[3px_3px_0px_0px_var(--ink)]" style={{ background: account.color }}>
                        <account.icon size={20} />
                      </div>
                      <p className="font-bold text-sm">{account.role}</p>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5 truncate">{account.name}</p>
                    </motion.button>
                  ))}
                </div>

                {selectedDemo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-3 bg-[var(--acid)] border-[3px] border-[var(--ink)] rounded-xl text-center">
                      <p className="text-xs font-bold">📋 Credentials auto-filled for <span className="uppercase">{selectedDemo}</span></p>
                      <p className="text-[11px] font-mono mt-1 text-gray-700">{email}</p>
                    </div>
                    <form onSubmit={handleLogin}>
                      <NeuButton
                        type="submit"
                        variant="primary"
                        className="w-full text-base py-3"
                        loading={isSubmitting}
                        iconRight={FiArrowRight}
                      >
                        Sign In as {selectedDemo}
                      </NeuButton>
                    </form>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="real"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <NeuInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={FiMail}
                  required
                />
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="form-label">Password</label>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiLock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="neu-input pl-10 pr-10"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <NeuButton
                  type="submit"
                  variant="primary"
                  className="w-full text-base py-3"
                  loading={isSubmitting}
                  iconRight={FiArrowRight}
                >
                  Sign In
                </NeuButton>
              </motion.form>
            )}
          </AnimatePresence>

          {!isDemo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-sm font-semibold"
            >
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[var(--electric)] hover:underline">Sign up</Link>
            </motion.div>
          )}
        </NeuCard>

        <p className="text-center text-xs font-semibold text-gray-400 mt-4">
          Built for the National Hackathon · Bridgify Platform
        </p>
      </motion.div>
    </div>
  );
}
