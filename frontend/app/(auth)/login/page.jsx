"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NeuButton from '@/components/shared/NeuButton';
import NeuCard from '@/components/shared/NeuCard';
import DemoLoginToggle from '@/components/shared/DemoLoginToggle';
import { FaGraduationCap, FaChalkboardTeacher, FaBuilding, FaUserTie } from 'react-icons/fa';

// This integrates with the Zustand authStore (which we'll implement later)
import useAuthStore from '@/lib/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [isDemo, setIsDemo] = useState(true);
  
  // Real Account State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Demo Account State
  const [selectedDemoRole, setSelectedDemoRole] = useState('student');

  const demoAccounts = {
    student: { email: 'arjun@mrdu.edu', role: 'student', name: 'Arjun Reddy' },
    faculty: { email: 'lakshmi.naidu@mrdu.edu', role: 'faculty', name: 'Prof. Lakshmi Naidu' },
    admin: { email: 'admin@mrdu.edu', role: 'admin', name: 'Institution Admin' },
    recruiter: { email: 'ravi@techspark.com', role: 'recruiter', name: 'Ravi Menon' }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginEmail = isDemo ? demoAccounts[selectedDemoRole].email : email;
      const loginPassword = isDemo ? 'Bridgify@2026' : password; // default demo password
      
      const user = await login(loginEmail, loginPassword);
      
      // Route based on role
      if (user?.role === 'student') router.push('/student');
      else if (user?.role === 'faculty') router.push('/faculty');
      else if (user?.role === 'admin') router.push('/admin');
      else if (user?.role === 'recruiter') router.push('/recruiter');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const roles = [
    { id: 'student', icon: <FaGraduationCap />, label: 'Student', color: 'var(--electric)' },
    { id: 'faculty', icon: <FaChalkboardTeacher />, label: 'Faculty', color: 'var(--sky)' },
    { id: 'admin', icon: <FaBuilding />, label: 'Admin', color: 'var(--violet)' },
    { id: 'recruiter', icon: <FaUserTie />, label: 'Recruiter', color: 'var(--hotpink)' }
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--electric)] opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--hotpink)] opacity-10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 bg-[var(--ink)] rounded-full"></div>
          <span className="font-bold text-xl">Bridgify</span>
        </Link>

        <NeuCard className="p-8 bg-white">
          <h1 className="text-3xl font-bold mb-6">Welcome Back</h1>
          
          <DemoLoginToggle isDemo={isDemo} onChange={setIsDemo} />

          {error && (
            <div className="p-3 mb-6 bg-red-100 border-2 border-red-500 rounded-[var(--radius-input)] text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {isDemo ? (
              <div className="space-y-4">
                <p className="font-semibold text-gray-700">Select Demo Persona:</p>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedDemoRole(role.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-3 transition-all ${
                        selectedDemoRole === role.id 
                          ? 'border-[var(--ink)] bg-[#f8f7f4] shadow-[4px_4px_0px_var(--ink)] transform -translate-y-1' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2" style={{ color: role.color }}>{role.icon}</div>
                      <span className="font-bold text-sm">{role.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl text-sm">
                  <p className="font-semibold mb-1">Logging in as:</p>
                  <p>{demoAccounts[selectedDemoRole].name}</p>
                  <p className="text-gray-600 font-mono text-xs mt-1">{demoAccounts[selectedDemoRole].email}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 stagger-enter">
                <div>
                  <label className="block font-semibold mb-2">Email</label>
                  <input 
                    type="email" 
                    className="neu-input" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block font-semibold">Password</label>
                    <Link href="/forgot" className="text-sm text-[var(--electric)] font-semibold hover:underline">Forgot?</Link>
                  </div>
                  <input 
                    type="password" 
                    className="neu-input" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <NeuButton 
              type="submit" 
              variant="primary" 
              className="w-full text-lg py-3 mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : (isDemo ? 'Enter Demo Environment' : 'Sign In')}
            </NeuButton>
          </form>

          {!isDemo && (
            <div className="mt-8 text-center text-sm font-semibold">
              Don&apos;t have an account? <Link href="/register" className="text-[var(--electric)] hover:underline">Sign up</Link>
            </div>
          )}
        </NeuCard>
      </motion.div>
    </div>
  );
}
