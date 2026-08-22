"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuTable from '@/components/shared/NeuTable';
import NeuBadge from '@/components/shared/NeuBadge';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiCopy, FiCheck, FiShare2, FiEye, FiClock } from 'react-icons/fi';
import api from '@/lib/api';

export default function WalletPage() {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [expiry, setExpiry] = useState('7');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [accessLog, setAccessLog] = useState([]);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    api.get('/student/seg').then(res => setSkills(res.data.nodes || [])).catch(() => {});
    api.get('/student/wallet/access-log').then(res => setAccessLog(res.data.log || res.data || [])).catch(() => {});
  }, []);

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]);
  };

  const handleShare = async () => {
    if (selectedSkills.length === 0) return;
    setSharing(true);
    try {
      const res = await api.post('/student/wallet/share', { skillIds: selectedSkills, expiryDays: parseInt(expiry) });
      setShareUrl(res.data.shareUrl || res.data.url || `${window.location.origin}/shared/${res.data.token || 'demo'}`);
    } catch (e) { console.error(e); }
    setSharing(false);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl font-bold mb-1">🛡️ Skill Wallet</h1>
        <p className="text-gray-500 font-medium">Share your verified skills with recruiters</p>
      </StaggerItem>

      <StaggerItem className="grid md:grid-cols-2 gap-6">
        <NeuCard className="p-5 bg-white">
          <h2 className="text-xl font-bold mb-4">Select Skills to Share</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {skills.length === 0 && <p className="text-gray-500 text-sm font-medium">No verified skills yet.</p>}
            {skills.map((skill, i) => (
              <button
                key={skill.skillId || i}
                className={`w-full text-left p-3 border-[3px] border-[var(--ink)] rounded-xl transition-all ${
                  selectedSkills.includes(skill.skillId) ? 'bg-[var(--electric)] text-white shadow-[4px_4px_0px_0px_var(--ink)]' : 'bg-[var(--paper)] hover:bg-gray-100'
                }`}
                onClick={() => toggleSkill(skill.skillId)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">{skill.skillName}</span>
                  <span className="font-mono font-bold text-sm">{skill.proficiencyScore}%</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div className="form-group">
              <label className="form-label">Link Expiry</label>
              <select className="neu-select" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <NeuButton variant="primary" className="w-full" onClick={handleShare} loading={sharing} icon={FiShare2} disabled={selectedSkills.length === 0}>
              Generate Share Link ({selectedSkills.length} skills)
            </NeuButton>
          </div>

          {shareUrl && (
            <div className="mt-4 p-3 border-[3px] border-[var(--mint)] rounded-xl bg-green-50">
              <p className="font-bold text-sm mb-2 text-[var(--mint)]">Share link generated!</p>
              <div className="flex gap-2">
                <input className="neu-input text-xs flex-1" value={shareUrl} readOnly />
                <NeuButton variant="mint" size="sm" onClick={copyUrl} icon={copied ? FiCheck : FiCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </NeuButton>
              </div>
            </div>
          )}
        </NeuCard>

        <NeuCard className="p-5 bg-white">
          <h2 className="text-xl font-bold mb-4">
            <FiEye className="inline mr-2" />Access Log
          </h2>
          {accessLog.length === 0 ? (
            <p className="text-gray-400 font-medium text-sm text-center py-8">No one has viewed your wallet yet</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {accessLog.map((log, i) => (
                <div key={i} className="p-3 border-[3px] border-[var(--ink)] rounded-xl bg-[var(--paper)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm">{log.viewerName || log.viewerEmail || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{log.viewerRole || 'Recruiter'}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FiClock size={12} />
                      {log.viewedAt ? new Date(log.viewedAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeuCard>
      </StaggerItem>
    </PageTransition>
  );
}
