"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Navbar from '@/components/shared/Navbar';
import useAuthStore from '@/lib/store/authStore';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, fetchMe } = useAuthStore();

  useEffect(() => {
    // Initial fetch to verify session
    if (!user && !isLoading) {
      fetchMe().catch(() => {
        router.push('/login');
      });
    }
  }, [user, isLoading, fetchMe, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--ink)] border-t-[var(--electric)] rounded-full animate-spin shadow-[4px_4px_0px_0px_var(--ink)]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-[var(--paper)] overflow-hidden font-display">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-72 h-full flex-shrink-0 border-r-[3px] border-[var(--ink)] bg-white z-20 shadow-[4px_0px_0px_0px_rgba(20,18,31,0.05)]">
        <Sidebar userRole={user.role} pathname={pathname} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar user={user} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[var(--paper)] pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar/Navigation (simplified bottom bar or drawer would go here) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-[3px] border-[var(--ink)] z-50 flex items-center justify-around px-4">
        {/* Simplified mobile nav rendering logic can go here */}
        <span className="text-sm font-bold text-gray-500">Mobile Nav Space</span>
      </div>
    </div>
  );
}
