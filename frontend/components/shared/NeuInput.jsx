'use client';

import clsx from 'clsx';

export default function NeuInput({ label, error, icon: Icon, className, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          id={inputId}
          className={clsx('neu-input', Icon && 'pl-10', error && 'border-[var(--coral)]', className)}
          {...props}
        />
      </div>
      {error && <p className="text-[var(--coral)] text-sm font-semibold">{error}</p>}
    </div>
  );
}

export function NeuTextarea({ label, error, className, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx('neu-textarea', error && 'border-[var(--coral)]', className)}
        {...props}
      />
      {error && <p className="text-[var(--coral)] text-sm font-semibold">{error}</p>}
    </div>
  );
}
