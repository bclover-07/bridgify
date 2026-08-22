"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NeuButton from '@/components/shared/NeuButton';
import NeuCard from '@/components/shared/NeuCard';
import { FaGraduationCap, FaChalkboardTeacher, FaBuilding, FaUserTie } from 'react-icons/fa';
import useAuthStore from '@/lib/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    institutionCode: '' // Used for faculty/admin linking
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don&apos;t match!");
      return;
    }
    
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // Route based on role
      if (user?.role === 'student') router.push('/student');
      else if (user?.role === 'faculty') router.push('/faculty');
      else if (user?.role === 'admin') router.push('/admin');
      else if (user?.role === 'recruiter') router.push('/recruiter');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const roles = [
    { id: 'student', icon: <FaGraduationCap />, label: 'Student', color: 'var(--electric)' },
    { id: 'faculty', icon: <FaChalkboardTeacher />, label: 'Faculty', color: 'var(--sky)' },
    { id: 'admin', icon: <FaBuilding />, label: 'Admin', color: 'var(--violet)' },
    { id: 'recruiter', icon: <FaUserTie />, label: 'Recruiter', color: 'var(--hotpink)' }
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-6 relative overflow-hidden py-12">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[var(--acid)] opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[var(--sky)] opacity-20 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[var(--electric)] rounded-full flex items-center justify-center border-2 border-[var(--ink)]">
               <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-bold text-2xl font-display">Bridgify</span>
          </Link>
        </div>

        <NeuCard className="p-8 bg-white">
          <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
          <p className="text-gray-600 mb-8 font-medium">Join the skill evidence ecosystem.</p>
          
          {error && (
            <div className="p-3 mb-6 bg-red-100 border-[4px] border-red-500 rounded-[var(--radius-input)] text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';

          <PageTransition>
            <form onSubmit={handleRegister} className="space-y-6">
              <StaggerItem>
                <label className="block font-semibold mb-3">Select Your Role</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {roles.map((role) => (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-[4px] transition-all ${
                        formData.role === role.id 
                          ? 'border-[var(--ink)] bg-[color-mix(in_srgb,var(--electric)_10%,var(--paper))] shadow-[10px_10px_0px_var(--ink)]' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      style={formData.role === role.id ? { borderColor: role.color } : {}}
                    >
                      <div className="text-2xl mb-1" style={{ color: role.color }}>{role.icon}</div>
                      <span className="font-bold text-xs">{role.label}</span>
                    </motion.button>
                  ))}
                </div>
              </StaggerItem>

              <StaggerItem className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    className="neu-input" 
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    className="neu-input" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </StaggerItem>

              <StaggerItem className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    className="neu-input" 
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    className="neu-input" 
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </StaggerItem>

              {(formData.role === 'faculty' || formData.role === 'admin') && (
                <StaggerItem>
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block font-semibold mb-2 text-[var(--electric)]">Institution Code (Optional for Demo)</label>
                    <input 
                      type="text" 
                      name="institutionCode"
                      className="neu-input border-[var(--electric)]" 
                      placeholder="e.g. MRDU-2026"
                      value={formData.institutionCode}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to create a new sandbox institution.</p>
                  </motion.div>
                </StaggerItem>
              )}

              <StaggerItem>
                <NeuButton 
                  type="submit" 
                  variant="primary" 
                  className="w-full text-lg py-3 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </NeuButton>
              </StaggerItem>
            </form>

            <StaggerItem className="mt-8 text-center text-sm font-semibold">
              Already have an account? <Link href="/login" className="text-[var(--electric)] hover:underline">Sign in</Link>
            </StaggerItem>
          </PageTransition>
        </NeuCard>
      </motion.div>
    </div>
  );
}
