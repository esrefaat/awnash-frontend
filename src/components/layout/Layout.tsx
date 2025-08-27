'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed 
            ? (isRTL ? 'mr-16' : 'ml-16')
            : (isRTL ? 'mr-64' : 'ml-64')
        }`}
      >
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main 
          className="p-0 dark:bg-gray-900 dark:text-white bg-gray-50 text-gray-900"
          style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}
        >
          <div className="mx-auto max-w-full">
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