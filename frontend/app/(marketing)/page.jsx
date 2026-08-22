"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { FaGraduationCap, FaChalkboardTeacher, FaBuilding, FaUserTie, FaBrain, FaChartLine, FaRobot, FaNetworkWired, FaShieldAlt, FaArrowRight, FaCheck, FaStar } from 'react-icons/fa';
import NeuButton from '@/components/shared/NeuButton';
import NeuCard from '@/components/shared/NeuCard';
import dynamic from 'next/dynamic';

const ThreeModel = dynamic(() => import('@/components/shared/ThreeModel'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-[var(--paper)] border-[4px] border-[var(--ink)] rounded-3xl flex items-center justify-center font-bold text-lg">Loading 3D Engine...</div>
});

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.8, 0.25, 1] } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.8, 0.25, 1] } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.8, 0.25, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring', bounce: 0.4 } }
};

function AnimatedSection({ children, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ end, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {isInView ? end : 0}{suffix}
      </motion.span>
    </motion.span>
  );
}

const pipelineSteps = [
  { num: '01', title: 'Assess', desc: 'AI generates skill-mapped assessments aligned to industry standards', color: 'var(--electric)', icon: '📝' },
  { num: '02', title: 'Grade', desc: 'LangGraph agents auto-grade with rubric-based scoring + faculty override', color: 'var(--sky)', icon: '🤖' },
  { num: '03', title: 'Evidence', desc: 'Scores become verified entries on the Skill Evidence Graph (SEG)', color: 'var(--mint)', icon: '🔗' },
  { num: '04', title: 'Place', desc: 'Recruiters discover talent through semantic vector matching against SEG', color: 'var(--hotpink)', icon: '🎯' },
];

const dashboards = [
  {
    role: 'Student',
    title: 'Learner Portal',
    icon: FaGraduationCap,
    color: 'var(--electric)',
    bg: '#4B3AFF',
    features: ['Readiness Simulator', 'Mock Interview & Debate AI', 'Verified Skill Wallet', 'Benchmark Comparisons'],
    desc: 'Track readiness, take AI interviews, build your verified skill wallet.',
  },
  {
    role: 'Faculty',
    title: 'Classroom Hub',
    icon: FaChalkboardTeacher,
    color: 'var(--sky)',
    bg: '#3AC1FF',
    features: ['AI Assessment Generator', 'Dropout Radar', 'Cohort Heatmap', 'One-Click SEG Push'],
    desc: 'Generate assessments, spot at-risk students, push scores to SEG.',
  },
  {
    role: 'Admin',
    title: 'Command Center',
    icon: FaBuilding,
    color: 'var(--violet)',
    bg: '#A960FF',
    features: ['NAAC/NIRF Auto-Reports', 'Placement Kanban', 'Skill Ledger', 'Institution Analytics'],
    desc: 'Drive placements, auto-generate compliance reports, track skills.',
  },
  {
    role: 'Recruiter',
    title: 'Talent Exchange',
    icon: FaUserTie,
    color: 'var(--hotpink)',
    bg: '#FF3D9A',
    features: ['Semantic Vector Search', 'Bias-Free Hiring', 'PS Generator', 'Feedback Loop to SEG'],
    desc: 'Search verified talent with AI, generate problem statements.',
  },
];

const techStack = [
  { icon: FaBrain, title: '14 LangGraph Agents', desc: 'Specialized AI workflows for every task' },
  { icon: FaNetworkWired, title: 'Skill Evidence Graph', desc: 'Interoperable skill graph per student' },
  { icon: FaChartLine, title: 'Vector Search', desc: 'Semantic talent matching via embeddings' },
  { icon: FaRobot, title: 'MediaPipe + TTS', desc: 'Real-time AI mock interviews' },
  { icon: FaShieldAlt, title: 'Zero-Knowledge Wallet', desc: 'Student-controlled skill sharing' },
  { icon: FaStar, title: 'Recharts + D3', desc: 'Rich visual analytics and charts' },
];

const stats = [
  { value: '14', label: 'AI Agents', suffix: '' },
  { value: '4', label: 'Dashboards', suffix: '' },
  { value: '50+', label: 'Features', suffix: '' },
  { value: '100%', label: 'Evidence-Based', suffix: '' },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] overflow-hidden">
      {/* ─── NAV ─────────────────────────────── */}
      <nav className="w-full flex items-center justify-between px-6 py-4 border-b-[4px] border-[var(--ink)] bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[var(--electric)] border-[4px] border-[var(--ink)] flex items-center justify-center shadow-[3px_3px_0px_0px_var(--ink)]">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="font-bold text-xl tracking-tight">Bridgify</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="font-semibold hover:underline hidden sm:block text-sm">Log In</Link>
          <Link href="/login">
            <NeuButton variant="primary" size="sm">Try the Demo</NeuButton>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* ─── SECTION 1: HERO ──────────────── */}
        <section ref={heroRef} className="px-6 py-16 md:py-24 flex items-center relative min-h-[85vh]">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none dot-grid-bg" />
          <div className="absolute top-20 right-10 w-20 h-20 bg-[var(--acid)] rounded-full border-[4px] border-[var(--ink)] animate-float opacity-60 hidden lg:block" />
          <div className="absolute bottom-20 left-10 w-14 h-14 bg-[var(--hotpink)] rounded-lg border-[4px] border-[var(--ink)] rotate-12 animate-float hidden lg:block" style={{ animationDelay: '1s' }} />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-start text-left">
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-[4px] border-[var(--ink)] bg-[var(--acid)] mb-6 shadow-[4px_4px_0px_0px_var(--ink)] font-bold text-sm transform -rotate-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-black" />
                </span>
                Built for the National Hackathon
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] mb-6">
                We don&apos;t predict placement.{' '}
                <span className="gradient-text">We build the evidence</span> that makes it inevitable.
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 mb-8 font-medium max-w-xl">
                A single Grade → Skill → Readiness pipeline connecting students, faculty, administration, and recruiters in real-time.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/login" className="w-full sm:w-auto">
                  <NeuButton variant="primary" size="lg" className="w-full text-base md:text-lg px-6 md:px-8 py-3 md:py-4" iconRight={FaArrowRight}>
                    Enter Demo
                  </NeuButton>
                </Link>
                <Link href="#dashboards" className="w-full sm:w-auto">
                  <NeuButton variant="white" size="lg" className="w-full text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                    Explore Features
                  </NeuButton>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
              className="w-full hidden md:block"
            >
              <ThreeModel />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── SECTION 2: THE PROBLEM ───────── */}
        <section className="px-6 py-20 md:py-28 bg-[var(--ink)] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--electric)] rounded-full opacity-10 blur-3xl" />
          <AnimatedSection className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <span className="font-comic text-[var(--acid)] text-lg tracking-wider">THE PROBLEM</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl mt-2 mb-6 font-bold">Placement Prediction Is Broken</h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Every competitor optimizes the placement <em>moment</em>. They take a student&apos;s resume in year 4 and try to match it to a job. By then, it&apos;s too late.
              </p>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                We start <strong className="text-[var(--acid)]">upstream</strong>: at the syllabus and the assessment. When a student is graded, that grade immediately becomes a verified skill metric on a permanent, interoperable graph.
              </p>
              <div className="h-1 w-20 bg-[var(--acid)] rounded-full mt-6" />
            </motion.div>

            <motion.div variants={fadeInRight} className="relative">
              <div className="absolute inset-0 bg-[var(--electric)] rounded-3xl transform translate-x-3 translate-y-3 border-[4px] border-black" />
              <div className="relative bg-[var(--paper)] text-[var(--ink)] p-6 md:p-8 rounded-3xl border-[4px] border-black font-mono">
                <div className="flex items-center gap-2 mb-5 border-b-[3px] border-black pb-3">
                  <div className="w-3 h-3 rounded-full bg-[var(--coral)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--amber)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--mint)]" />
                  <span className="ml-2 text-xs font-bold text-gray-400">diff --status-quo vs bridgify</span>
                </div>
                {[
                  ['Predicting based on past data', 'Generating evidence in real-time'],
                  ['Siloed college portals', 'Interoperable Skill Evidence Graph'],
                  ['Blind recruiter searches', 'Semantic vector-based talent matching'],
                  ['Manual NAAC reports', 'AI-generated compliance documents'],
                ].map(([old, newItem], i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="text-[var(--coral)] font-bold text-sm">- {old}</div>
                    <div className="text-[var(--mint)] font-bold text-sm">+ {newItem}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatedSection>
        </section>

        {/* ─── SECTION 3: HOW IT WORKS ──────── */}
        <section className="px-6 py-20 md:py-28 bg-[var(--paper)]">
          <AnimatedSection className="max-w-6xl mx-auto">
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="font-comic text-[var(--electric)] text-lg tracking-wider">HOW IT WORKS</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">The Pipeline That Changes Everything</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">From assessment to placement in 4 automated steps.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pipelineSteps.map((step, i) => (
                <motion.div key={i} variants={scaleIn}>
                  <NeuCard className="p-6 bg-white h-full">
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-comic text-3xl" style={{ color: step.color }}>{step.num}</span>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">{step.desc}</p>
                    {i < 3 && (
                      <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-[var(--ink)] opacity-30 text-2xl font-bold">→</div>
                    )}
                  </NeuCard>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* ─── SECTION 4: FOUR DASHBOARDS ───── */}
        <section id="dashboards" className="px-6 py-20 md:py-28 bg-white border-y-[4px] border-[var(--ink)]">
          <AnimatedSection className="max-w-7xl mx-auto">
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="font-comic text-[var(--violet)] text-lg tracking-wider">DASHBOARDS</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">Four Dashboards, One Mission</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Every action feeds into the central Skill Evidence Graph.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {dashboards.map((d, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <NeuCard className="h-full bg-white group">
                    <div className="p-6 md:p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-10 transition-transform duration-500 group-hover:scale-125" style={{ background: d.bg }} />
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl border-[4px] border-[var(--ink)] flex items-center justify-center text-white mb-5 shadow-[6px_6px_0px_0px_var(--ink)]" style={{ background: d.bg }}>
                          <d.icon size={24} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-comic text-xs tracking-wider uppercase" style={{ color: d.bg }}>{d.role}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{d.title}</h3>
                        <p className="text-gray-600 mb-5 text-sm font-medium">{d.desc}</p>
                        <div className="space-y-2">
                          {d.features.map((f, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm font-semibold">
                              <div className="w-5 h-5 rounded-md flex items-center justify-center border-2 border-[var(--ink)]" style={{ background: d.bg }}>
                                <FaCheck size={10} className="text-white" />
                              </div>
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </NeuCard>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* ─── SECTION 5: TECH STACK ─────────── */}
        <section className="px-6 py-20 md:py-28 bg-[var(--mint)] border-b-[4px] border-[var(--ink)]">
          <AnimatedSection className="max-w-6xl mx-auto">
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="font-comic text-[var(--ink)] text-lg tracking-wider">TECHNOLOGY</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">Powered by Advanced AI</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {techStack.map((item, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  className="bg-white border-[4px] border-[var(--ink)] p-5 md:p-6 rounded-3xl shadow-[8px_8px_0px_0px_var(--ink)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_var(--ink)] transition-all"
                >
                  <div className="w-12 h-12 bg-[var(--paper)] rounded-xl flex items-center justify-center border-[3px] border-[var(--ink)] mb-4 shadow-[3px_3px_0px_0px_var(--ink)]">
                    <item.icon size={22} />
                  </div>
                  <h4 className="font-bold text-base mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* ─── SECTION 6: STATS COUNTER ──────── */}
        <section className="px-6 py-20 md:py-24 bg-[var(--ink)] text-white">
          <AnimatedSection className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((s, i) => (
                <motion.div key={i} variants={scaleIn} className="text-center">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold font-comic mb-2" style={{ color: ['var(--acid)', 'var(--electric)', 'var(--hotpink)', 'var(--mint)'][i] }}>
                    <CountUp end={s.value} suffix={s.suffix} />
                  </div>
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* ─── SECTION 7: TESTIMONIAL / USE CASES ─ */}
        <section className="px-6 py-20 md:py-28 bg-[var(--paper)]">
          <AnimatedSection className="max-w-6xl mx-auto">
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <span className="font-comic text-[var(--hotpink)] text-lg tracking-wider">USE CASES</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">Built for Real Impact</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { emoji: '🎓', title: 'Tier-2/3 Colleges', desc: 'Level the playing field. Students from any institution can showcase verified skills, not brand names.', color: 'var(--electric)' },
                { emoji: '🏢', title: 'Placement Officers', desc: 'Stop juggling spreadsheets. Manage placement drives, track stages, and auto-generate NAAC reports.', color: 'var(--violet)' },
                { emoji: '💼', title: 'Enterprise Recruiters', desc: 'Find the exact talent you need through semantic vector search against verified skill evidence.', color: 'var(--hotpink)' },
              ].map((uc, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <NeuCard className="p-6 md:p-8 bg-white h-full">
                    <div className="text-4xl mb-4">{uc.emoji}</div>
                    <h3 className="text-xl font-bold mb-3">{uc.title}</h3>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">{uc.desc}</p>
                  </NeuCard>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* ─── SECTION 8: CTA ────────────────── */}
        <section className="px-6 py-24 md:py-32 bg-[var(--electric)] text-white text-center relative overflow-hidden border-y-[4px] border-[var(--ink)]">
          <div className="absolute top-8 left-8 w-20 h-20 bg-[var(--acid)] rounded-full border-[4px] border-[var(--ink)] animate-float opacity-60" />
          <div className="absolute bottom-8 right-8 w-28 h-28 bg-[var(--hotpink)] rounded-lg transform rotate-12 border-[4px] border-[var(--ink)] opacity-40" />
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />

          <AnimatedSection className="relative z-10 max-w-2xl mx-auto">
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to see it live?</h2>
              <p className="text-xl mb-10 text-white/80 font-medium">Jump into the multi-role demo environment and experience the Skill Evidence Graph in action.</p>
              <Link href="/login">
                <NeuButton variant="acid" size="lg" className="text-lg px-10 py-5 mx-auto shadow-[8px_8px_0px_0px_var(--ink)]" iconRight={FaArrowRight}>
                  Launch Interactive Demo
                </NeuButton>
              </Link>
            </motion.div>
          </AnimatedSection>
        </section>
      </main>

      {/* ─── FOOTER ──────────────────────────── */}
      <footer className="border-t-[4px] border-[var(--ink)] bg-white px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--electric)] border-[3px] border-[var(--ink)] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <span className="font-bold text-lg">Bridgify</span>
          </div>
          <p className="font-semibold text-gray-400 text-sm">© 2026 Bridgify Platform · Built for the National Hackathon</p>
        </div>
      </footer>
    </div>
  );
}
