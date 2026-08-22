'use client';

import clsx from 'clsx';
import { 
  FiCheckCircle, FiAward, FiCode, FiUsers, FiMessageSquare, 
  FiGithub, FiLinkedin, FiStar, FiBookOpen, FiTarget 
} from 'react-icons/fi';

const typeIcons = {
  assessment: FiCheckCircle,
  project_submission: FiCode,
  faculty_endorsement: FiAward,
  recruiter_feedback: FiStar,
  mock_interview: FiMessageSquare,
  debate_performance: FiUsers,
  github_analysis: FiGithub,
  linkedin_sync: FiLinkedin,
  peer_review: FiUsers,
  self_assessment: FiBookOpen,
  study_plan_completion: FiTarget,
};

const typeColors = {
  assessment: 'bg-[var(--electric)] text-white',
  project_submission: 'bg-[var(--acid)] text-[var(--ink)]',
  faculty_endorsement: 'bg-[var(--mint)] text-[var(--ink)]',
  recruiter_feedback: 'bg-[var(--hotpink)] text-white',
  mock_interview: 'bg-[var(--sky)] text-[var(--ink)]',
  debate_performance: 'bg-[var(--violet)] text-white',
  github_analysis: 'bg-[var(--ink)] text-white',
  linkedin_sync: 'bg-[var(--sky)] text-[var(--ink)]',
  peer_review: 'bg-[var(--amber)] text-[var(--ink)]',
  self_assessment: 'bg-[var(--paper)] text-[var(--ink)]',
  study_plan_completion: 'bg-[var(--mint)] text-[var(--ink)]',
};

const typeLabels = {
  assessment: 'Assessment',
  project_submission: 'Project',
  faculty_endorsement: 'Faculty',
  recruiter_feedback: 'Recruiter',
  mock_interview: 'Interview',
  debate_performance: 'Debate',
  github_analysis: 'GitHub',
  linkedin_sync: 'LinkedIn',
  peer_review: 'Peer Review',
  self_assessment: 'Self',
  study_plan_completion: 'Study Plan',
};

export default function EvidenceBadge({ type, className = '' }) {
  const Icon = typeIcons[type] || FiCheckCircle;
  const colorClass = typeColors[type] || 'bg-gray-200 text-gray-700';
  const label = typeLabels[type] || type;

  return (
    <span className={clsx('neu-badge', colorClass, className)}>
      <Icon size={12} />
      {label}
    </span>
  );
}
