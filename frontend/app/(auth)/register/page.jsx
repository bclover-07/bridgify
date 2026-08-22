"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher, FaBuilding, FaUserTie } from 'react-icons/fa';
import NeuButton from '@/components/shared/NeuButton';
import NeuCard from '@/components/shared/NeuCard';
import NeuInput from '@/components/shared/NeuInput';
import useAuthStore from '@/lib/store/authStore';

const roles = [
  { value: 'student', label: 'Student', icon: FaGraduationCap, color: '#4B3AFF', desc: 'Track skills, take assessments, get placed' },
  { value: 'faculty', label: 'Faculty', icon: FaChalkboardTeacher, color: '#3AC1FF', desc: 'Create assessments, track students' },
  { value: 'admin', label: 'Admin', icon: FaBuilding, color: '#A960FF', desc: 'Manage institution, drive placements' },
  { value: 'recruiter', label: 'Recruiter', icon: FaUserTie, color: '#FF3D9A', desc: 'Search talent, post problem statements' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    institutionCode: '',
  });

  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(formData);
      if (user?.role === 'student') router.push('/student');
      else if (user?.role === 'faculty') router.push('/faculty');
      else if (user?.role === 'admin') router.push('/admin');
      else if (user?.role === 'recruiter') router.push('/recruiter');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <div className="absolute top-[-15%] right-[-10%] w-80 h-80 bg-[var(--violet)] opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-80 h-80 bg-[var(--mint)] opacity-10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-[var(--electric)] border-[3px] border-[var(--ink)] flex items-center justify-center shadow-[3px_3px_0px_0px_var(--ink)]">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="font-bold text-xl">Bridgify</span>
        </Link>

        <NeuCard hover={false} className="p-6 md:p-8 bg-white">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-500 font-medium text-sm mb-6">Step {step} of 2</p>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className={`h-2 flex-1 rounded-full border-2 border-[var(--ink)] ${step >= 1 ? 'bg-[var(--electric)]' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded-full border-2 border-[var(--ink)] ${step >= 2 ? 'bg-[var(--electric)]' : 'bg-gray-200'}`} />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-5 bg-red-50 border-[3px] border-[var(--coral)] rounded-2xl text-[var(--coral)] text-sm font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <p className="font-bold text-sm text-gray-600 mb-3">Select your role</p>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <motion.button
                      key={r.value}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { update('role', r.value); setStep(2); }}
                      className={`p-4 rounded-2xl border-[3px] border-[var(--ink)] text-left transition-all shadow-[4px_4px_0px_0px_var(--ink)] hover:shadow-[6px_6px_0px_0px_var(--ink)] ${
                        formData.role === r.value ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{ background: r.color + '12' }}
                    >
                      <div className="w-10 h-10 rounded-xl border-[3px] border-[var(--ink)] flex items-center justify-center text-white mb-3 shadow-[2px_2px_0px_0px_var(--ink)]" style={{ background: r.color }}>
                        <r.icon size={18} />
                      </div>
                      <p className="font-bold text-sm">{r.label}</p>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{r.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg border-[2px] border-[var(--ink)] flex items-center justify-center text-white" style={{ background: roles.find(r => r.value === formData.role)?.color }}>
                    {(() => { const R = roles.find(r => r.value === formData.role); return R ? <R.icon size={14} /> : null; })()}
                  </div>
                  <span className="font-bold text-sm capitalize">{formData.role}</span>
                  <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-[var(--electric)] font-bold hover:underline">Change</button>
                </div>

                <NeuInput
                  label="Full Name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => update('name', e.target.value)}
                  icon={FiUser}
                  required
                />
                <NeuInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  icon={FiMail}
                  required
                />
                <NeuInput
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => update('password', e.target.value)}
                  icon={FiLock}
                  required
                />
                <NeuInput
                  label="Institution Code"
                  type="text"
                  placeholder="e.g. INST-001"
                  value={formData.institutionCode}
                  onChange={(e) => update('institutionCode', e.target.value)}
                  required
                />

                <div className="flex gap-3 pt-2">
                  <NeuButton
                    type="button"
                    variant="ghost"
                    icon={FiArrowLeft}
                    onClick={() => setStep(1)}
                    className="flex-shrink-0"
                  >
                    Back
                  </NeuButton>
                  <NeuButton
                    type="submit"
                    variant="primary"
                    className="flex-1 py-3"
                    loading={isLoading}
                    iconRight={FiArrowRight}
                  >
                    Create Account
                  </NeuButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm font-semibold">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--electric)] hover:underline">Sign in</Link>
          </div>
        </NeuCard>
      </motion.div>
    </div>
  );
}
