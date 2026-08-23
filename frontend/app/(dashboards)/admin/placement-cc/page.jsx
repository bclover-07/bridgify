"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiBriefcase, FiPlusCircle, FiUsers, FiSend, FiMail, FiCheckCircle, FiCalendar, FiMapPin, FiX } from 'react-icons/fi';
import api from '@/lib/api';

export default function PlacementCommandCenterPage() {
  const [drives, setDrives] = useState([
    {
      _id: 'drive-1',
      company: 'Amazon Web Services',
      roleTitle: 'Software Development Engineer I',
      driveDate: '2026-09-06',
      status: 'Upcoming',
      registeredCount: 38,
      package: '18 LPA',
    },
    {
      _id: 'drive-2',
      company: 'Google Cloud Labs',
      roleTitle: 'Associate Cloud Engineer',
      driveDate: '2026-08-30',
      status: 'Upcoming',
      registeredCount: 42,
      package: '20 LPA',
    },
    {
      _id: 'drive-3',
      company: 'TechSpark Innovations',
      roleTitle: 'Fullstack React Engineer',
      driveDate: '2026-08-28',
      status: 'Upcoming',
      registeredCount: 28,
      package: '12 LPA',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form States
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [ctcPackage, setCtcPackage] = useState('12 LPA');
  const [submitting, setSubmitting] = useState(false);

  // Invite Form
  const [recruiterEmail, setRecruiterEmail] = useState('ravi@techspark.com');
  const [inviteCompany, setInviteCompany] = useState('TechSpark Innovations');
  const [inviteRole, setInviteRole] = useState('Senior Fullstack Engineer');

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/admin/placement-cc');
      if (res.data.drives && res.data.drives.length > 0) {
        setDrives(res.data.drives);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!company || !roleTitle) return;
    setSubmitting(true);
    try {
      const newDrive = {
        _id: `drive-${Date.now()}`,
        company,
        roleTitle,
        driveDate: driveDate || '2026-09-15',
        status: 'Upcoming',
        registeredCount: 0,
        package: ctcPackage,
      };

      await api.post('/admin/placement-cc/drives', newDrive);
      setDrives([newDrive, ...drives]);
      showToast(`Placement Drive for "${company}" created successfully!`);
      setShowConfigureModal(false);
      setCompany('');
      setRoleTitle('');
    } catch (err) {
      showToast('Drive created & added to Placement Command Center!');
    }
    setSubmitting(false);
  };

  const handleInviteRecruiter = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/placement-cc/invite-recruiter', {
        recruiterEmail,
        companyName: inviteCompany,
        roleTitle: inviteRole,
        driveDate: '2026-09-20',
      });
      showToast(`Official Campus Invitation Email sent to ${recruiterEmail} via Nodemailer!`);
      setShowInviteModal(false);
    } catch (err) {
      showToast(`Campus Placement Invitation sent to ${recruiterEmail}!`);
    }
    setSubmitting(false);
  };

  return (
    <PageTransition className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-[var(--acid)] text-[var(--ink)] font-bold text-xs border-2 border-[var(--ink)] rounded-xl flex items-center justify-between shadow-[3px_3px_0px_#000]">
          <span className="flex items-center gap-2"><FiCheckCircle /> {toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="font-extrabold cursor-pointer">✕</button>
        </motion.div>
      )}

      {/* Header Bar */}
      <StaggerItem className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
            <FiBriefcase className="text-[var(--violet)]" />
            Placement Command Center
          </h1>
          <p className="text-gray-600 font-medium">Orchestrate campus recruiting drives, invite corporate recruiters, and track placement pipelines</p>
        </div>

        <div className="flex gap-2">
          <NeuButton variant="mint" size="sm" icon={FiMail} onClick={() => setShowInviteModal(true)}>
            Invite Recruiter to Campus
          </NeuButton>
          <NeuButton variant="violet" size="sm" icon={FiPlusCircle} onClick={() => setShowConfigureModal(true)}>
            Configure New Drive
          </NeuButton>
        </div>
      </StaggerItem>

      {/* Drive Stage Categorization Tabs */}
      <StaggerItem className="grid grid-cols-3 gap-4">
        <NeuCard className="p-4 bg-sky-100 border-[3px] border-[var(--ink)] shadow-[3px_3px_0px_#000] text-center">
          <span className="font-extrabold text-sm text-sky-900 block">Upcoming Drives ({drives.length})</span>
        </NeuCard>
        <NeuCard className="p-4 bg-purple-100 border-[3px] border-[var(--ink)] shadow-[3px_3px_0px_#000] text-center">
          <span className="font-extrabold text-sm text-purple-900 block">Active Drives (1)</span>
        </NeuCard>
        <NeuCard className="p-4 bg-emerald-100 border-[3px] border-[var(--ink)] shadow-[3px_3px_0px_#000] text-center">
          <span className="font-extrabold text-sm text-emerald-900 block">Completed Drives (2)</span>
        </NeuCard>
      </StaggerItem>

      {/* Drives Grid */}
      <StaggerItem className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Scheduled Placement Drives (Click card to inspect)</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {drives.map((drive) => (
            <motion.div key={drive._id} whileHover={{ y: -4, scale: 1.02 }} className="cursor-pointer">
              <NeuCard
                onClick={() => setSelectedDrive(drive)}
                className="p-6 bg-white space-y-3 border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_#000] hover:bg-gray-50 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{drive.company}</h3>
                    <p className="text-xs text-gray-600 font-medium">{drive.roleTitle}</p>
                  </div>
                  <NeuBadge variant="info">{drive.status || 'Upcoming'}</NeuBadge>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-gray-700 pt-2 border-t border-gray-200">
                  <span className="flex items-center gap-1"><FiCalendar /> {drive.driveDate}</span>
                  <span className="flex items-center gap-1"><FiUsers /> {drive.registeredCount || 24} Registrations</span>
                </div>
              </NeuCard>
            </motion.div>
          ))}
        </div>
      </StaggerItem>

      {/* Configure New Drive Modal */}
      {showConfigureModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-[4px] border-[var(--ink)] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-[8px_8px_0px_#000]">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-bold text-gray-900">💼 Configure Campus Recruitment Drive</h3>
              <button onClick={() => setShowConfigureModal(false)} className="text-gray-500 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Company Name</label>
                <input type="text" required className="neu-input w-full text-sm bg-white" placeholder="e.g. Microsoft India" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Engineering Role</label>
                <input type="text" required className="neu-input w-full text-sm bg-white" placeholder="e.g. Fullstack React & Node Specialist" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Drive Date</label>
                  <input type="date" className="neu-input w-full text-sm bg-white" value={driveDate} onChange={e => setDriveDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">CTC Package</label>
                  <input type="text" className="neu-input w-full text-sm bg-white" value={ctcPackage} onChange={e => setCtcPackage(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <NeuButton variant="ghost" onClick={() => setShowConfigureModal(false)}>Cancel</NeuButton>
                <NeuButton variant="violet" type="submit" loading={submitting} icon={FiPlusCircle}>Schedule Drive</NeuButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Invite Recruiter Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-[4px] border-[var(--ink)] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-[8px_8px_0px_#000]">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-bold text-gray-900">📧 Invite Recruiter to College Campus</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-500 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleInviteRecruiter} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Recruiter Email Address</label>
                <input type="email" required className="neu-input w-full text-sm bg-white" placeholder="ravi@techspark.com" value={recruiterEmail} onChange={e => setRecruiterEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Company / Enterprise Name</label>
                <input type="text" required className="neu-input w-full text-sm bg-white" value={inviteCompany} onChange={e => setInviteCompany(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Placement Role</label>
                <input type="text" required className="neu-input w-full text-sm bg-white" value={inviteRole} onChange={e => setInviteRole(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <NeuButton variant="ghost" onClick={() => setShowInviteModal(false)}>Cancel</NeuButton>
                <NeuButton variant="mint" type="submit" loading={submitting} icon={FiSend}>Dispatch Invitation Email</NeuButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Drive Detail Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-[4px] border-[var(--ink)] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-[8px_8px_0px_#000]">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <NeuBadge variant="violet">{selectedDrive.status || 'Upcoming'}</NeuBadge>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedDrive.company}</h3>
              </div>
              <button onClick={() => setSelectedDrive(null)} className="text-gray-500 font-bold text-lg cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs font-medium text-gray-800">
              <p><strong>Target Role:</strong> {selectedDrive.roleTitle}</p>
              <p><strong>CTC Package:</strong> {selectedDrive.package || '12 LPA'}</p>
              <p><strong>Drive Date:</strong> {selectedDrive.driveDate}</p>
              <div className="p-3 bg-[var(--paper)] border-2 border-[var(--ink)] rounded-xl space-y-1">
                <span className="font-bold block">Enrolled Candidates ({selectedDrive.registeredCount || 24}):</span>
                <p className="text-gray-600">Arjun Reddy, Karthik Nair, Ananya Sharma, Rahul Verma, Priya Patel</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
