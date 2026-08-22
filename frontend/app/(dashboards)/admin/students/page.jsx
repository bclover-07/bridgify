"use client";

import { useState, useEffect } from 'react';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import { DashboardSkeleton } from '@/components/shared/LoadingSpinner';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';
import { FiSearch, FiChevronLeft, FiChevronRight, FiUser, FiEdit } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (branch) params.set('branch', branch);
      if (year) params.set('year', year);
      const res = await api.get(`/admin/students?${params}`);
      setStudents(res.data.students || []);
      setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  return (
    <PageTransition className="space-y-6">
      <StaggerItem>
        <h1 className="text-3xl md:text-4xl font-bold mb-1">👥 Student Directory</h1>
        <p className="text-gray-500 font-medium">Browse and manage all students in your institution</p>
      </StaggerItem>

      <StaggerItem>
        <NeuCard className="p-5 bg-white">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input className="neu-input pl-10" placeholder="Search by name, email, or roll no..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="neu-select md:w-40" value={branch} onChange={e => setBranch(e.target.value)}>
              <option value="">All Branches</option>
              {['CSE', 'IT', 'ECE', 'AIML', 'EEE', 'ME', 'CE'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select className="neu-select md:w-32" value={year} onChange={e => setYear(e.target.value)}>
              <option value="">All Years</option>
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
            <NeuButton type="submit" variant="violet" icon={FiSearch}>Search</NeuButton>
          </form>
        </NeuCard>
      </StaggerItem>

      <StaggerItem>
        <NeuCard className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="neu-table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400 font-bold">Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400 font-bold">No students found</td></tr>
                ) : students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-[2px] border-[var(--ink)] bg-[var(--violet)] text-white flex items-center justify-center text-xs font-bold">
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{s.name}</p>
                          <p className="text-[10px] text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{s.student?.rollNo || '-'}</td>
                    <td><NeuBadge variant="info">{s.student?.branch || '-'}</NeuBadge></td>
                    <td className="font-bold">{s.student?.year || '-'}</td>
                    <td className="font-bold">{s.student?.cgpa || '-'}</td>
                    <td>
                      <NeuBadge variant={s.student?.placementStatus === 'placed' ? 'success' : 'default'}>
                        {s.student?.placementStatus?.replace('_', ' ') || 'N/A'}
                      </NeuBadge>
                    </td>
                    <td>
                      <Link href={`/admin/students/${s._id}`}>
                        <NeuButton size="xs" variant="ghost" icon={FiUser}>View</NeuButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t-[3px] border-[var(--ink)]">
              <p className="text-sm font-bold text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <NeuButton size="xs" variant="ghost" disabled={pagination.page <= 1} onClick={() => fetchStudents(pagination.page - 1)} icon={FiChevronLeft}>Prev</NeuButton>
                <NeuButton size="xs" variant="ghost" disabled={pagination.page >= pagination.pages} onClick={() => fetchStudents(pagination.page + 1)} iconRight={FiChevronRight}>Next</NeuButton>
              </div>
            </div>
          )}
        </NeuCard>
      </StaggerItem>
    </PageTransition>
  );
}
