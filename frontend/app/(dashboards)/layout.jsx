"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Navbar from '@/components/shared/Navbar';
import useAuthStore from '@/lib/store/authStore';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, fetchMe } = useAuthStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user && !hasFetched.current) {
      hasFetched.current = true;
      fetchMe().then((fetchedUser) => {
        if (!fetchedUser) {
          router.push('/login');
        }
      }).catch(() => {
        router.push('/login');
      });
    }
  }, [user, fetchMe, router]);

  if (isLoading || (!user && !hasFetched.current)) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-[4px] border-[var(--ink)] border-t-[var(--electric)] rounded-full animate-spin shadow-[4px_4px_0px_0px_var(--ink)]" />
          <p className="font-bold text-gray-500">Loading Bridgify...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[var(--paper)] font-display">
      <Sidebar role={user.role} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Navbar user={user} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
