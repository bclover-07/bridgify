"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaGraduationCap, FaChalkboardTeacher, FaBuilding, FaUserTie, FaBrain, FaChartLine, FaRobot, FaNetworkWired } from 'react-icons/fa';
import NeuButton from '@/components/shared/NeuButton';
import NeuCard from '@/components/shared/NeuCard';
import dynamic from 'next/dynamic';

const ThreeModel = dynamic(() => import('@/components/shared/ThreeModel'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-[var(--paper)] border-[3px] border-[var(--ink)] flex items-center justify-center font-bold text-lg">Loading 3D Engine...</div>
});
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] overflow-hidden">
      {/* Navigation */}
      <nav className="w-full flex items-center justify-between p-6 border-b-[3px] border-[var(--ink)] bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--electric)] border-2 border-[var(--ink)] flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Bridgify</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="font-semibold hover:underline hidden sm:block">Log In</Link>
          <Link href="/login">
            <NeuButton variant="primary">Try the Demo</NeuButton>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="px-6 py-20 md:py-32 flex flex-col items-center text-center relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--ink) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
          </div>
          
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="max-w-4xl relative z-10 flex flex-col items-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[var(--ink)] bg-[var(--acid)] mb-8 shadow-[4px_4px_0px_0px_var(--ink)] font-bold text-sm transform -rotate-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
              </span>
              Built for the National Hackathon
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
              We don't predict placement. <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--electric)] to-[var(--hotpink)]">We build the evidence</span> that makes it inevitable.
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-700 max-w-2xl mb-10 font-medium">
              A single Grade → Skill → Readiness pipeline connecting students, faculty, administration, and recruiters in real-time.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <NeuButton variant="primary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">Enter Demo Environment</NeuButton>
              </Link>
              <Link href="#dashboards">
                <NeuButton variant="ghost" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-white">Explore Dashboards</NeuButton>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* THE PROBLEM */}
        <section className="px-6 py-24 bg-[var(--ink)] text-white border-y-[3px] border-[var(--ink)] relative">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-4xl md:text-5xl mb-6">The Problem With Placement Prediction</h2>
                <p className="text-xl text-gray-300 mb-6">
                  Every competitor optimizes the placement moment. They take a student's resume in year 4 and try to match it to a job. By then, it's too late.
                </p>
                <p className="text-xl text-gray-300 mb-6">
                  We start upstream: at the syllabus and the assessment. When a student is graded, that grade immediately becomes a verified skill metric on a permanent, interoperable graph.
                </p>
                <div className="h-[3px] w-24 bg-[var(--acid)] mt-8"></div>
              </motion.div>
              <motion.div variants={fadeInUp} className="relative">
                <div className="absolute inset-0 bg-[var(--electric)] rounded-2xl transform translate-x-4 translate-y-4 border-3 border-black"></div>
                <div className="relative bg-[var(--paper)] text-[var(--ink)] p-8 rounded-2xl border-3 border-black font-mono">
                  <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-4">
                    <div className="w-3 h-3 rounded-full bg-[var(--coral)]"></div>
                    <div className="w-3 h-3 rounded-full bg-[var(--amber)]"></div>
                    <div className="w-3 h-3 rounded-full bg-[var(--mint)]"></div>
                  </div>
                  <div className="text-sm opacity-70 mb-2">Status Quo vs Bridgify</div>
                  <div className="mb-4">
                    <span className="text-[var(--coral)] font-bold">- Predicting based on past data</span><br/>
                    <span className="text-[var(--mint)] font-bold">+ Generating evidence in real-time</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-[var(--coral)] font-bold">- Siloed college portals</span><br/>
                    <span className="text-[var(--mint)] font-bold">+ Interoperable Skill Evidence Graph (SEG)</span>
                  </div>
                  <div>
                    <span className="text-[var(--coral)] font-bold">- Blind recruiter searches</span><br/>
                    <span className="text-[var(--mint)] font-bold">+ Semantic vector-based talent matching</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 4 DASHBOARDS */}
        <section id="dashboards" className="px-6 py-24 bg-[var(--paper)]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Four Dashboards, One Mission</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">A unified ecosystem where every action feeds into the central Skill Evidence Graph (SEG).</p>
            </div>
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Student */}
              <motion.div variants={fadeInUp}>
                <NeuCard className="h-full bg-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--electric)] rounded-bl-full opacity-10 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--electric)] border-2 border-[var(--ink)] flex items-center justify-center text-white mb-6 shadow-[4px_4px_0px_0px_var(--ink)]">
                      <FaGraduationCap size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Learner Portal</h3>
                    <p className="text-gray-600 mb-6">Students track their readiness against industry roles, take mock interviews, and build a verified skill wallet that proves their capability.</p>
                    <ul className="space-y-2 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--electric)]"></div> Readiness Simulator</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--electric)]"></div> Mock Interview & Debate AI</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--electric)]"></div> Verified Skill Wallet</li>
                    </ul>
                  </div>
                </NeuCard>
              </motion.div>

              {/* Faculty */}
              <motion.div variants={fadeInUp}>
                <NeuCard className="h-full bg-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--sky)] rounded-bl-full opacity-10 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--sky)] border-2 border-[var(--ink)] flex items-center justify-center text-[var(--ink)] mb-6 shadow-[4px_4px_0px_0px_var(--ink)]">
                      <FaChalkboardTeacher size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Classroom Hub</h3>
                    <p className="text-gray-600 mb-6">Faculty generate rubrics, grade assessments automatically, and instantly push verified scores to the student's central graph.</p>
                    <ul className="space-y-2 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sky)]"></div> AI Assessment Generator</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sky)]"></div> Dropout Radar (Predictive Risk)</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--sky)]"></div> One-Click SEG Push</li>
                    </ul>
                  </div>
                </NeuCard>
              </motion.div>

              {/* Admin */}
              <motion.div variants={fadeInUp}>
                <NeuCard className="h-full bg-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--violet)] rounded-bl-full opacity-10 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--violet)] border-2 border-[var(--ink)] flex items-center justify-center text-white mb-6 shadow-[4px_4px_0px_0px_var(--ink)]">
                      <FaBuilding size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Command Center</h3>
                    <p className="text-gray-600 mb-6">Institutions track overall skill health, auto-generate NAAC/NIRF compliance reports, and orchestrate placement drives via Kanban.</p>
                    <ul className="space-y-2 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--violet)]"></div> Auto-Generated NAAC Reports</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--violet)]"></div> Institutional Skill Ledger</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--violet)]"></div> Placement Drive Kanban</li>
                    </ul>
                  </div>
                </NeuCard>
              </motion.div>

              {/* Recruiter */}
              <motion.div variants={fadeInUp}>
                <NeuCard className="h-full bg-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--hotpink)] rounded-bl-full opacity-10 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--hotpink)] border-2 border-[var(--ink)] flex items-center justify-center text-white mb-6 shadow-[4px_4px_0px_0px_var(--ink)]">
                      <FaUserTie size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Talent Exchange</h3>
                    <p className="text-gray-600 mb-6">Recruiters execute semantic vector searches to find exact skill matches, eliminating bias and focusing purely on verified evidence.</p>
                    <ul className="space-y-2 font-medium">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--hotpink)]"></div> Semantic Vector Talent Search</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--hotpink)]"></div> Bias-Free Hiring Toggles</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--hotpink)]"></div> Problem Statement Generator</li>
                    </ul>
                  </div>
                </NeuCard>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* TECH STACK SECTION */}
        <section className="px-6 py-24 border-y-[3px] border-[var(--ink)] bg-[var(--mint)]">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Powered by Advanced AI</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: <FaBrain size={32} />, title: "14 LangGraph Agents", desc: "Specialized workflows" },
                { icon: <FaNetworkWired size={32} />, title: "Otari Gateway", desc: "Reliable AI routing" },
                { icon: <FaChartLine size={32} />, title: "Vector Search", desc: "Semantic skill matching" },
                { icon: <FaRobot size={32} />, title: "MediaPipe + TTS", desc: "Real-time mock interviews" },
              ].map((item, i) => (
                <div key={i} className="bg-white border-[3px] border-[var(--ink)] p-6 rounded-2xl shadow-[4px_4px_0px_0px_var(--ink)] transform transition hover:-translate-y-2">
                  <div className="w-14 h-14 bg-[var(--paper)] rounded-full flex items-center justify-center border-2 border-[var(--ink)] mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-6 py-32 bg-[var(--paper)] text-center relative overflow-hidden">
          <div className="absolute top-10 left-10 w-24 h-24 bg-[var(--acid)] rounded-full border-3 border-[var(--ink)] animate-bounce" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-[var(--electric)] rounded-none transform rotate-12 border-3 border-[var(--ink)]"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-5xl font-bold mb-8">Ready to see it live?</h2>
            <p className="text-xl mb-10 text-gray-700">Jump right into the multi-role simulation environment and experience the Skill Evidence Graph in action.</p>
            <Link href="/login">
              <NeuButton variant="primary" size="lg" className="text-xl px-12 py-5 bg-[var(--electric)] hover:bg-blue-700 w-full sm:w-auto shadow-[6px_6px_0px_0px_var(--ink)]">
                Launch Interactive Demo
              </NeuButton>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-[var(--ink)] bg-white p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--ink)]"></div>
            <span className="font-bold text-lg">Bridgify</span>
          </div>
          <p className="font-medium text-gray-500">© 2026 Bridgify Platform. Built for the National Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
