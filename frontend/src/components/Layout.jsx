import React, { useState } from 'react';
import Navbar from './Navbar';
import SidebarNav from './SidebarNav';

/**
 * Layout Component
 * Main layout wrapper for protected pages
 * Combines Navbar and Sidebar with content area
 * 
 * Props:
 * - children: Rendered page content
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      <Navbar onMenuToggle={handleMenuToggle} />
      
      <div className="layout-container">
        <SidebarNav isOpen={sidebarOpen} onClose={handleSidebarClose} />
        
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
