'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) { // Mobile breakpoint
        setIsCollapsed(true);
      } else if (width < 1024) { // Tablet breakpoint - auto-collapse if sidebar would be >50% of screen
        const sidebarWidth = 256; // Updated sidebar width
        if (sidebarWidth > width * 0.5) {
          setIsCollapsed(true);
        }
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const expandSidebar = () => {
    setIsCollapsed(false);
  };

  const collapseSidebar = () => {
    setIsCollapsed(true);
  };

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      toggleSidebar,
      expandSidebar,
      collapseSidebar,
    }}>
      {children}
    </SidebarContext.Provider>
  );
};
