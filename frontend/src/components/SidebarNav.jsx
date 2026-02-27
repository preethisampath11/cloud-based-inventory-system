import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * SidebarNav Component
 * Sidebar navigation with active route highlighting
 * 
 * Props:
 * - isOpen: Boolean to show/hide sidebar on mobile
 * - onClose: Function to close sidebar on mobile
 */
const SidebarNav = ({ isOpen, onClose }) => {
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
    },
    {
      path: '/medicines',
      label: 'Medicines',
      icon: '💊',
    },
    {
      path: '/batches',
      label: 'Batches',
      icon: '📦',
    },
    {
      path: '/purchases',
      label: 'Purchases',
      icon: '🛒',
    },
    {
      path: '/sales',
      label: 'Sales',
      icon: '💰',
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📈',
    },
    {
      path: '/ai-assistant',
      label: 'AI Assistant',
      icon: '🤖',
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button 
            className="sidebar-close" 
            onClick={onClose}
            title="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-version">v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;
