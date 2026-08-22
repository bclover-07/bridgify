'use client';

import clsx from 'clsx';

export default function NeuSelect({ label, error, options = [], placeholder, className, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={clsx('neu-select', error && 'border-[var(--coral)]', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {label}
            </option>
          );
        })}
      </select>
      {error && <p className="text-[var(--coral)] text-sm font-semibold">{error}</p>}
    </div>
  );
}
