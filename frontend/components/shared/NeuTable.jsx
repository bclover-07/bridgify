'use client';

import { useState } from 'react';
import { FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import NeuButton from './NeuButton';

export default function NeuTable({
  columns,
  data = [],
  onRowClick,
  emptyMessage = 'No data found',
  pageSize = 10,
  sortable = true,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  let sorted = [...data];
  if (sortKey) {
    sorted.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  if (data.length === 0) {
    return (
      <div className="neu-card-flat p-12 text-center">
        <p className="text-gray-500 font-semibold text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[var(--radius-card)] border-[var(--border-width)] border-[var(--ink)]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="bg-[var(--ink)] text-white px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ minWidth: col.width || 'auto' }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortable && col.sortable !== false && sortKey === col.key && (
                      sortDir === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                className={`border-b-2 border-[var(--ink)] last:border-b-0 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-[rgba(75,58,255,0.04)]' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm font-medium bg-white">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-500">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-2">
            <NeuButton
              variant="ghost"
              size="sm"
              icon={FiChevronLeft}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </NeuButton>
            <NeuButton
              variant="ghost"
              size="sm"
              iconRight={FiChevronRight}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </NeuButton>
          </div>
        </div>
      )}
    </div>
  );
}
