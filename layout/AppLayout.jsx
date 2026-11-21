import React from 'react';
import { Outlet } from '@/lib/router-compat';
import Navbar from './Navbar';

/**
 * @param {{ children?: import('react').ReactNode }} [props]
 */
export default function AppLayout({ children = undefined } = {}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="md:pt-16 pb-20 md:pb-8">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
