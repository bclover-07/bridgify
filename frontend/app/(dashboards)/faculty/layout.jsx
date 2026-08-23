'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/store/authStore';
import SkeletonLoader from '@/components/shared/SkeletonLoader';

export default function FacultyLayout({ children }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().then((u) => {
        if (!u) router.replace('/login');
        else if (u.role !== 'faculty') router.replace(`/${u.role}`);
      });
    } else if (user?.role !== 'faculty') {
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

  if (!isAuthenticated || user?.role !== 'faculty') return null;

  return <>{children}</>;
}
