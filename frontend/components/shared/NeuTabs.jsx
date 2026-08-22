'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function NeuTabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={clsx('neu-tabs relative', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            className={clsx('neu-tab relative z-10', isActive && 'neu-tab-active')}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              {tab.icon && <tab.icon size={16} />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={clsx(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
                  isActive ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-600'
                )}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
