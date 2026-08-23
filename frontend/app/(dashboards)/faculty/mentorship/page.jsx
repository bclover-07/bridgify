"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiUsers, FiArrowRight, FiUserCheck, FiPlusCircle, FiCheckCircle, FiSend } from 'react-icons/fi';
import api from '@/lib/api';

export default function MentorshipPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [pairs, setPairs] = useState([
    {
      mentor: { name: 'Ananya Sharma', email: 'ananya.sharma@mrdu.edu', cgpa: 9.2, role: 'Peer Mentor' },
      mentee: { name: 'Karthik Nair', email: 'karthik.nair@mrdu.edu', cgpa: 4.5, role: 'At-Risk Mentee' },
      focusTopic: 'Data Structures & Algorithms',
      status: 'Active Partnership',
    },
    {
      mentor: { name: 'Priya Patel', email: 'priya.patel@mrdu.edu', cgpa: 8.9, role: 'Peer Mentor' },
      mentee: { name: 'Rahul Verma', email: 'rahul.verma@mrdu.edu', cgpa: 7.8, role: 'Mentee' },
      focusTopic: 'Node.js Microservices',
      status: 'Active Partnership',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [mentorName, setMentorName] = useState('Ananya Sharma');
  const [menteeName, setMenteeName] = useState('Karthik Nair');
  const [focusTopic, setFocusTopic] = useState('Data Structures & Algorithms');
  const [toastMessage, setToastMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/faculty/courses')
      .then(res => {
        const fetched = res.data.courses || [];
        setCourses(fetched);
        if (fetched.length > 0) setSelectedCourse(fetched[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCreatePair = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const newPair = {
      mentor: { name: mentorName, email: 'mentor@mrdu.edu', cgpa: 9.0, role: 'Peer Mentor' },
      mentee: { name: menteeName, email: 'mentee@mrdu.edu', cgpa: 6.5, role: 'Mentee' },
      focusTopic,
      status: 'Active Partnership',
    };

    setPairs([newPair, ...pairs]);
    showToast(`Peer Mentorship Pair Created: ${mentorName} matched with ${menteeName}!`);
    setShowModal(false);
    setSubmitting(false);
  };

  return (
    <PageTransition className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-[var(--acid)] text-[var(--ink)] font-bold text-xs border-2 border-[var(--ink)] rounded-xl flex items-center justify-between shadow-[3px_3px_0px_#000]">
          <span className="flex items-center gap-2"><FiCheckCircle /> {toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="font-extrabold cursor-pointer">✕</button>
        </motion.div>
      )}

      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">🤝 Peer Mentorship & Advisory Hub</h1>
          <p className="text-gray-600 font-medium">Pair high-performing peer mentors with at-risk students for guided academic remediation</p>
        </div>

        <NeuButton variant="violet" size="sm" icon={FiPlusCircle} onClick={() => setShowModal(true)}>
          Assign Peer Mentorship Pair
        </NeuButton>
      </StaggerItem>

      {/* Active Mentorship Pairings List */}
      <StaggerItem className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Active Peer Mentorship Pairings ({pairs.length})</h2>
          <NeuBadge variant="success">Socket.io Live Sync</NeuBadge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pairs.map((pair, idx) => (
            <NeuCard key={idx} className="p-6 bg-white space-y-4 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000]">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs font-bold text-[var(--electric)] uppercase">Focus: {pair.focusTopic}</span>
                <NeuBadge variant="info">{pair.status}</NeuBadge>
              </div>

              <div className="flex items-center gap-4">
                {/* Mentor */}
                <div className="flex-1 p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-1">
                  <div className="w-8 h-8 rounded-full bg-[var(--mint)] border-2 border-[var(--ink)] flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#000]">
                    🎓
                  </div>
                  <p className="font-bold text-sm text-emerald-950">{pair.mentor?.name}</p>
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Mentor (CGPA: {pair.mentor?.cgpa})</p>
                </div>

                <FiArrowRight size={24} className="text-[var(--electric)] shrink-0" />

                {/* Mentee */}
                <div className="flex-1 p-3 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-1">
                  <div className="w-8 h-8 rounded-full bg-[var(--sky)] border-2 border-[var(--ink)] flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#000]">
                    📖
                  </div>
                  <p className="font-bold text-sm text-amber-950">{pair.mentee?.name}</p>
                  <p className="text-[10px] font-bold text-amber-800 uppercase">Mentee (CGPA: {pair.mentee?.cgpa})</p>
                </div>
              </div>
            </NeuCard>
          ))}
        </div>
      </StaggerItem>

      {/* Assign Mentor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-[4px] border-[var(--ink)] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-[8px_8px_0px_#000]">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-bold text-gray-900">🤝 Pair Peer Mentor & Mentee</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreatePair} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Peer Mentor (High Performer)</label>
                <select className="neu-select w-full text-sm bg-white" value={mentorName} onChange={e => setMentorName(e.target.value)}>
                  <option value="Ananya Sharma">Ananya Sharma (CGPA: 9.2)</option>
                  <option value="Priya Patel">Priya Patel (CGPA: 8.9)</option>
                  <option value="Arjun Reddy">Arjun Reddy (CGPA: 8.5)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Student Mentee (At-Risk / Target Student)</label>
                <select className="neu-select w-full text-sm bg-white" value={menteeName} onChange={e => setMenteeName(e.target.value)}>
                  <option value="Karthik Nair">Karthik Nair (CGPA: 4.5 - High Risk)</option>
                  <option value="Rahul Verma">Rahul Verma (CGPA: 7.8 - Medium Risk)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Focus Subject / Topic</label>
                <input type="text" required className="neu-input w-full text-sm bg-white" value={focusTopic} onChange={e => setFocusTopic(e.target.value)} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <NeuButton variant="ghost" onClick={() => setShowModal(false)}>Cancel</NeuButton>
                <NeuButton variant="violet" type="submit" loading={submitting} icon={FiSend}>Assign Pair & Dispatch Notifications</NeuButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
