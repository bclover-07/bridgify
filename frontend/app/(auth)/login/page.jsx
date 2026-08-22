"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NeuButton from '@/components/shared/NeuButton';
import NeuCard from '@/components/shared/NeuCard';
import DemoLoginToggle from '@/components/shared/DemoLoginToggle';
import useAuthStore from '@/lib/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [isDemo, setIsDemo] = useState(true);
  
  // Real Account State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRealLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      
      // Route based on role
      if (user?.role === 'student') router.push('/student');
      else if (user?.role === 'faculty') router.push('/faculty');
      else if (user?.role === 'admin') router.push('/admin');
      else if (user?.role === 'recruiter') router.push('/recruiter');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    try {
      const user = await login(demoEmail, demoPassword);
      
      // Route based on role
      if (user?.role === 'student') router.push('/student');
      else if (user?.role === 'faculty') router.push('/faculty');
      else if (user?.role === 'admin') router.push('/admin');
      else if (user?.role === 'recruiter') router.push('/recruiter');
    } catch (err) {
      console.error('Demo Login failed:', err);
    }
  };

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
          
          <div className="flex bg-[var(--paper)] rounded-xl p-1 mb-6 border-2 border-[var(--ink)]">
             <button 
                type="button"
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${isDemo ? 'bg-[var(--electric)] text-white border-2 border-[var(--ink)] shadow-[2px_2px_0px_var(--ink)]' : 'hover:bg-gray-100'}`}
                onClick={() => setIsDemo(true)}
             >
                Demo Mode
             </button>
             <button 
                type="button"
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${!isDemo ? 'bg-[var(--electric)] text-white border-2 border-[var(--ink)] shadow-[2px_2px_0px_var(--ink)]' : 'hover:bg-gray-100'}`}
                onClick={() => setIsDemo(false)}
             >
                Real Login
             </button>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-100 border-2 border-red-500 rounded-[var(--radius-input)] text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {isDemo ? (
             <DemoLoginToggle onDemoLogin={handleDemoLogin} loading={isLoading} />
          ) : (
            <form onSubmit={handleRealLogin} className="space-y-6">
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

              <NeuButton 
                type="submit" 
                variant="primary" 
                className="w-full text-lg py-3 mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </NeuButton>
            </form>
          )}

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
