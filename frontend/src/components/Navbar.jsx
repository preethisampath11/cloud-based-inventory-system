import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Navbar Component
 * Top navigation bar with user info and logout
 * 
 * Props:
 * - onMenuToggle: Function to toggle sidebar on mobile
 */
const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.firstName || !user?.lastName) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="menu-toggle" 
          onClick={onMenuToggle}
          title="Toggle sidebar"
        >
          ☰
        </button>
        <div className="navbar-brand">
          <h1>Pharmacy Inventory</h1>
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          <div className="user-details">
            <p className="user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="user-role">
              {user?.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </div>

        <button 
          className="logout-btn" 
          onClick={handleLogout}
          title="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
