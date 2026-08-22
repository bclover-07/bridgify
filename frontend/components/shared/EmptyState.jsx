'use client';

import { FiInbox, FiSearch, FiFileText, FiAlertCircle } from 'react-icons/fi';
import NeuButton from './NeuButton';

const icons = {
  empty: FiInbox,
  search: FiSearch,
  file: FiFileText,
  error: FiAlertCircle,
};

export default function EmptyState({
  icon = 'empty',
  title = 'Nothing here yet',
  description = '',
  action,
  actionLabel = 'Get Started',
  className = '',
}) {
  const IconComp = icons[icon] || icons.empty;
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}>
      <div className="w-20 h-20 bg-gray-100 border-[4px] border-[var(--ink)] rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_var(--ink)]">
        <IconComp size={32} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {description && <p className="text-gray-500 font-medium max-w-md mb-6">{description}</p>}
      {action && (
        <NeuButton variant="primary" onClick={action}>
          {actionLabel}
        </NeuButton>
      )}
    </div>
  );
}
