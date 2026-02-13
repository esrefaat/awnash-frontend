'use client';

import React, { useState } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isRTL } = useAppTranslation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`min-h-screen bg-background text-foreground ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed
            ? 'ms-16'
            : 'ms-64'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main
          className="p-6 bg-background text-foreground"
          style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}
        >
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 z-30 lg:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default Layout;
