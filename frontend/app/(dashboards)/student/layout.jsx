'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/store/authStore';
import Sidebar from '@/components/shared/Sidebar';
import Navbar from '@/components/shared/Navbar';
import SkeletonLoader from '@/components/shared/SkeletonLoader';

export default function StudentLayout({ children }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().then((u) => {
        if (!u) router.replace('/login');
        else if (u.role !== 'student') router.replace(`/${u.role}`);
      });
    } else if (user?.role !== 'student') {
      router.replace(`/${user.role}`);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader variant="card" count={3} className="w-full max-w-lg" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <Sidebar role="student" />
      <div className="lg:ml-64">
        <Navbar accent="var(--electric)" />
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
